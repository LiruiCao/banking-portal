import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';

import { TransactionsEffects } from './transactions.effects';
import { TransactionsActions } from './transactions.actions';
import { ETransferActions } from '../e-transfer';
import { Account, ETransferReceipt, Recipient } from '../../models';

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

describe('TransactionsEffects', () => {
  let actions$: Observable<unknown>;
  let effects: TransactionsEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TransactionsEffects, provideMockActions(() => actions$)],
    });
    effects = TestBed.inject(TransactionsEffects);
  });

  describe('load$', () => {
    it('loads the mock history after the simulated latency', fakeAsync(() => {
      actions$ = of(TransactionsActions.loadRequested());

      let result: ReturnType<typeof TransactionsActions.loadSucceeded> | undefined;
      effects.load$.subscribe((a) => (result = a as typeof result));
      tick(600);

      expect(result?.type).toBe('[Transactions] Load Succeeded');
      expect(result?.transactions.length).toBe(5);
    }));
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
