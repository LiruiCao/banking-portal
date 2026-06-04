import { createReducer, on } from '@ngrx/store';
import { TransactionsActions } from './transactions.actions';
import { Transaction } from '../../models';

export type TransactionsLoadStatus = 'idle' | 'loading' | 'loaded' | 'error';
// load 生命周期用 union type 表达,而不是多个 boolean。
// 同 e-transfer 的 ETransferStatus —— "stop using isLoading booleans"。
// 注意:这是"列表加载"的状态机,跟单笔交易自身的 TransactionStatus(core/models)是两回事。

export interface TransactionsState {
  readonly transactions: readonly Transaction[];
  readonly status: TransactionsLoadStatus;
  readonly error: string | null;
}

export const TRANSACTIONS_FEATURE_KEY = 'transactions';

export const initialState: TransactionsState = {
  transactions: [],
  status: 'idle',
  error: null,
};

export const transactionsReducer = createReducer(
  initialState,

  // ---------- Load lifecycle ----------
  on(TransactionsActions.loadRequested, (state) => ({
    ...state,
    status: 'loading' as const,
    error: null,
  })),

  on(TransactionsActions.loadSucceeded, (state, { transactions }) => ({
    ...state,
    // Seed the loaded history *beneath* anything already recorded this session
    // (e.g. an e-transfer submitted before the list was first opened), so the
    // mock never clobbers user-generated entries. Load fires once (idle-guarded
    // in the component), so this never duplicates the mock.
    transactions: [...state.transactions, ...transactions],
    status: 'loaded' as const,
    error: null,
  })),

  on(TransactionsActions.loadFailed, (state, { error }) => ({
    ...state,
    status: 'error' as const,
    error,
  })),

  // A transaction produced elsewhere (e.g. a successful e-transfer) is prepended
  // as the newest entry.
  on(TransactionsActions.transactionRecorded, (state, { transaction }) => ({
    ...state,
    transactions: [transaction, ...state.transactions],
  })),
);
