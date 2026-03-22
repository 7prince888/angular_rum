import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav>
      <a routerLink="/home" routerLinkActive="active">Home</a>
      <a routerLink="/admin" routerLinkActive="active">Admin</a>
    </nav>
    <router-outlet />
  `,
  styles: [`
    nav {
      display: flex;
      gap: 1.5rem;
      padding: 1rem 2rem;
      background: #1e1e2e;
    }
    nav a {
      color: #cdd6f4;
      text-decoration: none;
      font-weight: 500;
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      transition: background 0.2s;
    }
    nav a:hover { background: #313244; }
    nav a.active { background: #89b4fa; color: #1e1e2e; }
  `]
})
export class AppComponent {
  title = 'ang_march3';
}
