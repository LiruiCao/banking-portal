import {
  selectCanSubmit,
  selectRequiresSecurityQuestion,
  selectSelectedAccount,
  selectSelectedRecipient,
} from './e-transfer.selectors';
import { ETransferDraft, Recipient, Account } from '../../models';

const draft = (over: Partial<ETransferDraft> = {}): ETransferDraft => ({
  recipientId: null,
  fromAccountId: null,
  amountCents: null,
  memo: '',
  securityQuestion: '',
  securityAnswer: '',
  ...over,
});

const RECIPIENTS: Recipient[] = [
  { id: 'rec_01', name: 'Emily', channel: 'email', handle: 'e@x.com', autoDeposit: true },
  { id: 'rec_02', name: 'Marcus', channel: 'email', handle: 'm@x.com', autoDeposit: false },
];

const ACCOUNTS: Account[] = [
  { id: 'acc_01', kind: 'chequing', nickname: 'Chq', maskedNumber: '****1', balanceCents: 100000, currency: 'CAD' },
];

describe('e-transfer selectors', () => {
  describe('selectSelectedRecipient', () => {
    it('returns the recipient matching the draft id', () => {
      const result = selectSelectedRecipient.projector(
        draft({ recipientId: 'rec_02' }),
        RECIPIENTS,
      );
      expect(result?.name).toBe('Marcus');
    });

    it('returns null when no recipient is chosen', () => {
      expect(selectSelectedRecipient.projector(draft(), RECIPIENTS)).toBeNull();
    });

    it('returns null when the id does not match any recipient', () => {
      expect(
        selectSelectedRecipient.projector(draft({ recipientId: 'ghost' }), RECIPIENTS),
      ).toBeNull();
    });
  });

  describe('selectSelectedAccount', () => {
    it('returns the account matching the draft id', () => {
      const result = selectSelectedAccount.projector(
        draft({ fromAccountId: 'acc_01' }),
        ACCOUNTS,
      );
      expect(result?.nickname).toBe('Chq');
    });

    it('returns null when no account is chosen', () => {
      expect(selectSelectedAccount.projector(draft(), ACCOUNTS)).toBeNull();
    });
  });

  describe('selectRequiresSecurityQuestion (business rule)', () => {
    it('is false for auto-deposit recipients (security step skipped)', () => {
      expect(selectRequiresSecurityQuestion.projector(RECIPIENTS[0])).toBe(false);
    });

    it('is true for non auto-deposit recipients', () => {
      expect(selectRequiresSecurityQuestion.projector(RECIPIENTS[1])).toBe(true);
    });

    it('is true when no recipient is selected yet', () => {
      expect(selectRequiresSecurityQuestion.projector(null)).toBe(true);
    });
  });

  describe('selectCanSubmit', () => {
    const complete = draft({
      recipientId: 'rec_02',
      fromAccountId: 'acc_01',
      amountCents: 5000,
    });

    it('is true when recipient, account and a valid amount are present', () => {
      expect(selectCanSubmit.projector(complete)).toBe(true);
    });

    it('is false when the amount is below the minimum', () => {
      expect(selectCanSubmit.projector({ ...complete, amountCents: 50 })).toBe(false);
    });

    it('is false when the amount exceeds the per-transfer maximum', () => {
      expect(selectCanSubmit.projector({ ...complete, amountCents: 300_001 })).toBe(false);
    });

    it('is false when the recipient is missing', () => {
      expect(selectCanSubmit.projector({ ...complete, recipientId: null })).toBe(false);
    });

    it('is false when the account is missing', () => {
      expect(selectCanSubmit.projector({ ...complete, fromAccountId: null })).toBe(false);
    });
  });
});
