import { Routes } from '@angular/router';

export const PAYMENTS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/payments-home/payments-home.component').then(
        (m) => m.PaymentsHomeComponent
      ),
  },
  {
    path: 'e-transfer',
    loadChildren: () =>
      import('./features/e-transfer/e-transfer.routes').then(
        (m) => m.E_TRANSFER_ROUTES
      ),
  },
];

// Default export so Native Federation can pick it up cleanly
export default PAYMENTS_ROUTES;
