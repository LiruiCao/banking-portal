import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, delay, map, switchMap } from 'rxjs/operators';

import { TransactionsActions } from './transactions.actions';
import { ETransferActions } from '../e-transfer';
import { ETransferReceipt, Transaction } from '../../models';

@Injectable()
export class TransactionsEffects {
  private readonly actions$ = inject(Actions);

  readonly load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionsActions.loadRequested),
      // switchMap: cancel previous on re-load
      // (vs exhaustMap which is for submits)
      switchMap(() =>
        of(MOCK_TRANSACTIONS).pipe(
          delay(600), // simulate network latency
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

/**
 * Hardcoded mock history. Lives in the effect (not the reducer's initial state)
 * so the component goes through the real idle → loading → loaded lifecycle.
 * amountCents uses numeric separators so the dollar value is readable at a glance.
 */
const MOCK_TRANSACTIONS: readonly Transaction[] = [
  {
    id: 'txn_01',
    date: '2026-05-28T14:22:00Z',
    recipientName: 'Emily Chen',
    amountCents: 125_00, // $125.00
    currency: 'CAD',
    status: 'completed',
  },
  {
    id: 'txn_02',
    date: '2026-05-24T09:10:00Z',
    recipientName: 'Marcus Rivera',
    amountCents: 1_450_00, // $1,450.00
    currency: 'CAD',
    status: 'completed',
  },
  {
    id: 'txn_03',
    date: '2026-05-21T18:45:00Z',
    recipientName: 'Priya Sharma',
    amountCents: 75_50, // $75.50
    currency: 'CAD',
    status: 'pending',
  },
  {
    id: 'txn_04',
    date: '2026-05-17T11:03:00Z',
    recipientName: 'David Tremblay',
    amountCents: 3_000_00, // $3,000.00 — at the per-transfer limit
    currency: 'CAD',
    status: 'completed',
  },
  {
    id: 'txn_05',
    date: '2026-05-12T16:30:00Z',
    recipientName: 'Marcus Rivera',
    amountCents: 220_00, // $220.00
    currency: 'CAD',
    status: 'failed',
  },
];
