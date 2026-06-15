import { transactionsReducer, initialState } from './transactions.reducer';
import { TransactionsActions } from './transactions.actions';
import { Transaction } from '../../models';

const txn = (id: string): Transaction => ({
  id,
  date: '2026-05-01T00:00:00Z',
  recipientName: 'Test',
  amountCents: 1000,
  currency: 'CAD',
  status: 'completed',
});

describe('transactionsReducer', () => {
  it('starts idle with no transactions', () => {
    expect(initialState.status).toBe('idle');
    expect(initialState.transactions).toEqual([]);
  });

  it('loadRequested moves to loading and clears errors', () => {
    const state = transactionsReducer(
      { ...initialState, error: 'old' },
      TransactionsActions.loadRequested(),
    );
    expect(state.status).toBe('loading');
    expect(state.error).toBeNull();
  });

  it('loadSucceeded appends history beneath existing session entries', () => {
    // A transaction recorded this session before history first loaded.
    const recorded = { ...initialState, transactions: [txn('live')] };
    const state = transactionsReducer(
      recorded,
      TransactionsActions.loadSucceeded({ transactions: [txn('hist')] }),
    );
    expect(state.transactions.map((t) => t.id)).toEqual(['live', 'hist']);
    expect(state.status).toBe('loaded');
  });

  it('loadFailed records the error', () => {
    const state = transactionsReducer(
      { ...initialState, status: 'loading' },
      TransactionsActions.loadFailed({ error: 'offline' }),
    );
    expect(state.status).toBe('error');
    expect(state.error).toBe('offline');
  });

  it('transactionRecorded prepends the newest transaction', () => {
    const seeded = { ...initialState, transactions: [txn('old')] };
    const state = transactionsReducer(
      seeded,
      TransactionsActions.transactionRecorded({ transaction: txn('new') }),
    );
    expect(state.transactions.map((t) => t.id)).toEqual(['new', 'old']);
  });
});
