import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  TRANSACTIONS_FEATURE_KEY,
  TransactionsState,
} from './transactions.reducer';

/**
 * Root selector — grabs the entire transactions slice from the store.
 * All other selectors compose off this one.
 */
export const selectTransactionsState =
  createFeatureSelector<TransactionsState>(TRANSACTIONS_FEATURE_KEY);

// ---------- Slice selectors ----------

export const selectTransactions = createSelector(
  selectTransactionsState,
  (state) => state.transactions,
);

export const selectStatus = createSelector(
  selectTransactionsState,
  (state) => state.status,
);

export const selectError = createSelector(
  selectTransactionsState,
  (state) => state.error,
);

// ---------- UI-level selectors (convenience composites) ----------

export const selectIsLoading = createSelector(
  selectStatus,
  (status) => status === 'loading',
);

export const selectHasTransactions = createSelector(
  selectTransactions,
  (transactions) => transactions.length > 0,
);
