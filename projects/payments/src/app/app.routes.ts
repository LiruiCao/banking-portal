import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import {
  ETRANSFER_FEATURE_KEY,
  eTransferReducer,
  ETransferEffects,
} from './core/state/e-transfer';
import {
  TRANSACTIONS_FEATURE_KEY,
  transactionsReducer,
  TransactionsEffects,
} from './core/state/transactions';

export const PAYMENTS_ROUTES: Routes = [
  {
    path: '',
    // Payments-area providers. Transactions state is promoted to this pathless
    // parent (not a single route) so it survives navigation between features:
    // an e-transfer submitted in the wizard is still in the store when the user
    // opens Transaction History. The parent injector lives for as long as the
    // user is anywhere under /payments, so the slice persists across siblings.
    //
    // NOTE: this must be a *route-level* provider, not the root app.config —
    // when payments runs as a remote, the shell owns the root store and this
    // app.config is bypassed; route providers attach to whichever root store
    // is active (shell or standalone).
    providers: [
      provideState(TRANSACTIONS_FEATURE_KEY, transactionsReducer),
      provideEffects([TransactionsEffects]),
    ],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/payments-home/payments-home.component').then(
            (m) => m.PaymentsHomeComponent,
          ),
      },
      {
        path: 'e-transfer',
        // e-transfer keeps its own slice scoped to its subtree. We deliberately
        // scope it to the feature route (not the parent above) so step-to-step
        // navigation never re-enters the provider boundary — that would create
        // a new injector on every step and reset the wizard's state.
        providers: [
          provideState(ETRANSFER_FEATURE_KEY, eTransferReducer),
          provideEffects([ETransferEffects]),
        ],
        loadChildren: () =>
          import('./features/e-transfer/e-transfer.routes').then(
            (m) => m.E_TRANSFER_ROUTES,
          ),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import(
            './features/transactions/transactions-list/transactions-list.component'
          ).then((m) => m.TransactionsListComponent),
      },
    ],
  },
];

export default PAYMENTS_ROUTES;
