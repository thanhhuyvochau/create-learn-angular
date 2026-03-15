import { Component, input, output, signal, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  description?: string;
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    id: 'subject',
    label: 'Môn học',
    icon: 'functions',
    route: '/management/subject',
    description: 'Quản lý môn học',
  },
  {
    id: 'grades',
    label: 'Khối lớp',
    icon: 'school',
    route: '/management/grade',
    description: 'Quản lý khối lớp',
  },
  {
    id: 'teachers',
    label: 'Giáo viên',
    icon: 'person',
    route: '/management/teacher',
    description: 'Quản lý giáo viên',
  },
  {
    id: 'class',
    label: 'Lớp học',
    icon: 'class',
    route: '/management/class',
    description: 'Quản lý lớp học',
  },
  {
    id: 'consultation',
    label: 'Tư vấn',
    icon: 'support_agent',
    route: '/management/consultation',
    description: 'Quản lý tư vấn',
  },
  {
    id: 'news',
    label: 'Tin tức',
    icon: 'newspaper',
    route: '/management/news',
    description: 'Quản lý tin tức',
  },
  {
    id: 'account',
    label: 'Tài khoản',
    icon: 'person_add',
    route: '/management/account',
    description: 'Quản lý tài khoản',
  },
  {
    id: 'registration',
    label: 'Đăng ký',
    icon: 'how_to_reg',
    route: '/management/registration',
    description: 'Quản lý đăng ký',
  },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed()">
      <!-- Header -->
      <div class="sidebar-header">
        @if (!collapsed()) {
          <span class="sidebar-title">Quản lý</span>
        }
        <button
          mat-icon-button
          class="toggle-button"
          (click)="onToggle()"
          [matTooltip]="collapsed() ? 'Mở rộng' : 'Thu gọn'"
        >
          <mat-icon>{{ collapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
        </button>
      </div>

      <mat-divider></mat-divider>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        @for (item of items; track item.id) {
          <a
            class="nav-item"
            [routerLink]="item.route"
            routerLinkActive="active"
            [matTooltip]="collapsed() ? item.label : ''"
            matTooltipPosition="right"
            [attr.aria-label]="item.description || item.label"
          >
            <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
            @if (!collapsed()) {
              <span class="nav-label">{{ item.label }}</span>
            }
            <span class="active-indicator"></span>
          </a>
        }
      </nav>
    </aside>
  `,
  styles: [
    `
      .sidebar {
        display: flex;
        flex-direction: column;
        width: 280px;
        height: 100vh;
        background-color: #fff;
        border-right: 1px solid #e9ecef;
        transition: width 0.3s ease;
        position: sticky;
        top: 0;
        left: 0;
        overflow: hidden;
      }

      .sidebar.collapsed {
        width: 70px;
      }

      .sidebar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        min-height: 64px;
      }

      .sidebar.collapsed .sidebar-header {
        justify-content: center;
        padding: 16px 8px;
      }

      .sidebar-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1976d2;
        white-space: nowrap;
      }

      .toggle-button {
        flex-shrink: 0;
      }

      .sidebar-nav {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 8px;
        overflow-y: auto;
        flex: 1;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-radius: 8px;
        text-decoration: none;
        color: #495057;
        font-size: 0.9375rem;
        font-weight: 400;
        transition: all 0.2s ease;
        position: relative;
        cursor: pointer;
      }

      .sidebar.collapsed .nav-item {
        justify-content: center;
        padding: 12px;
      }

      .nav-item:hover {
        background-color: #f8f9fa;
      }

      .nav-item.active {
        background-color: #e3f2fd;
        color: #1976d2;
        font-weight: 600;
      }

      .nav-item.active .nav-icon {
        color: #1976d2;
      }

      .nav-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        color: #6c757d;
        transition: color 0.2s ease;
      }

      .nav-label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .active-indicator {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 20px;
        background-color: #1976d2;
        border-radius: 0 2px 2px 0;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .nav-item.active .active-indicator {
        opacity: 1;
      }

      /* Responsive */
      @media (max-width: 960px) {
        .sidebar {
          position: fixed;
          z-index: 100;
          transform: translateX(-100%);
        }

        .sidebar.mobile-open {
          transform: translateX(0);
        }
      }
    `,
  ],
})
export class SidebarComponent {
  collapsed = input<boolean>(false);
  toggle = output<void>();

  items = SIDEBAR_ITEMS;

  onToggle(): void {
    this.toggle.emit();
  }
}
