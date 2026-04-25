import { createReducer, on } from '@ngrx/store';
import { ETransferActions } from './e-transfer.actions';
import { ETransferDraft, ETransferReceipt, Recipient, Account } from '../../models';
import { MOCK_RECIPIENTS, MOCK_ACCOUNTS } from '../../mock';

export type ETransferStatus = 'idle' | 'submitting' | 'submitted' | 'failed';
// 状态设计用 union type 表达 FSM(有限状态机),用 boolean 表达开关。Loading/success/error 用 union,isExpanded 用 boolean。
// 这是 Kent C. Dodds 的 "stop using isLoading booleans" 经典文章的核心。面试说出来是极强信
// interface BadState {
//   isLoading: boolean;
//   isSuccess: boolean;
//   isError: boolean;
// }

export interface ETransferState {
  readonly draft: ETransferDraft;
  readonly recipients: readonly Recipient[];
  readonly accounts: readonly Account[];
  readonly status: ETransferStatus;
  readonly receipt: ETransferReceipt | null;
  readonly error: string | null;
}

export const ETRANSFER_FEATURE_KEY = 'eTransfer';

const emptyDraft: ETransferDraft = {
  recipientId: null,
  fromAccountId: null,
  amountCents: null,
  memo: '',
  securityQuestion: '',
  securityAnswer: '',
};

export const initialState: ETransferState = {
  draft: emptyDraft,
  recipients: MOCK_RECIPIENTS,
  accounts: MOCK_ACCOUNTS,
  status: 'idle',
  receipt: null,
  error: null,
};

export const eTransferReducer = createReducer(
  initialState,

  // ---------- Draft updates ----------
  on(ETransferActions.recipientSelected, (state, { recipientId }) => ({
    ...state,
    draft: { ...state.draft, recipientId },
  })),

  on(ETransferActions.amountAndAccountSet, (state, { amountCents, fromAccountId, memo }) => ({
    ...state,
    draft: { ...state.draft, amountCents, fromAccountId, memo },
  })),

  on(ETransferActions.securityQuestionSet, (state, { question, answer }) => ({
    ...state,
    draft: {
      ...state.draft,
      securityQuestion: question,
      securityAnswer: answer,
    },
  })),

  on(ETransferActions.draftReset, () => initialState),

  // ---------- Submission lifecycle ----------
  on(ETransferActions.submitRequested, (state) => ({
    ...state,
    status: 'submitting' as const,
    error: null,
  })),

  on(ETransferActions.submitSucceeded, (state, { receipt }) => ({
    ...state,
    status: 'submitted' as const,
    receipt,
    error: null,
  })),

  on(ETransferActions.submitFailed, (state, { error }) => ({
    ...state,
    status: 'failed' as const,
    error,
  })),
);