import { Routes } from '@angular/router';

/**
 * E-Transfer wizard routes.
 *
 * Each step is its own URL so users can use the browser's back button
 * naturally and we can deep-link a specific step (useful for bug reports).
 *
 * Auto-deposit recipients skip the security step — that branching is handled
 * inside the step components, not here, because it depends on store state
 * that's not known until the recipient is selected.
 */
export const E_TRANSFER_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'recipient',
  },
  {
    path: 'recipient',
    loadComponent: () =>
      import('./steps/recipient/recipient.component').then(
        (m) => m.RecipientComponent
      ),
  },
  {
    path: 'amount',
    loadComponent: () =>
      import('./steps/amount/amount.component').then((m) => m.AmountComponent),
  },
  {
    path: 'security',
    loadComponent: () =>
      import('./steps/security/security.component').then(
        (m) => m.SecurityComponent
      ),
  },
  {
    path: 'review',
    loadComponent: () =>
      import('./steps/review/review.component').then((m) => m.ReviewComponent),
  },
  {
    path: 'success',
    loadComponent: () =>
      import('./steps/success/success.component').then(
        (m) => m.SuccessComponent
      ),
  },
];
