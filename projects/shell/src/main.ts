import { initFederation } from '@angular-architects/native-federation';
import { environment } from './environments/environment';

// Federation manifest is inlined and pulled from the environment so that
// dev points at localhost and production swaps in the deployed Payments URL.
// Revisit when we add more remotes (Accounts, Wealth) — at that point a JSON
// manifest fetched at runtime will be cleaner.
initFederation({
  payments: environment.paymentsRemoteUrl,
})
  .catch((err) => console.error('[shell] federation init failed', err))
  .then(() => import('./bootstrap'))
  .catch((err) => console.error('[shell] bootstrap failed', err));
