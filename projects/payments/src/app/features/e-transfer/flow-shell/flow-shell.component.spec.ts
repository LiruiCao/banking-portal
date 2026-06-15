import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { FlowShellComponent } from './flow-shell.component';
import { selectRequiresSecurityQuestion } from '../../../core/state/e-transfer';

describe('FlowShellComponent', () => {
  let store: MockStore;

  function configure(requiresSecurity: boolean, currentStep: 'recipient' | 'amount' | 'security' | 'review' = 'amount') {
    TestBed.configureTestingModule({
      imports: [FlowShellComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectRequiresSecurityQuestion, value: requiresSecurity },
          ],
        }),
      ],
    });
    store = TestBed.inject(MockStore);
    const fixture: ComponentFixture<FlowShellComponent> =
      TestBed.createComponent(FlowShellComponent);
    fixture.componentRef.setInput('currentStep', currentStep);
    fixture.componentRef.setInput('title', 'Test');
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    expect(configure(true).componentInstance).toBeTruthy();
  });

  it('shows all four steps when a security question is required', () => {
    const c = configure(true).componentInstance;
    expect(c.steps().map((s) => s.key)).toEqual([
      'recipient',
      'amount',
      'security',
      'review',
    ]);
  });

  it('drops the security step for auto-deposit recipients', () => {
    const c = configure(false).componentInstance;
    expect(c.steps().map((s) => s.key)).toEqual(['recipient', 'amount', 'review']);
  });

  it('computes the active index from currentStep, accounting for the dropped step', () => {
    // With security dropped, "review" is index 2, not 3.
    const c = configure(false, 'review').componentInstance;
    expect(c.currentIndex()).toBe(2);
    expect(c.isActive(2)).toBe(true);
    expect(c.isCompleted(0)).toBe(true); // recipient is before review
    expect(c.isCompleted(2)).toBe(false);
  });

  it('emits continueClick and backClick from the footer handlers', () => {
    const c = configure(true).componentInstance;
    const events: string[] = [];
    c.continueClick.subscribe(() => events.push('continue'));
    c.backClick.subscribe(() => events.push('back'));

    c.onContinue();
    c.onBack();

    expect(events).toEqual(['continue', 'back']);
  });
});
