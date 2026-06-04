import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { TransactionsListComponent } from './transactions-list.component';
import {
  TransactionsActions,
  selectError,
  selectIsLoading,
  selectStatus,
  selectTransactions,
} from '../../../core/state/transactions';
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
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionsListComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectTransactions, value: SAMPLE_TRANSACTIONS },
            { selector: selectIsLoading, value: false },
            { selector: selectError, value: null },
            { selector: selectStatus, value: 'idle' },
          ],
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TransactionsListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should dispatch loadRequested on init when status is idle', () => {
    const dispatchSpy = spyOn(store, 'dispatch');
    TestBed.createComponent(TransactionsListComponent);
    expect(dispatchSpy).toHaveBeenCalledWith(
      TransactionsActions.loadRequested(),
    );
  });

  it('should NOT reload when history is already loaded (persisted slice)', () => {
    store.overrideSelector(selectStatus, 'loaded');
    store.refreshState();

    const dispatchSpy = spyOn(store, 'dispatch');
    TestBed.createComponent(TransactionsListComponent);
    expect(dispatchSpy).not.toHaveBeenCalled();
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
    store.overrideSelector(selectTransactions, []);
    store.refreshState();

    const fixture = TestBed.createComponent(TransactionsListComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.transactions__empty')?.textContent).toContain(
      'No transactions yet.',
    );
  });
});
