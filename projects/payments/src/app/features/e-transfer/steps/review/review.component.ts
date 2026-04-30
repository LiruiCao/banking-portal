import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';

import { FlowShellComponent } from '../../flow-shell/flow-shell.component';
import {
  ETransferActions,
  selectCanSubmit,
  selectDraft,
  selectError,
  selectSelectedAccount,
  selectSelectedRecipient,
  selectStatus,
} from '../../../../core/state/e-transfer';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [FlowShellComponent, DecimalPipe],
  templateUrl: './review.component.html',
  styleUrl: './review.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly recipient = toSignal(this.store.select(selectSelectedRecipient), {
    initialValue: null,
  });
  readonly account = toSignal(this.store.select(selectSelectedAccount), {
    initialValue: null,
  });
  readonly draft = toSignal(this.store.select(selectDraft), {
    initialValue: null,
  });
  readonly status = toSignal(this.store.select(selectStatus), {
    initialValue: 'idle' as const,
  });
  readonly error = toSignal(this.store.select(selectError), {
    initialValue: null,
  });
  readonly canSubmit = toSignal(this.store.select(selectCanSubmit), {
    initialValue: false,
  });

  readonly isSubmitting = computed(() => this.status() === 'submitting');
  readonly canContinue = computed(
    () => this.canSubmit() && !this.isSubmitting(),
  );
  readonly continueLabel = computed(() =>
    this.isSubmitting() ? 'Sending...' : 'Send',
  );

  /**
   * Once the effect dispatches submitSucceeded, status becomes 'submitted'.
   * Navigate to the success page automatically — the user shouldn't have to
   * click anything else.
   */
  constructor() {
    effect(() => {
      if (this.status() === 'submitted') {
        this.router.navigate(['/e-transfer/success']);
      }
    });
  }

  amountCents(): number {
    return this.draft()?.amountCents ?? 0;
  }

  onContinue(): void {
    this.store.dispatch(ETransferActions.submitRequested());
  }

  onBack(): void {
    this.router.navigate(['/e-transfer/amount']);
  }
}
