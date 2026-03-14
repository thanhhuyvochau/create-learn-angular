import { Component, inject, signal, OnInit, TemplateRef, viewChild, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';

import {
  PageHeaderComponent,
  DataTableComponent,
  PaginationComponent,
  ConfirmDialogComponent,
  LoadingSpinnerComponent,
  StatusBadgeComponent,
  type ColumnDef,
  type ConfirmDialogData,
  type CellTemplateContext,
} from '../../../../shared/components';
import { ConsultationApiService } from '../../../../core/api';
import { NotificationService } from '../../../../core/notifications/notification.service';
import type {
  Consultation,
  ConsultationStatus,
  UpdateConsultationRequest,
} from '../../../../models';

@Component({
  selector: 'app-consultation-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    DataTableComponent,
    PaginationComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
  ],
  template: `
    <div class="consultation-list-container">
      <app-page-header
        title="Consultations"
        subtitle="Manage customer consultation requests"
        [showAddButton]="false"
      ></app-page-header>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (error()) {
        <div class="error-message">
          <mat-icon>error</mat-icon>
          <span>{{ error() }}</span>
          <button mat-button color="primary" (click)="loadConsultations()">Retry</button>
        </div>
      } @else {
        <div class="table-section">
          <app-data-table
            [data]="consultations()"
            [columns]="columns"
            [cellTemplates]="cellTemplates()"
            [showActions]="true"
            [emptyMessage]="'No consultations found'"
            (edit)="openEditDialog($event)"
            (delete)="openDeleteDialog($event)"
          >
          </app-data-table>

          <ng-template #statusTemplate let-row>
            <app-status-badge [status]="row.status"></app-status-badge>
          </ng-template>

          <div class="table-footer">
            <span class="table-caption">
              Showing {{ consultations().length }} of {{ totalElements() }} items
            </span>
            <app-pagination
              [totalElements]="totalElements()"
              [pageSize]="pageSize()"
              [pageIndex]="pageIndex()"
              (pageChange)="onPageChange($event)"
            ></app-pagination>
          </div>
        </div>
      }

      <!-- Edit Status Dialog -->
      @if (dialogOpen()) {
        <div class="dialog-overlay" (click)="closeDialog()">
          <div class="dialog-content" (click)="$event.stopPropagation()">
            <div class="dialog-header">
              <h2>Update Consultation Status</h2>
              <button mat-icon-button (click)="closeDialog()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <div class="dialog-body">
              <div class="info-section">
                <p><strong>Customer:</strong> {{ editingConsultation()?.customerName }}</p>
                <p><strong>Email:</strong> {{ editingConsultation()?.email }}</p>
                <p><strong>Phone:</strong> {{ editingConsultation()?.phoneNumber }}</p>
                <p><strong>Content:</strong></p>
                <p class="content-text">{{ editingConsultation()?.content }}</p>
              </div>

              <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Status</mat-label>
                  <mat-select formControlName="status">
                    <mat-option value="PROCESSING">Processing</mat-option>
                    <mat-option value="PROCESSED">Processed</mat-option>
                    <mat-option value="REJECTED">Rejected</mat-option>
                  </mat-select>
                </mat-form-field>

                <div class="dialog-actions">
                  <button
                    type="button"
                    mat-button
                    (click)="closeDialog()"
                    [disabled]="submitting()"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    mat-raised-button
                    color="primary"
                    [disabled]="form.invalid || submitting()"
                  >
                    @if (submitting()) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      Update Status
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .consultation-list-container {
        padding: 24px;
      }

      .error-message {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 16px;
        background: #ffebee;
        border-radius: 8px;
        color: #c62828;
      }

      .table-section {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      .table-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
        border-top: 1px solid #e0e0e0;
      }

      .table-caption {
        font-size: 14px;
        color: #666;
      }

      .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .dialog-content {
        background: white;
        border-radius: 8px;
        width: 100%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
      }

      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid #e0e0e0;
      }

      .dialog-header h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }

      .dialog-body {
        padding: 24px;
      }

      .info-section {
        margin-bottom: 24px;
        padding: 16px;
        background: #f5f5f5;
        border-radius: 8px;
      }

      .info-section p {
        margin: 8px 0;
      }

      .content-text {
        white-space: pre-wrap;
        color: #666;
      }

      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
      }

      .dialog-actions mat-spinner {
        display: inline-block;
      }
    `,
  ],
})
export class ConsultationListComponent implements OnInit {
  private readonly consultationApi = inject(ConsultationApiService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  // Cell templates
  statusTemplate = viewChild.required<TemplateRef<CellTemplateContext<Consultation>>>('statusTemplate');
  cellTemplates = computed(() => ({
    status: this.statusTemplate(),
  }));

  // State signals
  consultations = signal<Consultation[]>([]);
  totalElements = signal(0);
  totalPages = signal(0);
  pageIndex = signal(0);
  pageSize = signal(10);
  loading = signal(false);
  error = signal<string | null>(null);
  dialogOpen = signal(false);
  editingConsultation = signal<Consultation | null>(null);
  submitting = signal(false);

  // Form
  form = this.fb.group({
    status: ['PROCESSING' as ConsultationStatus, Validators.required],
  });

  // Column definitions
  columns: ColumnDef<Consultation>[] = [
    { key: 'customerName', header: 'Customer Name' },
    { key: 'email', header: 'Email' },
    { key: 'phoneNumber', header: 'Phone' },
    {
      key: 'content',
      header: 'Content',
      render: (row) => row.content?.length > 50 ? row.content.slice(0, 50) + '...' : row.content,
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
    },
  ];

  ngOnInit(): void {
    this.loadConsultations();
  }

  loadConsultations(): void {
    this.loading.set(true);
    this.error.set(null);

    this.consultationApi
      .getAll({ page: this.pageIndex(), size: this.pageSize() })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.status === 200 && response.data) {
            this.consultations.set(response.data.data);
            this.totalElements.set(response.data.totalElements);
            this.totalPages.set(response.data.totalPages);
          }
        },
        error: (err) => {
          console.error('Failed to load consultations:', err);
          this.error.set('Failed to load consultations. Please try again.');
        },
      });
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadConsultations();
  }

  openEditDialog(consultation: Consultation): void {
    this.editingConsultation.set(consultation);
    this.form.patchValue({
      status: consultation.status,
    });
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
    this.editingConsultation.set(null);
    this.form.reset({ status: 'PROCESSING' });
  }

  onSubmit(): void {
    if (this.form.invalid || !this.editingConsultation()) return;

    this.submitting.set(true);
    const formValue = this.form.value;

    const updateData: UpdateConsultationRequest = {
      id: this.editingConsultation()!.id,
      status: formValue.status as ConsultationStatus,
    };

    this.consultationApi
      .update(this.editingConsultation()!.id, updateData)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.notification.showSuccess('Consultation status updated successfully');
          this.closeDialog();
          this.loadConsultations();
        },
        error: (err) => {
          console.error('Failed to update consultation:', err);
          this.notification.showError('Failed to update consultation');
        },
      });
  }

  openDeleteDialog(consultation: Consultation): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Consultation',
        message: `Are you sure you want to delete this consultation from "${consultation.customerName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteConsultation(consultation);
      }
    });
  }

  private deleteConsultation(consultation: Consultation): void {
    this.consultationApi.delete(consultation.id).subscribe({
      next: () => {
        this.notification.showSuccess('Consultation deleted successfully');
        this.loadConsultations();
      },
      error: (err) => {
        console.error('Failed to delete consultation:', err);
        this.notification.showError('Failed to delete consultation');
      },
    });
  }
}
