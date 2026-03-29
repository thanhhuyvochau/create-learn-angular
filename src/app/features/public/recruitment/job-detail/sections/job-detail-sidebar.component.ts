import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import type { JobPosting } from '../../../../../models/recruitment.model';
import {
  ApplyDialogComponent,
} from '../apply-dialog.component';

@Component({
  selector: 'app-job-detail-sidebar',
  standalone: true,
  imports: [RouterModule, MatIconModule, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="sidebar">

      <!-- Application details card -->
      <div class="details-card">
        <h3 class="details-heading">Chi Tiết Đơn Ứng Tuyển</h3>

        <dl class="details-list">
          @if (job().deadline) {
            <div class="detail-row">
              <dt class="detail-label">Hạn Nộp Hồ Sơ</dt>
              <dd class="detail-value">{{ job().deadline }}</dd>
            </div>
          }
          @if (job().recruiter) {
            <div class="detail-row">
              <dt class="detail-label">Nhà Tuyển Dụng</dt>
              <dd class="detail-value">{{ job().recruiter }}</dd>
            </div>
          }
          @if (job().reference) {
            <div class="detail-row">
              <dt class="detail-label">Mã Tham Chiếu</dt>
              <dd class="detail-value detail-value--mono">{{ job().reference }}</dd>
            </div>
          }
        </dl>

        <button class="btn-apply" (click)="openApply()">
          Ứng Tuyển Ngay
        </button>
        <button class="btn-save" (click)="openSave()">
          Lưu Để Xem Sau
        </button>

        <!-- Quote footer -->
        <div class="quote-block">
          <p class="quote-text">
            "Gia nhập cộng đồng các nhà giáo dục tận tâm, không ngừng mở rộng ranh giới của giáo dục thuật toán."
          </p>
        </div>
      </div>

      <!-- Browse card -->
      <div class="browse-card">
        <h4 class="browse-heading">Chưa phù hợp?</h4>
        <p class="browse-body">Khám phá các vị trí tuyển dụng khác trong các bộ phận STEM và Nhân văn.</p>
        <a class="browse-link" routerLink="/recruitment">
          Xem tất cả vị trí tuyển dụng
          <mat-icon class="browse-arrow">arrow_forward</mat-icon>
        </a>
      </div>

    </aside>
  `,
  styles: [`
    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* Details card */
    .details-card {
      background: #ffffff;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(187, 202, 197, 0.2);
      position: sticky;
      top: 96px;
    }

    .details-heading {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--color-brand-navy-6);
      margin: 0 0 20px;
    }

    /* Detail rows */
    .details-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 0 0 28px;
      padding: 0;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 12px;
      font-size: 0.875rem;
    }

    .detail-label {
      color: var(--color-brand-navy-4, #5b7db1);
      font-weight: 500;
      white-space: nowrap;
    }

    .detail-value {
      color: var(--color-brand-navy-6);
      font-weight: 700;
      text-align: right;
    }

    .detail-value--mono {
      font-family: 'Roboto Mono', monospace;
      font-size: 0.8rem;
    }

    /* CTA buttons */
    .btn-apply,
    .btn-save {
      width: 100%;
      border-radius: 9999px;
      font-family: inherit;
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      padding: 14px 0;
      cursor: pointer;
      transition: box-shadow 0.2s ease, transform 0.15s ease;
      display: block;
    }

    .btn-apply {
      background: var(--color-brand-teal-6);
      color: #ffffff;
      border: none;
      margin-bottom: 12px;
      box-shadow: 0 4px 16px rgba(0, 107, 95, 0.25);
    }

    .btn-apply:hover {
      box-shadow: 0 6px 24px rgba(0, 107, 95, 0.35);
      transform: translateY(-1px);
    }

    .btn-save {
      background: transparent;
      color: var(--color-brand-teal-6);
      border: 2px solid var(--color-brand-teal-6);
    }

    .btn-save:hover {
      background: rgba(0, 107, 95, 0.05);
    }

    /* Quote block */
    .quote-block {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid rgba(187, 202, 197, 0.4);
    }

    .quote-text {
      font-size: 0.8rem;
      color: var(--color-slate-5);
      font-style: italic;
      line-height: 1.6;
      margin: 0;
    }

    /* Browse card */
    .browse-card {
      background: var(--color-brand-navy-6);
      border-radius: 12px;
      padding: 32px;
      color: #ffffff;
    }

    .browse-heading {
      font-size: 1.05rem;
      font-weight: 700;
      margin: 0 0 8px;
    }

    .browse-body {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.75);
      margin: 0 0 20px;
      line-height: 1.55;
    }

    .browse-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #79f7e3;
      font-weight: 700;
      font-size: 0.875rem;
      text-decoration: none;
      transition: gap 0.2s ease;
    }

    .browse-link:hover {
      gap: 10px;
    }

    .browse-arrow {
      font-size: 1rem !important;
      width: 1rem !important;
      height: 1rem !important;
      line-height: 1rem !important;
    }
  `],
})
export class JobDetailSidebarComponent {
  readonly job = input.required<JobPosting>();

  private readonly dialog = inject(MatDialog);

  openApply(): void {
    this.dialog.open(ApplyDialogComponent, {
      width: '480px',
      data: { mode: 'apply', jobTitle: this.job().title },
    });
  }

  openSave(): void {
    this.dialog.open(ApplyDialogComponent, {
      width: '480px',
      data: { mode: 'save', jobTitle: this.job().title },
    });
  }
}
