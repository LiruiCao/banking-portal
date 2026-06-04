import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Transaction } from '../../models';

/**
 * All Transaction History intents, grouped by domain area.
 * Using createActionGroup (NgRx 14+) keeps the API surface cleaner than
 * declaring each action individually — one source of truth per feature slice.
 */
export const TransactionsActions = createActionGroup({
  source: 'Transactions',
  events: {
    // ---------- Load lifecycle ----------
    'Load Requested': emptyProps(),
    'Load Succeeded': props<{ transactions: readonly Transaction[] }>(),
    'Load Failed': props<{ error: string }>(),

    // ---------- Cross-feature recording ----------
    // Raised when another payments feature (e.g. e-transfer) produces a
    // transaction that should appear in history. See the bridge effect.
    'Transaction Recorded': props<{ transaction: Transaction }>(),
  },
});
