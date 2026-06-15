import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { ReviewComponent } from './review.component';
import {
  ETransferActions,
  ETransferStatus,
  selectCanSubmit,
  selectDraft,
  selectError,
  selectRequiresSecurityQuestion,
  selectSelectedAccount,
  selectSelectedRecipient,
  selectStatus,
} from '../../../../core/state/e-transfer';
import { Account, ETransferDraft, Recipient } from '../../../../core/models';

const RECIPIENT: Recipient = {
  id: 'rec_02', name: 'Marcus', channel: 'email', handle: 'm@x.com', autoDeposit: false,
};
const ACCOUNT: Account = {
  id: 'acc_01', kind: 'chequing', nickname: 'Chq', maskedNumber: '****1', balanceCents: 100000, currency: 'CAD',
};
const DRAFT: ETransferDraft = {
  recipientId: 'rec_02', fromAccountId: 'acc_01', amountCents: 5000,
  memo: 'rent', securityQuestion: '', securityAnswer: '',
};

describe('ReviewComponent', () => {
  let store: MockStore;
  let router: { navigate: jest.Mock };

  function configure(
    over: { status?: ETransferStatus; canSubmit?: boolean; error?: string | null } = {},
  ) {
    router = { navigate: jest.fn() };
    TestBed.configureTestingModule({
      imports: [ReviewComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectSelectedRecipient, value: RECIPIENT },
            { selector: selectSelectedAccount, value: ACCOUNT },
            { selector: selectDraft, value: DRAFT },
            { selector: selectStatus, value: over.status ?? 'idle' },
            { selector: selectError, value: over.error ?? null },
            { selector: selectCanSubmit, value: over.canSubmit ?? true },
            { selector: selectRequiresSecurityQuestion, value: true },
          ],
        }),
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: {} },
      ],
    });
    store = TestBed.inject(MockStore);
    return TestBed.createComponent(ReviewComponent);
  }

  it('should create', () => {
    expect(configure().componentInstance).toBeTruthy();
  });

  it('can continue when submittable and not already submitting', () => {
    const c = configure({ canSubmit: true, status: 'idle' }).componentInstance;
    expect(c.canContinue()).toBe(true);
    expect(c.continueLabel()).toBe('Send');
  });

  it('blocks continue and shows a sending label while submitting', () => {
    const c = configure({ canSubmit: true, status: 'submitting' }).componentInstance;
    expect(c.isSubmitting()).toBe(true);
    expect(c.canContinue()).toBe(false);
    expect(c.continueLabel()).toBe('Sending...');
  });

  it('exposes the draft amount in cents', () => {
    expect(configure().componentInstance.amountCents()).toBe(5000);
  });

  it('dispatches submitRequested on continue', () => {
    const c = configure().componentInstance;
    const dispatch = jest.spyOn(store, 'dispatch');
    c.onContinue();
    expect(dispatch).toHaveBeenCalledWith(ETransferActions.submitRequested());
  });

  it('navigates back to the amount step', () => {
    const c = configure().componentInstance;
    c.onBack();
    expect(router.navigate).toHaveBeenCalledWith(['../amount'], {
      relativeTo: TestBed.inject(ActivatedRoute),
    });
  });

  it('auto-navigates to success once status becomes submitted', () => {
    const fixture = configure({ status: 'submitted' });
    fixture.detectChanges(); // flush the constructor effect()
    expect(router.navigate).toHaveBeenCalledWith(['../success'], {
      relativeTo: TestBed.inject(ActivatedRoute),
    });
  });
});
