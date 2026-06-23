import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import {
  catchError,
  filter,
  map,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';

import { TransactionsActions } from './transactions.actions';
import { selectStatus } from './transactions.selectors';
import { ETransferActions } from '../e-transfer';
import { TransactionApiService } from '../../services';
import { ETransferReceipt, Transaction } from '../../models';

@Injectable()
export class TransactionsEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly api = inject(TransactionApiService);

  readonly load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionsActions.loadRequested),
      // Idle guard, sunk down from the component: only the first entry actually
      // hits the network. The slice persists across features, so re-opening the
      // list while already 'loaded'/'loading' is a no-op — otherwise the mock
      // reload would clobber e-transfers recorded since. Callers just fire
      // load() unconditionally; the rule lives here.
      withLatestFrom(this.store.select(selectStatus)),
      filter(([, status]) => status === 'idle'),
      // switchMap: cancel previous on re-load
      // (vs exhaustMap which is for submits)
      switchMap(() =>
        this.api.load().pipe(
          map((transactions) =>
            TransactionsActions.loadSucceeded({ transactions }),
          ),
          catchError((err: unknown) => {
            const message =
              err instanceof Error ? err.message : 'Failed to load transactions';
            return of(TransactionsActions.loadFailed({ error: message }));
          }),
        ),
      ),
    ),
  );

  /**
   * Bridge effect: transactions is the aggregator of payment history, so it
   * listens for domain events from each payment feature. Here, a successful
   * e-Transfer is mapped into a Transaction and recorded.
   *
   * Dependency direction is transactions → e-transfer (the wizard stays
   * unaware of history). When Bill Payments lands, add a sibling listener here.
   */
  readonly recordETransfer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ETransferActions.submitSucceeded),
      map(({ receipt }) =>
        TransactionsActions.transactionRecorded({
          transaction: receiptToTransaction(receipt),
        }),
      ),
    ),
  );
}

function receiptToTransaction(receipt: ETransferReceipt): Transaction {
  return {
    id: receipt.confirmationNumber,
    date: receipt.submittedAt,
    recipientName: receipt.request.recipient.name,
    amountCents: receipt.request.amountCents,
    currency: receipt.request.fromAccount.currency,
    // Auto-deposit recipients settle instantly; everyone else is pending until
    // the recipient accepts. Reuses the same domain rule as the wizard.
    status: receipt.request.recipient.autoDeposit ? 'completed' : 'pending',
  };
}
