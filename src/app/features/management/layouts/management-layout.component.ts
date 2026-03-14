import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-management-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    SidebarComponent,
  ],
  template: `
    <div class="management-layout">
      <!-- Mobile Header -->
      @if (isMobile()) {
        <mat-toolbar class="mobile-header" color="primary">
          <button mat-icon-button (click)="toggleMobileMenu()" aria-label="Toggle sidebar menu">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="header-title">Management</span>
          <span class="spacer"></span>
          <button mat-icon-button [matMenuTriggerFor]="userMenu" aria-label="User menu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <div class="user-menu-header">
              <strong>{{ user()?.sub || 'User' }}</strong>
              <small>{{ user()?.role || 'Member' }}</small>
            </div>
            <button mat-menu-item (click)="logout()">
              <mat-icon color="warn">logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </mat-toolbar>
      }

      <div class="layout-container">
        <!-- Sidebar (Desktop) -->
        @if (!isMobile()) {
          <app-sidebar
            [collapsed]="sidebarCollapsed()"
            (toggle)="toggleSidebar()"
          ></app-sidebar>
        }

        <!-- Mobile Sidebar Overlay -->
        @if (isMobile() && mobileMenuOpen()) {
          <div class="mobile-overlay" (click)="closeMobileMenu()"></div>
          <div class="mobile-sidebar">
            <app-sidebar [collapsed]="false"></app-sidebar>
          </div>
        }

        <!-- Main Content -->
        <main class="main-content">
          <!-- Desktop Header -->
          @if (!isMobile()) {
            <header class="desktop-header">
              <span class="spacer"></span>
              <button mat-button [matMenuTriggerFor]="desktopUserMenu" class="user-button">
                <mat-icon>account_circle</mat-icon>
                <span>{{ user()?.sub || 'User' }}</span>
                <mat-icon>arrow_drop_down</mat-icon>
              </button>
              <mat-menu #desktopUserMenu="matMenu">
                <div class="user-menu-header">
                  <strong>{{ user()?.sub || 'User' }}</strong>
                  <small>{{ user()?.role || 'Member' }}</small>
                </div>
                <button mat-menu-item (click)="logout()">
                  <mat-icon color="warn">logout</mat-icon>
                  <span>Logout</span>
                </button>
              </mat-menu>
            </header>
          }

          <!-- Page Content -->
          <div class="page-content">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .management-layout {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        background-color: #f5f5f5;
      }

      .mobile-header {
        position: sticky;
        top: 0;
        z-index: 1000;
      }

      .header-title {
        margin-left: 8px;
        font-weight: 500;
      }

      .spacer {
        flex: 1;
      }

      .layout-container {
        display: flex;
        flex: 1;
      }

      .main-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
        overflow: hidden;
      }

      .desktop-header {
        display: flex;
        align-items: center;
        padding: 8px 24px;
        background-color: #fff;
        border-bottom: 1px solid #e0e0e0;
        min-height: 56px;
      }

      .user-button {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .user-menu-header {
        padding: 12px 16px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .user-menu-header strong {
        font-size: 0.9375rem;
      }

      .user-menu-header small {
        font-size: 0.75rem;
        color: #666;
      }

      .page-content {
        flex: 1;
        padding: 24px;
        overflow-y: auto;
      }

      /* Mobile overlay and sidebar */
      .mobile-overlay {
        position: fixed;
        top: 56px;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 99;
      }

      .mobile-sidebar {
        position: fixed;
        top: 56px;
        left: 0;
        bottom: 0;
        z-index: 100;
        background-color: #fff;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
      }

      .mobile-sidebar app-sidebar {
        height: 100%;
      }

      /* Responsive adjustments */
      @media (max-width: 960px) {
        .page-content {
          padding: 16px;
        }
      }
    `,
  ],
})
export class ManagementLayoutComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly authService = inject(AuthService);

  sidebarCollapsed = signal(false);
  mobileMenuOpen = signal(false);

  // Reactive mobile detection
  isMobile = toSignal(
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .pipe(map((result) => result.matches)),
    { initialValue: false }
  );

  // User from auth service
  user = this.authService.user;

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  async logout(): Promise<void> {
    await this.authService.logout();
  }
}
