import { createAction, createActionGroup, emptyProps, props } from '@ngrx/store';
import { ETransferReceipt, ETransferRequest } from '../../models';

/**
 * All e-Transfer intents, grouped by domain area.
 * Using createActionGroup (NgRx 14+) keeps the API surface cleaner than
 * declaring each action individually — one source of truth per feature slice.
 */
export const ETransferActions = createActionGroup({
  source: 'E-Transfer',
  events: {
    // ---------- Draft updates (wizard steps) ----------
    'Recipient Selected': props<{ recipientId: string }>(),

    'Amount And Account Set': props<{
      amountCents: number;
      fromAccountId: string;
      memo: string;
    }>(),

    'Security Question Set': props<{
      question: string;
      answer: string;
    }>(),

    'Draft Reset': emptyProps(),

    // ---------- Submission lifecycle ----------
    'Submit Requested': emptyProps(),
    'Submit Succeeded': props<{ receipt: ETransferReceipt }>(),
    'Submit Failed': props<{ error: string }>(),
  },
});