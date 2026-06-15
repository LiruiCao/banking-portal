import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Observable, of } from 'rxjs';

import { ETransferEffects } from './e-transfer.effects';
import { ETransferActions } from './e-transfer.actions';
import {
  selectDraft,
  selectSelectedAccount,
  selectSelectedRecipient,
} from './e-transfer.selectors';
import { Account, ETransferDraft, Recipient } from '../../models';

const RECIPIENT: Recipient = {
  id: 'rec_02',
  name: 'Marcus',
  channel: 'email',
  handle: 'm@x.com',
  autoDeposit: false,
};
const ACCOUNT: Account = {
  id: 'acc_01',
  kind: 'chequing',
  nickname: 'Chq',
  maskedNumber: '****1',
  balanceCents: 100000,
  currency: 'CAD',
};
const DRAFT: ETransferDraft = {
  recipientId: 'rec_02',
  fromAccountId: 'acc_01',
  amountCents: 5000,
  memo: 'rent',
  securityQuestion: 'City?',
  securityAnswer: 'Montreal',
};

describe('ETransferEffects', () => {
  let actions$: Observable<unknown>;
  let effects: ETransferEffects;
  let store: MockStore;

  function setup(over: {
    draft?: ETransferDraft;
    recipient?: Recipient | null;
    account?: Account | null;
  } = {}) {
    // Note: use `in` so an explicit `null` overrides the default (`??` would not).
    TestBed.configureTestingModule({
      providers: [
        ETransferEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          selectors: [
            { selector: selectDraft, value: 'draft' in over ? over.draft : DRAFT },
            {
              selector: selectSelectedRecipient,
              value: 'recipient' in over ? over.recipient : RECIPIENT,
            },
            {
              selector: selectSelectedAccount,
              value: 'account' in over ? over.account : ACCOUNT,
            },
          ],
        }),
      ],
    });
    store = TestBed.inject(MockStore);
    effects = TestBed.inject(ETransferEffects);
  }

  it('emits submitSucceeded with a receipt for a complete transfer', fakeAsync(() => {
    setup();
    actions$ = of(ETransferActions.submitRequested());

    let emitted: ReturnType<typeof ETransferActions.submitSucceeded> | undefined;
    effects.submit$.subscribe((a) => (emitted = a as typeof emitted));
    tick(900);

    expect(emitted?.type).toBe('[E-Transfer] Submit Succeeded');
    expect(emitted?.receipt.request).toMatchObject({
      amountCents: 5000,
      memo: 'rent',
      recipient: RECIPIENT,
      fromAccount: ACCOUNT,
    });
    expect(emitted?.receipt.confirmationNumber).toMatch(/^ETR-\d{8}-[A-Z0-9]+$/);
  }));

  it('strips the security question for auto-deposit recipients', fakeAsync(() => {
    setup({ recipient: { ...RECIPIENT, autoDeposit: true } });
    actions$ = of(ETransferActions.submitRequested());

    let emitted: ReturnType<typeof ETransferActions.submitSucceeded> | undefined;
    effects.submit$.subscribe((a) => (emitted = a as typeof emitted));
    tick(900);

    expect(emitted?.receipt.request.securityQuestion).toBeNull();
    expect(emitted?.receipt.request.securityAnswer).toBeNull();
  }));

  it('emits submitFailed when the recipient is missing', (done) => {
    setup({ recipient: null });
    actions$ = of(ETransferActions.submitRequested());

    effects.submit$.subscribe((action) => {
      expect(action).toEqual(
        ETransferActions.submitFailed({ error: 'Transfer is incomplete' }),
      );
      done();
    });
  });

  it('emits submitFailed when the amount is missing', (done) => {
    setup({ draft: { ...DRAFT, amountCents: null } });
    actions$ = of(ETransferActions.submitRequested());

    effects.submit$.subscribe((action) => {
      expect(action).toEqual(
        ETransferActions.submitFailed({ error: 'Transfer is incomplete' }),
      );
      done();
    });
  });
});
