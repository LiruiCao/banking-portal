import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly brand = 'Banking Portal';
}

// 加了 RouterLink 和 RouterLinkActive(导航栏要用)
// 加了 OnPush 变更检测(资深工程师标配)
// title = 'shell' → readonly brand = 'Banking Portal'(有意义的字段名,readonly 是 TS 最佳实践)
