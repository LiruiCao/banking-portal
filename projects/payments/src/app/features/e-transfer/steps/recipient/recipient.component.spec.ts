import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { RecipientComponent } from './recipient.component';
import {
  ETransferActions,
  selectDraft,
  selectRecipients,
  selectRequiresSecurityQuestion,
} from '../../../../core/state/e-transfer';
import { ETransferDraft, Recipient } from '../../../../core/models';

const RECIPIENTS: Recipient[] = [
  { id: 'rec_01', name: 'Emily', channel: 'email', handle: 'e@x.com', autoDeposit: true },
  { id: 'rec_02', name: 'Marcus', channel: 'email', handle: 'm@x.com', autoDeposit: false },
];

const draft = (over: Partial<ETransferDraft> = {}): ETransferDraft => ({
  recipientId: null,
  fromAccountId: null,
  amountCents: null,
  memo: '',
  securityQuestion: '',
  securityAnswer: '',
  ...over,
});

describe('RecipientComponent', () => {
  let store: MockStore;
  let router: { navigate: jest.Mock };

  function configure(draftValue: ETransferDraft = draft()) {
    router = { navigate: jest.fn() };
    TestBed.configureTestingModule({
      imports: [RecipientComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectRecipients, value: RECIPIENTS },
            { selector: selectDraft, value: draftValue },
            { selector: selectRequiresSecurityQuestion, value: true },
          ],
        }),
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: {} },
      ],
    });
    store = TestBed.inject(MockStore);
    return TestBed.createComponent(RecipientComponent).componentInstance;
  }

  it('should create', () => {
    expect(configure()).toBeTruthy();
  });

  it('cannot continue until a recipient is selected', () => {
    expect(configure().canContinue()).toBe(false);
  });

  it('can continue once a recipient is in the draft', () => {
    const component = configure(draft({ recipientId: 'rec_02' }));
    expect(component.selectedId()).toBe('rec_02');
    expect(component.canContinue()).toBe(true);
  });

  it('dispatches recipientSelected when a recipient is picked', () => {
    const component = configure();
    const dispatch = jest.spyOn(store, 'dispatch');
    component.selectRecipient('rec_01');
    expect(dispatch).toHaveBeenCalledWith(
      ETransferActions.recipientSelected({ recipientId: 'rec_01' }),
    );
  });

  it('navigates to the amount step on continue', () => {
    const component = configure();
    component.onContinue();
    expect(router.navigate).toHaveBeenCalledWith(['../amount'], {
      relativeTo: TestBed.inject(ActivatedRoute),
    });
  });
});
