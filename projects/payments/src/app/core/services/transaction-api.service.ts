import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { MOCK_TRANSACTIONS } from '../mock';
import { Transaction } from '../models';

/**
 * Data-access seam for transaction history. Effects call this; nothing else.
 *
 * Today it returns mock data with a simulated latency so the UI exercises the
 * real idle → loading → loaded lifecycle. To go live, swap the body for
 * `inject(HttpClient).get<Transaction[]>('/api/transactions')` — the effect and
 * everything above it stay untouched.
 */
@Injectable({ providedIn: 'root' })
export class TransactionApiService {
  load(): Observable<readonly Transaction[]> {
    return of(MOCK_TRANSACTIONS).pipe(delay(600));
  }
}
