import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';

import { FlowShellComponent } from '../../flow-shell/flow-shell.component';
import {
  ETransferActions,
  selectDraft,
  selectRecipients,
} from '../../../../core/state/e-transfer';

@Component({
  selector: 'app-recipient',
  standalone: true,
  imports: [FlowShellComponent],
  templateUrl: './recipient.component.html',
  styleUrl: './recipient.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipientComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly recipients = toSignal(this.store.select(selectRecipients), {
    initialValue: [],
  });

  private readonly draft = toSignal(this.store.select(selectDraft), {
    initialValue: null,
  });

  readonly selectedId = computed(() => this.draft()?.recipientId ?? null);

  readonly canContinue = computed(() => this.selectedId() !== null);

  selectRecipient(id: string): void {
    this.store.dispatch(
      ETransferActions.recipientSelected({ recipientId: id }),
    );
  }

  onContinue(): void {
    this.router.navigate(['/e-transfer/amount']);
  }
}
