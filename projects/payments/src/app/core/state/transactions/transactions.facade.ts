import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Transaction } from '../../models/transaction.model';
import { TransactionsActions } from './transactions.actions';
import { TransactionsLoadStatus } from './transactions.reducer';
import {
  selectError,
  selectHasTransactions,
  selectIsLoading,
  selectStatus,
  selectTransactions,
} from './transactions.selectors';

/**
 * CQRS facade over the transactions slice.
 *
 * Query side  → readonly `Observable` properties (suffixed `$`). Read-only views
 *               of the store; subscribing never mutates anything.
 * Command side → methods that return `void`. They express intent by dispatching
 *               actions; callers get no value back.
 *
 * Components depend only on this facade and never see `Store`, actions, or
 * selectors — the NgRx wiring stays an implementation detail behind this seam.
 */
@Injectable({ providedIn: 'root' })
export class TransactionFacade {
  private readonly store = inject(Store);

  // ── Queries ──────────────────────────────────────────────────────────────
  readonly transactions$: Observable<readonly Transaction[]> =
    this.store.select(selectTransactions);

  readonly status$: Observable<TransactionsLoadStatus> =
    this.store.select(selectStatus);

  readonly isLoading$: Observable<boolean> =
    this.store.select(selectIsLoading);

  readonly hasTransactions$: Observable<boolean> =
    this.store.select(selectHasTransactions);

  readonly error$: Observable<string | null> = this.store.select(selectError);

  // ── Commands ─────────────────────────────────────────────────────────────
  /** Ask the store to (re)load the transaction history. */
  load(): void {
    this.store.dispatch(TransactionsActions.loadRequested());
  }

  /** Append a freshly completed transaction to the history. */
  record(transaction: Transaction): void {
    this.store.dispatch(TransactionsActions.transactionRecorded({ transaction }));
  }
}
