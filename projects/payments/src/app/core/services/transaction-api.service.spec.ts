import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { TransactionApiService } from './transaction-api.service';
import { MOCK_TRANSACTIONS } from '../mock';
import { Transaction } from '../models';

describe('TransactionApiService', () => {
  let service: TransactionApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionApiService);
  });

  it('resolves the mock history after the simulated latency', fakeAsync(() => {
    let result: readonly Transaction[] | undefined;
    service.load().subscribe((t) => (result = t));

    // Nothing before the latency elapses — the UI gets a real loading window.
    expect(result).toBeUndefined();

    tick(600);
    expect(result).toEqual(MOCK_TRANSACTIONS);
    expect(result?.length).toBe(5);
  }));
});
