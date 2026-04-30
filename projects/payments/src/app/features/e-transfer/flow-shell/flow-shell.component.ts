import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';

import { selectRequiresSecurityQuestion } from '../../../core/state/e-transfer';

interface StepDef {
  readonly key: 'recipient' | 'amount' | 'security' | 'review';
  readonly label: string;
  readonly path: string;
}

@Component({
  selector: 'app-flow-shell',
  standalone: true,
  templateUrl: './flow-shell.component.html',
  styleUrl: './flow-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlowShellComponent {
  /** Which step the host page represents. Drives the progress indicator. */
  readonly currentStep = input.required<StepDef['key']>();

  /** Title shown above the content slot. */
  readonly title = input.required<string>();

  /** Whether the Continue button should be enabled. Each step decides. */
  readonly canContinue = input<boolean>(false);

  /** Label override for the primary action (e.g. "Send" on Review). */
  readonly continueLabel = input<string>('Continue');

  /** Hide the back button — used on Recipient (first step) and Success. */
  readonly hideBack = input<boolean>(false);

  readonly continueClick = output<void>();
  readonly backClick = output<void>();

  private readonly store = inject(Store);
  private readonly requiresSecurityQuestion = toSignal(
    this.store.select(selectRequiresSecurityQuestion),
    { initialValue: true }
  );

  /**
   * Step list, dynamically filtered: when the recipient has auto-deposit
   * enabled, the security step is dropped from the progress indicator.
   * This keeps the visual story consistent with the actual route flow.
   */
  readonly steps = computed<readonly StepDef[]>(() => {
    const all: StepDef[] = [
      { key: 'recipient', label: 'Recipient', path: 'recipient' },
      { key: 'amount', label: 'Amount', path: 'amount' },
      { key: 'security', label: 'Security', path: 'security' },
      { key: 'review', label: 'Review', path: 'review' },
    ];
    return this.requiresSecurityQuestion()
      ? all
      : all.filter((s) => s.key !== 'security');
  });

  readonly currentIndex = computed(() =>
    this.steps().findIndex((s) => s.key === this.currentStep())
  );

  isCompleted(stepIndex: number): boolean {
    return stepIndex < this.currentIndex();
  }

  isActive(stepIndex: number): boolean {
    return stepIndex === this.currentIndex();
  }

  onContinue(): void {
    this.continueClick.emit();
  }

  onBack(): void {
    this.backClick.emit();
  }
}
