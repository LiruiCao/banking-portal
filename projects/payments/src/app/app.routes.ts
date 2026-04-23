import { Routes } from '@angular/router';

export const PAYMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/payments-home/payments-home.component').then(
        (m) => m.PaymentsHomeComponent
      ),
  },
];

// Default export so Native Federation can pick it up cleanly
export default PAYMENTS_ROUTES;
