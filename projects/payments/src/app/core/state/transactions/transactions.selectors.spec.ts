import {
  selectError,
  selectHasTransactions,
  selectIsLoading,
  selectStatus,
  selectTransactions,
} from './transactions.selectors';
import { TransactionsState } from './transactions.reducer';
import { Transaction } from '../../models';

const txn: Transaction = {
  id: 't1',
  date: '2026-05-01T00:00:00Z',
  recipientName: 'Test',
  amountCents: 1000,
  currency: 'CAD',
  status: 'completed',
};

const state = (over: Partial<TransactionsState> = {}): TransactionsState => ({
  transactions: [],
  status: 'idle',
  error: null,
  ...over,
});

describe('transactions selectors', () => {
  it('selectTransactions returns the list', () => {
    expect(selectTransactions.projector(state({ transactions: [txn] }))).toEqual([txn]);
  });

  it('selectStatus / selectError expose the slice fields', () => {
    expect(selectStatus.projector(state({ status: 'error' }))).toBe('error');
    expect(selectError.projector(state({ error: 'boom' }))).toBe('boom');
  });

  it('selectIsLoading is true only while loading', () => {
    expect(selectIsLoading.projector('loading')).toBe(true);
    expect(selectIsLoading.projector('loaded')).toBe(false);
  });

  it('selectHasTransactions reflects whether the list is non-empty', () => {
    expect(selectHasTransactions.projector([])).toBe(false);
    expect(selectHasTransactions.projector([txn])).toBe(true);
  });
});
