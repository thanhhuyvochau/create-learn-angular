import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ApplyDialogData {
  mode: 'apply' | 'save';
  jobTitle: string;
}

@Component({
  selector: 'app-apply-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (data.mode === 'apply') {
      <h2 mat-dialog-title class="dialog-title">Ứng Tuyển Vị Trí Này</h2>
      <mat-dialog-content class="dialog-content">
        <div class="dialog-icon-row">
          <mat-icon class="dialog-icon dialog-icon--apply">send</mat-icon>
        </div>
        <p class="dialog-lead">Bạn đang ứng tuyển vị trí:</p>
        <p class="dialog-job-title">{{ data.jobTitle }}</p>
        <p class="dialog-body">
          Chức năng nộp đơn đầy đủ sẽ sớm ra mắt. Đội ngũ tuyển dụng của chúng tôi sẽ liên hệ với bạn
          khi cổng thông tin chính thức hoạt động. Trong thời gian chờ đợi, bạn có thể liên hệ chúng tôi qua
          <a class="dialog-link" href="mailto:huynhkykhoinguyen0710&#64;gmail.com">huynhkykhoinguyen0710&#64;gmail.com</a>.
        </p>
      </mat-dialog-content>
      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button (click)="onClose()">Hủy</button>
        <button mat-flat-button class="btn-primary" (click)="onClose()">
          Đã Hiểu
        </button>
      </mat-dialog-actions>
    } @else {
      <h2 mat-dialog-title class="dialog-title">Lưu Để Xem Sau</h2>
      <mat-dialog-content class="dialog-content">
        <div class="dialog-icon-row">
          <mat-icon class="dialog-icon dialog-icon--save">bookmark_border</mat-icon>
        </div>
        <p class="dialog-lead">Đang lưu:</p>
        <p class="dialog-job-title">{{ data.jobTitle }}</p>
        <p class="dialog-body">
          Tính năng lưu việc làm sẽ sớm ra mắt. Hãy đánh dấu trang này hoặc ghi lại mã tham chiếu
          để quay lại khi bạn sẵn sàng.
        </p>
      </mat-dialog-content>
      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button (click)="onClose()">Hủy</button>
        <button mat-flat-button class="btn-primary" (click)="onClose()">
          Đã Hiểu
        </button>
      </mat-dialog-actions>
    }
  `,
  styles: [`
    .dialog-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-brand-navy-6);
      padding: 24px 24px 0;
      margin: 0;
    }

    .dialog-content {
      padding: 16px 24px 8px !important;
      min-width: 320px;
      max-width: 440px;
    }

    .dialog-icon-row {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }

    .dialog-icon {
      font-size: 3rem !important;
      width: 3rem !important;
      height: 3rem !important;
      line-height: 3rem !important;
    }

    .dialog-icon--apply {
      color: var(--color-brand-teal-6);
    }

    .dialog-icon--save {
      color: var(--color-brand-navy-4, #5b7db1);
    }

    .dialog-lead {
      font-size: 0.8rem;
      color: var(--color-slate-5);
      margin: 0 0 4px;
      text-align: center;
    }

    .dialog-job-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--color-brand-navy-6);
      text-align: center;
      margin: 0 0 16px;
    }

    .dialog-body {
      font-size: 0.9rem;
      color: var(--color-slate-5);
      line-height: 1.6;
      margin: 0;
      text-align: center;
    }

    .dialog-link {
      color: var(--color-brand-teal-6);
      text-decoration: none;
      font-weight: 600;
    }

    .dialog-link:hover {
      text-decoration: underline;
    }

    .dialog-actions {
      padding: 8px 16px 16px !important;
      gap: 8px;
    }

    .btn-primary {
      background: var(--color-brand-teal-6) !important;
      color: #ffffff !important;
      border-radius: 9999px !important;
      padding: 0 24px !important;
    }
  `],
})
export class ApplyDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ApplyDialogComponent>);
  readonly data: ApplyDialogData = inject(MAT_DIALOG_DATA);

  onClose(): void {
    this.dialogRef.close();
  }
}
