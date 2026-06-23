import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { firstValueFrom } from 'rxjs';

import { TransactionFacade } from './transactions.facade';
import { TransactionsActions } from './transactions.actions';
import {
  selectError,
  selectHasTransactions,
  selectIsLoading,
  selectStatus,
  selectTransactions,
} from './transactions.selectors';
import { Transaction } from '../../models';

const SAMPLE: readonly Transaction[] = [
  {
    id: 'txn_01',
    date: '2026-05-28T14:22:00Z',
    recipientName: 'Emily Chen',
    amountCents: 125_00,
    currency: 'CAD',
    status: 'completed',
  },
];

describe('TransactionFacade', () => {
  let facade: TransactionFacade;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectTransactions, value: SAMPLE },
            { selector: selectStatus, value: 'loaded' },
            { selector: selectIsLoading, value: false },
            { selector: selectHasTransactions, value: true },
            { selector: selectError, value: null },
          ],
        }),
      ],
    });
    store = TestBed.inject(MockStore);
    facade = TestBed.inject(TransactionFacade);
  });

  describe('queries', () => {
    it('exposes transactions$ from the store selector', async () => {
      await expect(firstValueFrom(facade.transactions$)).resolves.toEqual(SAMPLE);
    });

    it('exposes status$, isLoading$, hasTransactions$ and error$', async () => {
      await expect(firstValueFrom(facade.status$)).resolves.toBe('loaded');
      await expect(firstValueFrom(facade.isLoading$)).resolves.toBe(false);
      await expect(firstValueFrom(facade.hasTransactions$)).resolves.toBe(true);
      await expect(firstValueFrom(facade.error$)).resolves.toBeNull();
    });
  });

  describe('commands', () => {
    it('load() dispatches loadRequested', () => {
      const dispatch = jest.spyOn(store, 'dispatch');
      facade.load();
      expect(dispatch).toHaveBeenCalledWith(TransactionsActions.loadRequested());
    });

    it('record() dispatches transactionRecorded with the transaction', () => {
      const dispatch = jest.spyOn(store, 'dispatch');
      facade.record(SAMPLE[0]);
      expect(dispatch).toHaveBeenCalledWith(
        TransactionsActions.transactionRecorded({ transaction: SAMPLE[0] }),
      );
    });
  });
});
