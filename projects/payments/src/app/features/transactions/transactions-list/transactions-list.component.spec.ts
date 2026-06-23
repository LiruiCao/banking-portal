import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';

import { TransactionsListComponent } from './transactions-list.component';
import { TransactionFacade } from '../../../core/state/transactions';
import { Transaction } from '../../../core/models';

const SAMPLE_TRANSACTIONS: readonly Transaction[] = [
  {
    id: 'txn_test_01',
    date: '2026-05-28T14:22:00Z',
    recipientName: 'Emily Chen',
    amountCents: 125_00,
    currency: 'CAD',
    status: 'completed',
  },
  {
    id: 'txn_test_02',
    date: '2026-05-24T09:10:00Z',
    recipientName: 'Marcus Rivera',
    amountCents: 1_450_00,
    currency: 'CAD',
    status: 'pending',
  },
];

describe('TransactionsListComponent', () => {
  // The component talks only to the facade — no Store, actions, or selectors in
  // sight — so the test stubs the facade and never wires up NgRx at all.
  let transactions$: BehaviorSubject<readonly Transaction[]>;
  let facade: {
    transactions$: BehaviorSubject<readonly Transaction[]>;
    isLoading$: ReturnType<typeof of<boolean>>;
    error$: ReturnType<typeof of<string | null>>;
    load: jest.Mock;
  };

  beforeEach(async () => {
    transactions$ = new BehaviorSubject<readonly Transaction[]>(SAMPLE_TRANSACTIONS);
    facade = {
      transactions$,
      isLoading$: of(false),
      error$: of(null),
      load: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [TransactionsListComponent],
      providers: [{ provide: TransactionFacade, useValue: facade }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TransactionsListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should ask the facade to load on init (the idle guard lives in the effect)', () => {
    TestBed.createComponent(TransactionsListComponent);
    expect(facade.load).toHaveBeenCalledTimes(1);
  });

  it('should render one row per transaction with recipient and CAD amount', () => {
    const fixture = TestBed.createComponent(TransactionsListComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const rows = compiled.querySelectorAll('tbody tr.transactions__row');
    expect(rows.length).toBe(SAMPLE_TRANSACTIONS.length);

    const firstRowText = rows[0].textContent ?? '';
    expect(firstRowText).toContain('Emily Chen');
    expect(firstRowText).toContain('125.00');
    expect(firstRowText).toContain('completed');
  });

  it('should show an empty message when there are no transactions', () => {
    transactions$.next([]);

    const fixture = TestBed.createComponent(TransactionsListComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.transactions__empty')?.textContent).toContain(
      'No transactions yet.',
    );
  });
});
