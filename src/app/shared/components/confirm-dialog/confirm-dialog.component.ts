import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

export interface ConfirmDialogData {
  title?: string;
  message?: string;
  entityLabel?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title || 'Xác nhận' }}</h2>
    <mat-dialog-content>
      @if (data.entityLabel) {
        <p>
          Bạn có chắc chắn muốn xóa
          <strong>{{ data.entityLabel }}</strong
          >?
        </p>
      } @else if (data.message) {
        <p>{{ data.message }}</p>
      } @else {
        <p>Bạn có chắc chắn muốn tiếp tục?</p>
      }
      <p class="warning-text">Hành động này không thể hoàn tác.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        {{ data.cancelText || 'Hủy' }}
      </button>
      <button
        mat-flat-button
        [color]="data.confirmColor || 'warn'"
        (click)="onConfirm()"
      >
        {{ data.confirmText || 'Xóa' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .warning-text {
        color: #666;
        font-size: 0.875rem;
        margin-top: 8px;
      }

      mat-dialog-content {
        min-width: 300px;
      }

      mat-dialog-actions {
        padding: 16px 0 0;
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  readonly data: ConfirmDialogData = inject(MAT_DIALOG_DATA);

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
