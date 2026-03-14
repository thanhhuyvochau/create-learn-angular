import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../../core/auth/auth.service';
import { SubjectApiService } from '../../../core/api';
import type { Subject } from '../../../models';

interface NavLink {
  name: string;
  href: string;
  hasSubmenu?: boolean;
}

const NAVIGATION_LINKS: NavLink[] = [
  { name: 'Gioi thieu', href: '/about' },
  { name: 'Chuong trinh hoc', href: '/subjects', hasSubmenu: true },
  { name: 'Khoa hoc', href: '/class' },
  { name: 'Giao vien', href: '/teachers' },
  { name: 'Blog hoc thuat', href: '/news' },
  { name: 'Tuyen dung', href: '/recruitment' },
];

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
    MatDividerModule,
  ],
  template: `
    <header class="header">
      <div class="header-container">
        <!-- Logo -->
        <a routerLink="/" class="logo-link">
          <img src="assets/images/algocore-logo.jpg" alt="AlgoCore Education" class="logo" />
          <span class="brand-name">AlgoCore</span>
        </a>

        <!-- Desktop Navigation -->
        <nav class="desktop-nav">
          @for (link of navLinks; track link.href) {
            @if (link.hasSubmenu) {
              <button mat-button [matMenuTriggerFor]="subjectMenu" class="nav-link">
                {{ link.name }}
                <mat-icon>expand_more</mat-icon>
              </button>
              <mat-menu #subjectMenu="matMenu">
                @for (subject of subjects(); track subject.id) {
                  <a mat-menu-item [routerLink]="['/class/subject', subject.id]">
                    {{ subject.name }}
                  </a>
                }
                @if (subjects().length === 0) {
                  <span mat-menu-item disabled>Loading...</span>
                }
              </mat-menu>
            } @else {
              <a mat-button [routerLink]="link.href" routerLinkActive="active" class="nav-link">
                {{ link.name }}
              </a>
            }
          }
        </nav>

        <!-- Auth Section -->
        <div class="auth-section">
            @if (auth.isLoggedIn()) {
            <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-trigger">
              <mat-icon>account_circle</mat-icon>
              <span class="user-name">{{ auth.user()?.sub }}</span>
              <mat-icon>expand_more</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu">
              <a mat-menu-item routerLink="/management">
                <mat-icon>dashboard</mat-icon>
                <span>Management</span>
              </a>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          } @else {
            <a mat-raised-button color="primary" routerLink="/login" class="login-btn">
              Dang nhap
            </a>
          }
        </div>

        <!-- Mobile Menu Button -->
        <button mat-icon-button class="mobile-menu-btn" (click)="toggleMobileMenu()" aria-label="Toggle navigation menu">
          <mat-icon>{{ mobileMenuOpen() ? 'close' : 'menu' }}</mat-icon>
        </button>
      </div>

      <!-- Mobile Navigation Drawer -->
      @if (mobileMenuOpen()) {
        <div class="mobile-overlay" (click)="closeMobileMenu()"></div>
        <nav class="mobile-nav">
          <div class="mobile-nav-header">
            <img src="assets/images/algocore-logo.jpg" alt="AlgoCore" class="mobile-logo" />
            <button mat-icon-button (click)="closeMobileMenu()" aria-label="Close navigation menu">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <mat-nav-list>
            @for (link of navLinks; track link.href) {
              @if (link.hasSubmenu) {
                <mat-list-item (click)="toggleSubjectExpand()">
                  <span matListItemTitle>{{ link.name }}</span>
                  <mat-icon matListItemMeta>
                    {{ subjectExpanded() ? 'expand_less' : 'expand_more' }}
                  </mat-icon>
                </mat-list-item>
                @if (subjectExpanded()) {
                  @for (subject of subjects(); track subject.id) {
                    <a mat-list-item [routerLink]="['/class/subject', subject.id]" 
                       (click)="closeMobileMenu()" class="submenu-item">
                      {{ subject.name }}
                    </a>
                  }
                }
              } @else {
                <a mat-list-item [routerLink]="link.href" (click)="closeMobileMenu()">
                  <span matListItemTitle>{{ link.name }}</span>
                </a>
              }
            }
            <mat-divider></mat-divider>
          @if (auth.isLoggedIn()) {
              <a mat-list-item routerLink="/management" (click)="closeMobileMenu()">
                <mat-icon matListItemIcon>dashboard</mat-icon>
                <span matListItemTitle>Management</span>
              </a>
              <button mat-list-item (click)="logout(); closeMobileMenu()">
                <mat-icon matListItemIcon>logout</mat-icon>
                <span matListItemTitle>Logout</span>
              </button>
            } @else {
              <a mat-list-item routerLink="/login" (click)="closeMobileMenu()">
                <mat-icon matListItemIcon>login</mat-icon>
                <span matListItemTitle>Dang nhap</span>
              </a>
            }
          </mat-nav-list>
        </nav>
      }
    </header>
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .header-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
      height: 72px;
    }

    .logo-link {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
    }

    .logo {
      height: 48px;
      width: auto;
      border-radius: 8px;
    }

    .brand-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a365d;
    }

    .desktop-nav {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-link {
      font-weight: 500;
      color: #374151;
    }

    .nav-link.active {
      color: #2563eb;
    }

    .auth-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-menu-trigger {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .user-name {
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .login-btn {
      font-weight: 500;
    }

    .mobile-menu-btn {
      display: none;
    }

    .mobile-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1001;
    }

    .mobile-nav {
      position: fixed;
      top: 0;
      right: 0;
      width: 300px;
      height: 100vh;
      background: white;
      z-index: 1002;
      overflow-y: auto;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(0);
      }
    }

    .mobile-nav-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
    }

    .mobile-logo {
      height: 40px;
      width: auto;
      border-radius: 8px;
    }

    .submenu-item {
      padding-left: 32px !important;
      background: #f9fafb;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .desktop-nav {
        display: none;
      }

      .auth-section {
        display: none;
      }

      .mobile-menu-btn {
        display: flex;
      }
    }

    @media (max-width: 600px) {
      .brand-name {
        display: none;
      }

      .header-container {
        padding: 0 16px;
      }
    }
  `],
})
export class HeaderComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly subjectApi = inject(SubjectApiService);
  private readonly router = inject(Router);

  navLinks = NAVIGATION_LINKS;
  subjects = signal<Subject[]>([]);
  mobileMenuOpen = signal(false);
  subjectExpanded = signal(false);

  ngOnInit(): void {
    this.loadSubjects();
  }

  private loadSubjects(): void {
    this.subjectApi.getAll({ page: 0, size: 100 }).subscribe({
      next: (response) => {
        if (response.status === 200 && response.data) {
          this.subjects.set(response.data.data);
        }
      },
      error: (err) => console.error('Failed to load subjects:', err),
    });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
    this.subjectExpanded.set(false);
  }

  toggleSubjectExpand(): void {
    this.subjectExpanded.update((v) => !v);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
