import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';

import {
  ETransferActions,
  selectReceipt,
} from '../../../../core/state/e-transfer';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './success.component.html',
  styleUrl: './success.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuccessComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly receipt = toSignal(this.store.select(selectReceipt), {
    initialValue: null,
  });

  readonly amountDisplay = computed(() => {
    const r = this.receipt();
    return r ? r.request.amountCents / 100 : 0;
  });

  /**
   * Send another transfer — reset the draft, navigate back to step 1.
   * Without the reset, the user would land on step 1 with the previous
   * recipient still selected, which is confusing.
   */
  onSendAnother(): void {
    this.store.dispatch(ETransferActions.draftReset());
    this.router.navigate(['/e-transfer/recipient']);
  }

  onDone(): void {
    this.store.dispatch(ETransferActions.draftReset());
    this.router.navigate(['/']);
  }
}
