import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs';

import {
  ConfirmDialogComponent,
  type ConfirmDialogData,
} from '../../../../shared/components';
import { RecruitmentApiService } from '../../../../core/api';
import { NotificationService } from '../../../../core/notifications/notification.service';
import type { JobPosting } from '../../../../models';

@Component({
  selector: 'app-recruitment-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <div class="page-wrap">
      <!-- ── Header ─────────────────────────────────────────────────── -->
      <section class="page-header">
        <div>
          <h2 class="page-title">Tuyển dụng</h2>
          <p class="page-subtitle">
            Quản lý các vị trí tuyển dụng của học viện.
          </p>
        </div>
        <button mat-flat-button color="primary" (click)="navigateToCreate()">
          <mat-icon>add</mat-icon>
          Tạo vị trí mới
        </button>
      </section>

      <!-- ── Stats Grid ─────────────────────────────────────────────── -->
      <section class="stats-grid">
        <div class="stat-card stat-card--accent">
          <p class="stat-label">Đang hoạt động</p>
          <div class="stat-value-row">
            <span class="stat-value">{{ activeCount() }}</span>
            <span class="stat-badge-green">Tổng số vị trí</span>
          </div>
        </div>
        <div class="stat-card">
          <p class="stat-label">Tổng hồ sơ</p>
          <div class="stat-value-row">
            <span class="stat-value">{{ totalElements() }}</span>
            <span class="stat-badge-primary">Tất cả</span>
          </div>
        </div>
        <div class="stat-card stat-card--overflow">
          <div class="stat-bg-circle"></div>
          <p class="stat-label">Đã ẩn</p>
          <div class="stat-value-row">
            <span class="stat-value">{{ hiddenCount() }}</span>
          </div>
        </div>
      </section>

      <!-- ── Table Card ─────────────────────────────────────────────── -->
      <section class="table-card">
        <!-- Filter bar -->
        <div class="filter-bar">
          <div class="filter-tabs">
            <button
              class="filter-tab"
              [class.filter-tab--active]="activeFilter() === 'all'"
              (click)="setFilter('all')"
            >
              Tất cả
            </button>
            <button
              class="filter-tab"
              [class.filter-tab--active]="activeFilter() === 'active'"
              (click)="setFilter('active')"
            >
              Đang hoạt động
            </button>
            <button
              class="filter-tab"
              [class.filter-tab--active]="activeFilter() === 'hidden'"
              (click)="setFilter('hidden')"
            >
              Đã ẩn
            </button>
          </div>
        </div>

        <!-- Loading state -->
        @if (loading()) {
          <div class="loading-row">
            <div class="spinner"></div>
            <span>Đang tải...</span>
          </div>
        }

        <!-- Error state -->
        @else if (error()) {
          <div class="error-message">
            <mat-icon>error</mat-icon>
            <span>{{ error() }}</span>
            <button mat-button color="primary" (click)="loadJobs()">
              Thử lại
            </button>
          </div>
        }

        <!-- Table -->
        @else {
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr class="table-head-row">
                  <th class="th">Tên vị trí</th>
                  <th class="th th--center">Trạng thái</th>
                  <th class="th">Bộ phận</th>
                  <th class="th">Địa điểm</th>
                  <th class="th th--right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                @if (filteredJobs().length === 0) {
                  <tr>
                    <td colspan="5" class="empty-row">
                      <mat-icon class="empty-icon">work_off</mat-icon>
                      <p>Không tìm thấy vị trí tuyển dụng nào</p>
                    </td>
                  </tr>
                }
                @for (job of pagedJobs(); track job.id) {
                  <tr
                    class="table-row"
                    [class.table-row--inactive]="!job.isActive"
                  >
                    <!-- Position Name -->
                    <td class="td">
                      <p class="job-title">{{ job.title }}</p>
                      <p class="job-type">{{ formatType(job.type) }}</p>
                    </td>

                    <!-- Status -->
                    <td class="td td--center">
                      @if (job.isActive) {
                        <span class="status-badge status-badge--active">
                          <span class="status-dot status-dot--active"></span>
                          Hoạt động
                        </span>
                      } @else {
                        <span class="status-badge status-badge--inactive">
                          <span class="status-dot status-dot--inactive"></span>
                          Đã ẩn
                        </span>
                      }
                    </td>

                    <!-- Department -->
                    <td class="td">
                      <span class="dept-text">{{ job.department }}</span>
                    </td>

                    <!-- Location -->
                    <td class="td">
                      <div class="location-cell">
                        <mat-icon class="location-icon">room</mat-icon>
                        <span>{{ job.location }}</span>
                      </div>
                    </td>

                    <!-- Actions -->
                    <td class="td td--right">
                      <div class="action-group">
                        <button
                          mat-icon-button
                          class="action-btn--view"
                          title="Xem chi tiết"
                          [routerLink]="['/class', job.id]"
                        >
                          <mat-icon>visibility</mat-icon>
                        </button>
                        <button
                          mat-icon-button
                          color="primary"
                          title="Chỉnh sửa"
                          (click)="navigateToEdit(job)"
                        >
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button
                          mat-icon-button
                          color="warn"
                          title="Xóa vị trí"
                          (click)="openDeleteDialog(job)"
                        >
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="pagination-bar">
            <p class="pagination-info">
              Hiển thị
              <strong>{{ paginationStart() }}–{{ paginationEnd() }}</strong>
              trong <strong>{{ filteredJobs().length }}</strong> kết quả
            </p>
            <div class="pagination-controls">
              <button
                class="page-btn page-btn--nav"
                [disabled]="pageIndex() === 0"
                (click)="goToPage(pageIndex() - 1)"
              >
                <mat-icon>chevron_left</mat-icon>
              </button>
              @for (p of pageNumbers(); track p) {
                <button
                  class="page-btn"
                  [class.page-btn--active]="p === pageIndex()"
                  (click)="goToPage(p)"
                >
                  {{ p + 1 }}
                </button>
              }
              <button
                class="page-btn page-btn--nav"
                [disabled]="pageIndex() >= pageNumbers().length - 1"
                (click)="goToPage(pageIndex() + 1)"
              >
                <mat-icon>chevron_right</mat-icon>
              </button>
            </div>
          </div>
        }
      </section>
    </div>
  `,
  styles: [
    `
      /* ── Layout ──────────────────────────────────────────────────────────── */
      .page-wrap {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      /* ── Page Header ─────────────────────────────────────────────────────── */
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 0;
      }
      .page-title {
        font-size: 1.75rem;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.87);
        margin: 0 0 4px;
      }
      .page-subtitle {
        font-size: 0.875rem;
        color: rgba(0, 0, 0, 0.6);
        margin: 0;
      }

      /* ── Stats Grid ──────────────────────────────────────────────────────── */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
      }
      .stat-card {
        background: #ffffff;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .stat-card--accent {
        border-left: 4px solid #00a896;
      }
      .stat-card--overflow {
        position: relative;
        overflow: hidden;
      }
      .stat-bg-circle {
        position: absolute;
        right: -16px;
        top: -16px;
        width: 96px;
        height: 96px;
        background: rgba(0, 168, 150, 0.05);
        border-radius: 50%;
      }
      .stat-label {
        font-size: 0.7rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: rgba(0, 0, 0, 0.6);
        margin: 0 0 12px;
      }
      .stat-value-row {
        display: flex;
        align-items: baseline;
        gap: 8px;
      }
      .stat-value {
        font-size: 2.25rem;
        font-weight: 700;
        color: rgba(0, 0, 0, 0.87);
        line-height: 1;
      }
      .stat-badge-green {
        font-size: 0.7rem;
        font-weight: 500;
        color: #00a896;
      }
      .stat-badge-primary {
        font-size: 0.7rem;
        font-weight: 500;
        color: #00a896;
      }
      .stat-badge-muted {
        font-size: 0.7rem;
        color: #666;
      }

      /* ── Table Card ──────────────────────────────────────────────────────── */
      .table-card {
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      /* Filter bar */
      .filter-bar {
        padding: 16px 24px;
        display: flex;
        align-items: center;
        background: #f5f5f5;
        border-bottom: 1px solid #e0e0e0;
      }
      .filter-tabs {
        display: flex;
        gap: 8px;
      }
      .filter-tab {
        padding: 6px 16px;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        font-size: 0.875rem;
        font-weight: 500;
        color: #666;
        background: transparent;
        transition:
          background 0.15s,
          color 0.15s;
      }
      .filter-tab:hover {
        background: #e0e0e0;
      }
      .filter-tab--active {
        background: #ffffff;
        color: #00a896;
        font-weight: 500;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      }

      /* Loading / Error rows */
      .loading-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 48px;
        color: #666;
        font-size: 0.875rem;
      }
      .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #e0e0e0;
        border-top-color: #00a896;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .error-message {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 16px 24px;
        background: #ffebee;
        color: #c62828;
        font-size: 0.875rem;
      }

      /* Table */
      .table-scroll {
        overflow-x: auto;
      }
      .data-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
      }
      .table-head-row {
        background: #f5f5f5;
      }
      .th {
        padding: 12px 24px;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: rgba(0, 0, 0, 0.6);
        white-space: nowrap;
      }
      .th--center {
        text-align: center;
      }
      .th--right {
        text-align: right;
      }

      .table-row {
        border-top: 1px solid #e0e0e0;
        transition: background 0.12s;
      }
      .table-row:hover {
        background: #fafafa;
      }
      .table-row--inactive .job-title {
        opacity: 0.5;
      }
      .table-row--inactive .dept-text {
        opacity: 0.5;
      }

      .td {
        padding: 16px 24px;
        font-size: 0.875rem;
        color: rgba(0, 0, 0, 0.87);
        vertical-align: middle;
      }
      .td--center {
        text-align: center;
      }
      .td--right {
        text-align: right;
      }

      .job-title {
        font-size: 0.9375rem;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.87);
        margin: 0 0 2px;
      }
      .job-type {
        font-size: 0.75rem;
        color: #666;
        font-style: italic;
        margin: 0;
      }

      /* Status badge */
      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
      }
      .status-badge--active {
        background: rgba(0, 168, 150, 0.08);
        color: #008a7b;
        border: 1px solid rgba(0, 168, 150, 0.2);
      }
      .status-badge--inactive {
        background: #f5f5f5;
        color: rgba(0, 0, 0, 0.6);
        border: 1px solid #e0e0e0;
      }
      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .status-dot--active {
        background: #00a896;
      }
      .status-dot--inactive {
        background: #9e9e9e;
      }

      .dept-text {
        font-size: 0.875rem;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.6);
      }

      .location-cell {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.875rem;
        color: rgba(0, 0, 0, 0.6);
      }
      .location-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        opacity: 0.5;
      }

      /* Action buttons */
      .action-group {
        display: inline-flex;
        justify-content: flex-end;
        gap: 0;
      }
      .action-btn--view {
        color: rgba(0, 0, 0, 0.38);
      }

      /* Empty row */
      .empty-row {
        text-align: center;
        padding: 48px 24px;
        color: #666;
      }
      .empty-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
        display: block;
        margin: 0 auto 12px;
        opacity: 0.4;
      }

      /* Pagination */
      .pagination-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 16px;
        border-top: 1px solid #e0e0e0;
      }
      .pagination-info {
        font-size: 14px;
        color: #666;
        margin: 0;
      }
      .pagination-controls {
        display: flex;
        gap: 4px;
        align-items: center;
      }
      .page-btn {
        width: 36px;
        height: 36px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        border: 1px solid #e0e0e0;
        background: transparent;
        color: rgba(0, 0, 0, 0.6);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.12s;
      }
      .page-btn:hover:not([disabled]) {
        background: #f5f5f5;
      }
      .page-btn--active {
        background: #00a896;
        color: #ffffff;
        border-color: #00a896;
      }
      .page-btn--nav {
        color: rgba(0, 0, 0, 0.38);
      }
      .page-btn[disabled] {
        opacity: 0.38;
        cursor: default;
      }

      /* ── Insight Section ──────────────────────────────────────────────────── */
      .insight-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 16px;
      }
      .insight-card {
        border-radius: 8px;
        padding: 24px;
        position: relative;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .insight-card--momentum {
        background: #ffffff;
      }
      .insight-card--activity {
        background: #f5f5f5;
      }
      .insight-content {
        position: relative;
        z-index: 1;
      }
      .insight-bg-icon {
        position: absolute;
        right: -24px;
        bottom: -24px;
        font-size: 8rem;
        width: 8rem;
        height: 8rem;
        color: #00a896;
        opacity: 0.06;
        pointer-events: none;
      }
      .insight-title {
        font-size: 1.25rem;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.87);
        margin: 0 0 12px;
      }
      .insight-title--activity {
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 20px;
      }
      .activity-bolt {
        color: #00a896;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
      .insight-body {
        font-size: 0.875rem;
        color: rgba(0, 0, 0, 0.6);
        line-height: 1.6;
        max-width: 440px;
        margin: 0 0 20px;
      }
      .insight-stats {
        display: flex;
        gap: 24px;
        align-items: center;
      }
      .insight-stat-label {
        font-size: 0.7rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #666;
        margin: 0 0 4px;
      }
      .insight-stat-value {
        font-size: 1.25rem;
        font-weight: 700;
        margin: 0;
      }
      .insight-stat-value--primary {
        color: #00a896;
      }
      .insight-stat-value--secondary {
        color: rgba(0, 0, 0, 0.6);
      }
      .insight-divider {
        width: 1px;
        height: 32px;
        background: #e0e0e0;
      }

      /* Activity list */
      .activity-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .activity-item {
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }
      .activity-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-top: 5px;
        flex-shrink: 0;
      }
      .activity-dot--primary {
        background: #00a896;
      }
      .activity-dot--secondary {
        background: rgba(0, 0, 0, 0.38);
      }
      .activity-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.87);
        margin: 0 0 2px;
      }
      .activity-meta {
        font-size: 0.75rem;
        color: #666;
        margin: 0;
      }
      .btn-audit {
        width: 100%;
        margin-top: 24px;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid rgba(0, 168, 150, 0.3);
        background: transparent;
        color: #00a896;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.15s;
      }
      .btn-audit:hover {
        background: rgba(0, 168, 150, 0.05);
      }

      /* ── Responsive ──────────────────────────────────────────────────────── */
      @media (max-width: 1024px) {
        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .insight-grid {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 640px) {
        .page-wrap {
          padding: 16px;
        }
        .stats-grid {
          grid-template-columns: 1fr;
        }
        .page-header {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class RecruitmentListComponent implements OnInit {
  private readonly recruitmentApi = inject(RecruitmentApiService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  // State
  jobs = signal<JobPosting[]>([]);
  totalElements = signal(0);
  totalPages = signal(0);
  pageIndex = signal(0);
  pageSize = signal(10);
  loading = signal(false);
  error = signal<string | null>(null);
  activeFilter = signal<'all' | 'active' | 'hidden'>('all');

  // Computed
  filteredJobs = computed(() => {
    const f = this.activeFilter();
    const all = this.jobs();
    if (f === 'active') return all.filter((j) => j.isActive);
    if (f === 'hidden') return all.filter((j) => !j.isActive);
    return all;
  });

  pagedJobs = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredJobs().slice(start, start + this.pageSize());
  });

  activeCount = computed(() => this.jobs().filter((j) => j.isActive).length);
  hiddenCount = computed(() => this.jobs().filter((j) => !j.isActive).length);

  paginationStart = computed(() =>
    this.filteredJobs().length === 0
      ? 0
      : this.pageIndex() * this.pageSize() + 1,
  );
  paginationEnd = computed(() =>
    Math.min(
      (this.pageIndex() + 1) * this.pageSize(),
      this.filteredJobs().length,
    ),
  );

  pageNumbers = computed(() => {
    const count = Math.ceil(this.filteredJobs().length / this.pageSize());
    return Array.from({ length: count }, (_, i) => i);
  });

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.loading.set(true);
    this.error.set(null);

    this.recruitmentApi
      .getAllAdmin({ page: 0, size: 200 })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.jobs.set(response.data.data);
          this.totalElements.set(response.data.totalElements);
          this.totalPages.set(response.data.totalPages);
          this.pageIndex.set(0);
        },
        error: () => {
          this.error.set(
            'Không thể tải danh sách vị trí tuyển dụng. Vui lòng thử lại.',
          );
        },
      });
  }

  setFilter(f: 'all' | 'active' | 'hidden'): void {
    this.activeFilter.set(f);
    this.pageIndex.set(0);
  }

  goToPage(p: number): void {
    const max = this.pageNumbers().length - 1;
    if (p < 0 || p > max) return;
    this.pageIndex.set(p);
  }

  navigateToCreate(): void {
    this.router.navigate(['/management/recruitment/create']);
  }

  navigateToEdit(job: JobPosting): void {
    this.router.navigate(['/management/recruitment', job.id, 'edit']);
  }

  openDeleteDialog(job: JobPosting): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Xóa vị trí tuyển dụng',
        message: `Bạn có chắc chắn muốn xóa "${job.title}"? Hành động này không thể hoàn tác.`,
        confirmText: 'Xóa',
        cancelText: 'Hủy',
        confirmColor: 'warn',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.deleteJob(job);
    });
  }

  private deleteJob(job: JobPosting): void {
    this.recruitmentApi.delete(job.id).subscribe({
      next: () => {
        this.notification.showSuccess('Xóa vị trí tuyển dụng thành công');
        this.loadJobs();
      },
      error: () => {
        this.notification.showError('Không thể xóa vị trí tuyển dụng');
      },
    });
  }

  formatType(type?: string): string {
    const map: Record<string, string> = {
      FULL_TIME: 'Toàn thời gian',
      CONTRACT: 'Hợp đồng',
      PART_TIME: 'Bán thời gian',
      'Full-time': 'Toàn thời gian',
      Contract: 'Hợp đồng',
      'Part-time': 'Bán thời gian',
    };
    return type ? (map[type] ?? type) : '';
  }
}
