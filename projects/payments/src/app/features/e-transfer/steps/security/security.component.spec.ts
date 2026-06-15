import { TestBed } from '@angular/core/testing';

import { SecurityComponent } from './security.component';

describe('SecurityComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SecurityComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
