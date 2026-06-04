import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';

import {
  TransactionsActions,
  selectError,
  selectIsLoading,
  selectStatus,
  selectTransactions,
} from '../../../core/state/transactions';

@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './transactions-list.component.html',
  styleUrl: './transactions-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsListComponent {
  private readonly store = inject(Store);

  readonly transactions = toSignal(this.store.select(selectTransactions), {
    initialValue: [],
  });

  readonly isLoading = toSignal(this.store.select(selectIsLoading), {
    initialValue: false,
  });

  readonly error = toSignal(this.store.select(selectError), {
    initialValue: null,
  });

  private readonly status = toSignal(this.store.select(selectStatus), {
    initialValue: 'idle' as const,
  });

  constructor() {
    // Load the baseline history only on first entry. The transactions slice is
    // promoted to the payments-area injector, so it persists across features —
    // re-opening the list must NOT reload, or it would clobber e-transfers
    // recorded since (the effect would replace the list with the bare mock).
    if (this.status() === 'idle') {
      this.store.dispatch(TransactionsActions.loadRequested());
    }
  }
}
