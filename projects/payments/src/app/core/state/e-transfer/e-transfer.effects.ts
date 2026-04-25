
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, delay, exhaustMap, map, withLatestFrom } from 'rxjs/operators';

import { ETransferActions } from './e-transfer.actions';
import {
  selectDraft,
  selectSelectedAccount,
  selectSelectedRecipient,
} from './e-transfer.selectors';
import { ETransferReceipt, ETransferRequest } from '../../models';

@Injectable()
export class ETransferEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);

  readonly submit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ETransferActions.submitRequested),
      withLatestFrom(
        this.store.select(selectDraft),
        this.store.select(selectSelectedRecipient),
        this.store.select(selectSelectedAccount),
      ),
      exhaustMap(([, draft, recipient, account]) => {
        if (!recipient || !account || draft.amountCents === null) {
          return of(
            ETransferActions.submitFailed({ error: 'Transfer is incomplete' }),
          );
        }

        const request: ETransferRequest = {
          recipient,
          fromAccount: account,
          amountCents: draft.amountCents,
          memo: draft.memo,
          securityQuestion: recipient.autoDeposit ? null : draft.securityQuestion,
          securityAnswer: recipient.autoDeposit ? null : draft.securityAnswer,
        };

        const receipt: ETransferReceipt = {
          confirmationNumber: generateConfirmationNumber(),
          submittedAt: new Date().toISOString(),
          request,
        };

        return of(receipt).pipe(
          delay(900),
          map((r) => ETransferActions.submitSucceeded({ receipt: r })),
          catchError((err: unknown) => {
            const message = err instanceof Error ? err.message : 'Transfer failed';
            return of(ETransferActions.submitFailed({ error: message }));
          }),
        );
      }),
    ),
  );
}

function generateConfirmationNumber(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ETR-${date}-${random}`;
}
