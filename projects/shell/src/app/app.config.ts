import {
  ApplicationConfig,
  isDevMode,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // Root NgRx infrastructure. Empty reducer map / effects array — feature
    // state is contributed by remote MFEs through route-level provideState().
    // The Shell intentionally knows nothing about feature state contents,
    // which keeps remotes decoupled and independently deployable.
    provideStore({}),
    provideEffects([]),

    // DevTools — dev only, kept in bundle for parity with production
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      connectInZone: true,
    }),
  ],
};
