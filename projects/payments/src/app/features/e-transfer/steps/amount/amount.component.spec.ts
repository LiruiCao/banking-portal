import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { AmountComponent } from './amount.component';
import {
  ETransferActions,
  selectAccounts,
  selectDraft,
  selectRequiresSecurityQuestion,
  selectSelectedRecipient,
} from '../../../../core/state/e-transfer';
import { ETRANSFER_LIMITS, ETransferDraft } from '../../../../core/models';

const EMPTY_DRAFT: ETransferDraft = {
  recipientId: null,
  fromAccountId: null,
  amountCents: null,
  memo: '',
  securityQuestion: '',
  securityAnswer: '',
};

describe('AmountComponent', () => {
  let store: MockStore;
  let router: { navigate: jest.Mock };

  function configure(draft: ETransferDraft = EMPTY_DRAFT) {
    router = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      imports: [AmountComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectAccounts, value: [] },
            { selector: selectSelectedRecipient, value: null },
            { selector: selectDraft, value: draft },
            // FlowShell child reads this; keep all steps visible.
            { selector: selectRequiresSecurityQuestion, value: true },
          ],
        }),
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: {} },
      ],
    });

    store = TestBed.inject(MockStore);
    return TestBed.createComponent(AmountComponent).componentInstance;
  }

  it('should create', () => {
    expect(configure()).toBeTruthy();
  });

  it('cannot continue with an empty form', () => {
    const component = configure();
    expect(component.canContinue()).toBe(false);
  });

  it('can continue once amount and account are valid', () => {
    const component = configure();
    component.form.setValue({
      amount: '50.00',
      fromAccountId: 'acc_1',
      memo: 'lunch',
    });
    expect(component.canContinue()).toBe(true);
  });

  describe('amountWithinLimits', () => {
    it('rejects amounts below the minimum', () => {
      const component = configure();
      component.form.controls.amount.setValue(
        (ETRANSFER_LIMITS.minCents / 100 - 0.01).toFixed(2),
      );
      expect(component.amountWithinLimits()).toBe(false);
    });

    it('rejects amounts above the per-transfer maximum', () => {
      const component = configure();
      component.form.controls.amount.setValue(
        (ETRANSFER_LIMITS.maxPerTransferCents / 100 + 0.01).toFixed(2),
      );
      expect(component.amountWithinLimits()).toBe(false);
    });

    it('accepts an amount at the minimum boundary', () => {
      const component = configure();
      component.form.controls.amount.setValue(
        (ETRANSFER_LIMITS.minCents / 100).toFixed(2),
      );
      expect(component.amountWithinLimits()).toBe(true);
    });
  });

  describe('onContinue', () => {
    it('converts dollars to cents, dispatches, and navigates to review', () => {
      const component = configure();
      const dispatch = jest.spyOn(store, 'dispatch');
      component.form.setValue({
        amount: '50.00',
        fromAccountId: 'acc_1',
        memo: 'lunch',
      });

      component.onContinue();

      expect(dispatch).toHaveBeenCalledWith(
        ETransferActions.amountAndAccountSet({
          amountCents: 5000,
          fromAccountId: 'acc_1',
          memo: 'lunch',
        }),
      );
      expect(router.navigate).toHaveBeenCalledWith(['../review'], {
        relativeTo: TestBed.inject(ActivatedRoute),
      });
    });

    it('does nothing when the form is invalid', () => {
      const component = configure();
      const dispatch = jest.spyOn(store, 'dispatch');

      component.onContinue();

      expect(dispatch).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  it('navigates back to recipient on onBack', () => {
    const component = configure();
    component.onBack();
    expect(router.navigate).toHaveBeenCalledWith(['../recipient'], {
      relativeTo: TestBed.inject(ActivatedRoute),
    });
  });

  it('prefills the form from an existing draft (cents to dollars)', () => {
    const component = configure({
      ...EMPTY_DRAFT,
      amountCents: 2500,
      fromAccountId: 'acc_9',
      memo: 'rent',
    });

    expect(component.form.controls.amount.value).toBe('25.00');
    expect(component.form.controls.fromAccountId.value).toBe('acc_9');
    expect(component.form.controls.memo.value).toBe('rent');
  });
});
