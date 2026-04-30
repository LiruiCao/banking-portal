import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-payments-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './payments-home.component.html',
  styleUrl: './payments-home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsHomeComponent {}
