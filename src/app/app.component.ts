import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

import { HeaderComponent } from './features/public/header/header.component';
import { FooterComponent } from './features/public/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'create-learn-angular';
  private readonly router = inject(Router);

  /**
   * Hide header/footer on auth and management routes
   * These pages have their own layouts
   */
  showPublicLayout = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => {
        const url = (event as NavigationEnd).urlAfterRedirects;
        const isAuthRoute = url.startsWith('/auth') || url.startsWith('/login');
        const isManagementRoute = url.startsWith('/management');
        return !isAuthRoute && !isManagementRoute;
      })
    ),
    { initialValue: true }
  );
}
