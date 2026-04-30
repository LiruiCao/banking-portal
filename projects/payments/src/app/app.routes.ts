import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import {
  ETRANSFER_FEATURE_KEY,
  eTransferReducer,
  ETransferEffects,
} from './core/state/e-transfer';

export const PAYMENTS_ROUTES: Routes = [
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
    // Feature-scoped providers: NgRx state and effects are registered once
    // when the e-transfer subtree activates and persist for its lifetime.
    // We deliberately scope this to the feature route (not a parent wrapper)
    // so step-to-step navigation never re-enters the provider boundary —
    // that would create a new injector on every step and reset the state.
    providers: [
      provideState(ETRANSFER_FEATURE_KEY, eTransferReducer),
      provideEffects([ETransferEffects]),
    ],
    loadChildren: () =>
      import('./features/e-transfer/e-transfer.routes').then(
        (m) => m.E_TRANSFER_ROUTES,
      ),
  },
];

export default PAYMENTS_ROUTES;
