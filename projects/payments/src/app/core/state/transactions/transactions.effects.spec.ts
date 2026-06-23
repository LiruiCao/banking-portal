import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Observable, of } from 'rxjs';

import { TransactionsEffects } from './transactions.effects';
import { TransactionsActions } from './transactions.actions';
import { selectStatus } from './transactions.selectors';
import { ETransferActions } from '../e-transfer';
import { TransactionApiService } from '../../services';
import { Account, ETransferReceipt, Recipient, Transaction } from '../../models';

const RECIPIENT: Recipient = {
  id: 'rec_02',
  name: 'Marcus Rivera',
  channel: 'email',
  handle: 'm@x.com',
  autoDeposit: false,
};
const ACCOUNT: Account = {
  id: 'acc_01',
  kind: 'chequing',
  nickname: 'Chq',
  maskedNumber: '****1',
  balanceCents: 100000,
  currency: 'CAD',
};

const receipt = (autoDeposit: boolean): ETransferReceipt => ({
  confirmationNumber: 'ETR-20260601-ABCDE',
  submittedAt: '2026-06-01T10:00:00Z',
  request: {
    recipient: { ...RECIPIENT, autoDeposit },
    fromAccount: ACCOUNT,
    amountCents: 5000,
    memo: 'rent',
    securityQuestion: null,
    securityAnswer: null,
  },
});

const API_TRANSACTIONS: readonly Transaction[] = [
  {
    id: 'txn_api_01',
    date: '2026-05-28T14:22:00Z',
    recipientName: 'Emily Chen',
    amountCents: 125_00,
    currency: 'CAD',
    status: 'completed',
  },
];

describe('TransactionsEffects', () => {
  let actions$: Observable<unknown>;
  let effects: TransactionsEffects;
  let store: MockStore;
  // The data-access seam is stubbed: the effect's job is orchestration
  // (idle guard + mapping), not where the rows come from.
  const api = { load: jest.fn(() => of(API_TRANSACTIONS)) };

  beforeEach(() => {
    api.load.mockClear();
    TestBed.configureTestingModule({
      providers: [
        TransactionsEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          selectors: [{ selector: selectStatus, value: 'idle' }],
        }),
        { provide: TransactionApiService, useValue: api },
      ],
    });
    store = TestBed.inject(MockStore);
    effects = TestBed.inject(TransactionsEffects);
  });

  describe('load$', () => {
    it('loads from the api and maps to loadSucceeded when status is idle', (done) => {
      actions$ = of(TransactionsActions.loadRequested());

      effects.load$.subscribe((action) => {
        expect(action).toEqual(
          TransactionsActions.loadSucceeded({ transactions: API_TRANSACTIONS }),
        );
        expect(api.load).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('is a no-op when the history is already loaded (idle guard)', () => {
      store.overrideSelector(selectStatus, 'loaded');
      store.refreshState();
      actions$ = of(TransactionsActions.loadRequested());

      let emitted = false;
      effects.load$.subscribe(() => (emitted = true));

      expect(emitted).toBe(false);
      expect(api.load).not.toHaveBeenCalled();
    });
  });

  describe('recordETransfer$ (cross-feature bridge)', () => {
    it('maps a successful e-transfer into a recorded transaction', (done) => {
      actions$ = of(ETransferActions.submitSucceeded({ receipt: receipt(false) }));

      effects.recordETransfer$.subscribe((action) => {
        expect(action.type).toBe('[Transactions] Transaction Recorded');
        const t = (action as ReturnType<typeof TransactionsActions.transactionRecorded>)
          .transaction;
        expect(t).toMatchObject({
          id: 'ETR-20260601-ABCDE',
          recipientName: 'Marcus Rivera',
          amountCents: 5000,
          currency: 'CAD',
          status: 'pending', // non auto-deposit → pending until accepted
        });
        done();
      });
    });

    it('marks auto-deposit transfers as completed (instant settlement)', (done) => {
      actions$ = of(ETransferActions.submitSucceeded({ receipt: receipt(true) }));

      effects.recordETransfer$.subscribe((action) => {
        const t = (action as ReturnType<typeof TransactionsActions.transactionRecorded>)
          .transaction;
        expect(t.status).toBe('completed');
        done();
      });
    });
  });
});
