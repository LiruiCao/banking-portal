import { initFederation } from '@angular-architects/native-federation';

// V1: inline manifest. Revisit when we add more remotes (Accounts, Wealth)
// and want to swap URLs per environment without rebuilding the shell.
initFederation({
  payments: 'http://localhost:4201/remoteEntry.json',
})
  .catch((err) => console.error('[shell] federation init failed', err))
  .then(() => import('./bootstrap'))
  .catch((err) => console.error('[shell] bootstrap failed', err));