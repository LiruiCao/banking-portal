import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ETRANSFER_FEATURE_KEY, ETransferState } from './e-transfer.reducer';
import { ETRANSFER_LIMITS } from '../../models';

/**
 * Root selector — grabs the entire e-transfer slice from the store.
 * All other selectors compose off this one.
 */
export const selectETransferState =
  createFeatureSelector<ETransferState>(ETRANSFER_FEATURE_KEY);

// ---------- Slice selectors ----------

export const selectDraft = createSelector(
  selectETransferState,
  (state) => state.draft,
);

export const selectRecipients = createSelector(
  selectETransferState,
  (state) => state.recipients,
);

export const selectAccounts = createSelector(
  selectETransferState,
  (state) => state.accounts,
);

export const selectStatus = createSelector(
  selectETransferState,
  (state) => state.status,
);

export const selectReceipt = createSelector(
  selectETransferState,
  (state) => state.receipt,
);

export const selectError = createSelector(
  selectETransferState,
  (state) => state.error,
);

// ---------- Derived selectors ----------

export const selectSelectedRecipient = createSelector(
  selectDraft,
  selectRecipients,
  (draft, recipients) =>
    draft.recipientId ? recipients.find((r) => r.id === draft.recipientId) ?? null : null,
);

export const selectSelectedAccount = createSelector(
  selectDraft,
  selectAccounts,
  (draft, accounts) =>
    draft.fromAccountId ? accounts.find((a) => a.id === draft.fromAccountId) ?? null : null,
);

/**
 * Interac auto-deposit recipients skip the security question step.
 * This business rule lives in the selector, not in the component, so it can
 * be tested in isolation and reused across any UI that needs to know.
 */
export const selectRequiresSecurityQuestion = createSelector(
  selectSelectedRecipient,
  (recipient) => (recipient ? !recipient.autoDeposit : true),
);

export const selectCanSubmit = createSelector(
  selectDraft,
  (draft) => {
    const amountValid =
      draft.amountCents !== null &&
      draft.amountCents >= ETRANSFER_LIMITS.minCents &&
      draft.amountCents <= ETRANSFER_LIMITS.maxPerTransferCents;

    return draft.recipientId !== null && draft.fromAccountId !== null && amountValid;
  },
);

// ---------- UI-level selectors (convenience composites) ----------

export const selectIsSubmitting = createSelector(
  selectStatus,
  (status) => status === 'submitting',
);

export const selectHasSubmitted = createSelector(
  selectStatus,
  (status) => status === 'submitted',
);