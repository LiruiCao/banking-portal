import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-payments-home',
  standalone: true,
  templateUrl: './payments-home.component.html',
  styleUrl: './payments-home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsHomeComponent {}
