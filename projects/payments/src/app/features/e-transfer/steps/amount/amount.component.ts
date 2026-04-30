import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { FlowShellComponent } from '../../flow-shell/flow-shell.component';
import {
  ETransferActions,
  selectAccounts,
  selectDraft,
  selectSelectedRecipient,
} from '../../../../core/state/e-transfer';
import { ETRANSFER_LIMITS } from '../../../../core/models';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-amount',
  standalone: true,
  imports: [FlowShellComponent, ReactiveFormsModule, DecimalPipe],
  templateUrl: './amount.component.html',
  styleUrl: './amount.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmountComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly limits = ETRANSFER_LIMITS;
  readonly accounts = toSignal(this.store.select(selectAccounts), {
    initialValue: [],
  });
  readonly recipient = toSignal(this.store.select(selectSelectedRecipient), {
    initialValue: null,
  });

  private readonly draft = toSignal(this.store.select(selectDraft), {
    initialValue: null,
  });

  /**
   * Amount field is in dollars (UX-friendly), but we store in cents (precision).
   * Conversion happens at form submit, not in state.
   */
  readonly form = this.fb.nonNullable.group({
    amount: [
      this.draft() && this.draft()!.amountCents !== null
        ? (this.draft()!.amountCents! / 100).toFixed(2)
        : '',
      [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)],
    ],
    fromAccountId: [this.draft()?.fromAccountId ?? '', [Validators.required]],
    memo: [
      this.draft()?.memo ?? '',
      [Validators.maxLength(this.limits.memoMaxLength)],
    ],
  });

  /**
   * Bridge the reactive form into a signal so `computed` can react to changes.
   * Without this, computed reads form.valid once and never re-evaluates.
   */
  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });

  private readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  readonly canContinue = computed(() => {
    // Reading these signals creates the dependency
    this.formStatus();
    this.formValue();
    return this.form.valid && this.amountWithinLimits();
  });

  formatBalance(cents: number): string {
    return (cents / 100).toLocaleString('en-CA', {
      style: 'currency',
      currency: 'CAD',
    });
  }
  amountWithinLimits(): boolean {
    const value = this.form.controls.amount.value;
    if (!value) return false;
    const cents = Math.round(parseFloat(value) * 100);
    return (
      Number.isFinite(cents) &&
      cents >= this.limits.minCents &&
      cents <= this.limits.maxPerTransferCents
    );
  }

  onContinue(): void {
    if (!this.form.valid || !this.amountWithinLimits()) return;

    const { amount, fromAccountId, memo } = this.form.getRawValue();
    const cents = Math.round(parseFloat(amount) * 100);

    this.store.dispatch(
      ETransferActions.amountAndAccountSet({
        amountCents: cents,
        fromAccountId,
        memo,
      }),
    );

    this.router.navigate(['../review'], { relativeTo: this.route });
  }

  onBack(): void {
    this.router.navigate(['../recipient'], { relativeTo: this.route });
  }
}
