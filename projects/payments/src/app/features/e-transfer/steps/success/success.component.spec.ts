import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { SuccessComponent } from './success.component';
import {
  ETransferActions,
  selectReceipt,
} from '../../../../core/state/e-transfer';
import { ETransferReceipt } from '../../../../core/models';

const RECEIPT: ETransferReceipt = {
  confirmationNumber: 'ETR-20260601-ABCDE',
  submittedAt: '2026-06-01T10:00:00Z',
  request: {
    recipient: { id: 'rec_02', name: 'Marcus', channel: 'email', handle: 'm@x.com', autoDeposit: false },
    fromAccount: { id: 'acc_01', kind: 'chequing', nickname: 'Chq', maskedNumber: '****1', balanceCents: 100000, currency: 'CAD' },
    amountCents: 5000,
    memo: 'rent',
    securityQuestion: 'City?',
    securityAnswer: 'Montreal',
  },
};

describe('SuccessComponent', () => {
  let store: MockStore;
  let router: { url: string; navigate: jest.Mock; navigateByUrl: jest.Mock };

  function configure(receipt: ETransferReceipt | null = RECEIPT, url = '/payments/e-transfer/success') {
    router = { url, navigate: jest.fn(), navigateByUrl: jest.fn() };
    TestBed.configureTestingModule({
      imports: [SuccessComponent],
      providers: [
        provideMockStore({ selectors: [{ selector: selectReceipt, value: receipt }] }),
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: {} },
      ],
    });
    store = TestBed.inject(MockStore);
    return TestBed.createComponent(SuccessComponent).componentInstance;
  }

  it('should create', () => {
    expect(configure(null)).toBeTruthy();
  });

  it('derives the dollar amount from the receipt', () => {
    expect(configure().amountDisplay()).toBe(50);
  });

  it('shows zero when there is no receipt', () => {
    expect(configure(null).amountDisplay()).toBe(0);
  });

  it('resets the draft and returns to step 1 on "Send another"', () => {
    const component = configure();
    const dispatch = jest.spyOn(store, 'dispatch');
    component.onSendAnother();
    expect(dispatch).toHaveBeenCalledWith(ETransferActions.draftReset());
    expect(router.navigate).toHaveBeenCalledWith(['../recipient'], {
      relativeTo: TestBed.inject(ActivatedRoute),
    });
  });

  it('resets the draft and strips the e-transfer segment on "Done"', () => {
    const component = configure(RECEIPT, '/payments/e-transfer/success');
    const dispatch = jest.spyOn(store, 'dispatch');
    component.onDone();
    expect(dispatch).toHaveBeenCalledWith(ETransferActions.draftReset());
    expect(router.navigateByUrl).toHaveBeenCalledWith('/payments');
  });
});
