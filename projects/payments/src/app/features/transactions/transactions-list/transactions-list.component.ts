import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';

import { TransactionFacade } from '../../../core/state/transactions';

@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './transactions-list.component.html',
  styleUrl: './transactions-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsListComponent {
  private readonly facade = inject(TransactionFacade);

  readonly transactions = toSignal(this.facade.transactions$, {
    initialValue: [],
  });

  readonly isLoading = toSignal(this.facade.isLoading$, {
    initialValue: false,
  });

  readonly error = toSignal(this.facade.error$, {
    initialValue: null,
  });

  constructor() {
    // Fire-and-forget: the idle guard lives in the load effect, so re-entering
    // the list never clobbers e-transfers recorded since the first load.
    this.facade.load();
  }
}
