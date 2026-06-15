import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PaymentsHomeComponent } from './payments-home.component';

describe('PaymentsHomeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentsHomeComponent],
      providers: [provideRouter([])], // template uses routerLink
    }).compileComponents();
  });

  function render() {
    const fixture = TestBed.createComponent(PaymentsHomeComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should create', () => {
    expect(TestBed.createComponent(PaymentsHomeComponent).componentInstance).toBeTruthy();
  });

  it('links to the e-transfer flow', () => {
    expect(render().querySelector('a[href="/e-transfer"]')?.textContent).toContain(
      'Interac e-Transfer',
    );
  });

  it('links to transaction history', () => {
    expect(render().querySelector('a[href="/transactions"]')?.textContent).toContain(
      'Transaction History',
    );
  });

  it('shows Bill Payments as coming soon (not a link)', () => {
    const compiled = render();
    expect(compiled.querySelector('a[href="/bill-payments"]')).toBeNull();
    expect(compiled.textContent).toContain('Coming soon');
  });
});
