import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { PAYMENTS_ROUTES } from './app.routes';
import {
  ETRANSFER_FEATURE_KEY,
  eTransferReducer,
  ETransferEffects,
} from './core/state/e-transfer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(PAYMENTS_ROUTES, withComponentInputBinding()),

    // NgRx store + effects
    provideStore({
      [ETRANSFER_FEATURE_KEY]: eTransferReducer,
    }),
    provideEffects([ETransferEffects]),

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