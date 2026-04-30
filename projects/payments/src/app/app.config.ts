import {
  ApplicationConfig,
  isDevMode,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { PAYMENTS_ROUTES } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(PAYMENTS_ROUTES, withComponentInputBinding()),

    // Root NgRx infrastructure (empty — feature state is registered in routes).
    // This config is only used when Payments runs standalone (npm start).
    // When loaded as a remote, the host's app.config.ts owns the root store.
    provideStore(),
    provideEffects(),

    // DevTools — dev only, safe to leave in bundle
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      connectInZone: true,
    }),
  ],
};
