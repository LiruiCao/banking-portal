import { eTransferReducer, initialState } from './e-transfer.reducer';
import { ETransferActions } from './e-transfer.actions';
import { ETransferReceipt } from '../../models';
import { MOCK_ACCOUNTS, MOCK_RECIPIENTS } from '../../mock';

describe('eTransferReducer', () => {
  it('seeds recipients and accounts from the mock data', () => {
    expect(initialState.recipients).toBe(MOCK_RECIPIENTS);
    expect(initialState.accounts).toBe(MOCK_ACCOUNTS);
    expect(initialState.status).toBe('idle');
  });

  it('returns the current state for an unknown action', () => {
    const state = eTransferReducer(initialState, { type: 'NOOP' } as never);
    expect(state).toBe(initialState);
  });

  describe('draft updates', () => {
    it('recipientSelected sets the recipient id', () => {
      const state = eTransferReducer(
        initialState,
        ETransferActions.recipientSelected({ recipientId: 'rec_02' }),
      );
      expect(state.draft.recipientId).toBe('rec_02');
    });

    it('amountAndAccountSet records amount, account and memo', () => {
      const state = eTransferReducer(
        initialState,
        ETransferActions.amountAndAccountSet({
          amountCents: 5000,
          fromAccountId: 'acc_01',
          memo: 'lunch',
        }),
      );
      expect(state.draft).toMatchObject({
        amountCents: 5000,
        fromAccountId: 'acc_01',
        memo: 'lunch',
      });
    });

    it('securityQuestionSet maps question/answer onto the draft', () => {
      const state = eTransferReducer(
        initialState,
        ETransferActions.securityQuestionSet({
          question: 'Favourite city?',
          answer: 'Montreal',
        }),
      );
      expect(state.draft.securityQuestion).toBe('Favourite city?');
      expect(state.draft.securityAnswer).toBe('Montreal');
    });

    it('draftReset restores the initial state', () => {
      const dirty = eTransferReducer(
        initialState,
        ETransferActions.recipientSelected({ recipientId: 'rec_01' }),
      );
      expect(eTransferReducer(dirty, ETransferActions.draftReset())).toBe(
        initialState,
      );
    });
  });

  describe('submission lifecycle', () => {
    it('submitRequested moves to submitting and clears any error', () => {
      const failed = { ...initialState, error: 'boom' };
      const state = eTransferReducer(
        failed,
        ETransferActions.submitRequested(),
      );
      expect(state.status).toBe('submitting');
      expect(state.error).toBeNull();
    });

    it('submitSucceeded stores the receipt and marks submitted', () => {
      const receipt = { confirmationNumber: 'ETR-1' } as ETransferReceipt;
      const state = eTransferReducer(
        { ...initialState, status: 'submitting' },
        ETransferActions.submitSucceeded({ receipt }),
      );
      expect(state.status).toBe('submitted');
      expect(state.receipt).toBe(receipt);
      expect(state.error).toBeNull();
    });

    it('submitFailed records the error and marks failed', () => {
      const state = eTransferReducer(
        { ...initialState, status: 'submitting' },
        ETransferActions.submitFailed({ error: 'Network down' }),
      );
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Network down');
    });
  });

  it('does not mutate the previous state (immutability)', () => {
    const before = JSON.stringify(initialState);
    eTransferReducer(
      initialState,
      ETransferActions.recipientSelected({ recipientId: 'rec_03' }),
    );
    expect(JSON.stringify(initialState)).toBe(before);
  });
});
