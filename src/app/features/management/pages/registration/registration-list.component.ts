import { Component, inject, signal, OnInit, TemplateRef, viewChild, computed, DestroyRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, forkJoin, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
import { RegistrationApiService, ClassApiService } from '../../../../core/api';
import { NotificationService } from '../../../../core/notifications/notification.service';
import type {
  Registration,
  RegistrationStatus,
  UpdateRegistrationRequest,
  ClassOption,
  Class,
} from '../../../../models';

@Component({
  selector: 'app-registration-list',
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
    <div class="registration-list-container">
      <app-page-header
        title="Đăng ký"
        subtitle="Quản lý đăng ký lớp học"
        [showAddButton]="false"
      ></app-page-header>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (error()) {
        <div class="error-message">
          <mat-icon>error</mat-icon>
          <span>{{ error() }}</span>
          <button mat-button color="primary" (click)="loadRegistrations()">Thử lại</button>
        </div>
      } @else {
        <div class="table-section">
          <div class="search-bar">
            <mat-form-field
              appearance="outline"
              subscriptSizing="dynamic"
              class="search-field"
            >
              <mat-label>Tìm kiếm</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input
                matInput
                [value]="searchTerm()"
                (input)="onSearch($event)"
                placeholder="Tìm theo tên, email, số điện thoại..."
              />
            </mat-form-field>
          </div>
          <app-data-table
            [data]="registrations()"
            [columns]="columns"
            [cellTemplates]="cellTemplates()"
            [showActions]="true"
            [emptyMessage]="'Không tìm thấy đăng ký nào'"
            (edit)="openEditDialog($event)"
            (delete)="openDeleteDialog($event)"
          >
          </app-data-table>

          <ng-template #statusTemplate let-row>
            <app-status-badge [status]="row.status"></app-status-badge>
          </ng-template>

          <div class="table-footer">
            <span class="table-caption">
              Hiển thị {{ registrations().length }} trên {{ totalElements() }} mục
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
              <h2>Cập nhật trạng thái đăng ký</h2>
              <button mat-icon-button (click)="closeDialog()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <div class="dialog-body">
              <div class="info-section">
                <div class="info-row">
                  <span class="info-label">Khách hàng:</span>
                  <span class="info-value">{{ editingRegistration()?.customerName }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">{{ editingRegistration()?.customerEmail }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Điện thoại:</span>
                  <span class="info-value">{{ editingRegistration()?.phoneNumber }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Lớp học:</span>
                  <span class="info-value">{{ editingRegistration()?.classResponse?.name || 'N/A' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Giáo viên:</span>
                  <span class="info-value">
                    @if (editingRegistration()?.classResponse?.teacher) {
                      {{ editingRegistration()?.classResponse?.teacher?.firstName }}
                      {{ editingRegistration()?.classResponse?.teacher?.lastName }}
                    } @else {
                      N/A
                    }
                  </span>
                </div>
              </div>

              <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Trạng thái</mat-label>
                  <mat-select formControlName="status">
                    <mat-option value="PROCESSING">Đang xử lý</mat-option>
                    <mat-option value="PROCESSED">Đã xử lý</mat-option>
                    <mat-option value="REJECTED">Từ chối</mat-option>
                  </mat-select>
                </mat-form-field>

                <div class="dialog-actions">
                  <button
                    type="button"
                    mat-button
                    (click)="closeDialog()"
                    [disabled]="submitting()"
                  >
                    Hủy
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
                      Cập nhật trạng thái
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
      .registration-list-container {
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

      .search-bar {
        padding: 16px 16px 0;
      }

      .search-field {
        width: 100%;
        max-width: 400px;
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

      .info-row {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
      }

      .info-row:last-child {
        margin-bottom: 0;
      }

      .info-label {
        font-weight: 500;
        min-width: 80px;
        color: #666;
      }

      .info-value {
        color: #333;
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
export class RegistrationListComponent implements OnInit {
  private readonly registrationApi = inject(RegistrationApiService);
  private readonly classApi = inject(ClassApiService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  // Cell templates
  statusTemplate = viewChild.required<TemplateRef<CellTemplateContext<Registration>>>('statusTemplate');
  cellTemplates = computed(() => ({
    status: this.statusTemplate(),
  }));

  // State signals
  registrations = signal<Registration[]>([]);
  classOptions = signal<ClassOption[]>([]);
  totalElements = signal(0);
  totalPages = signal(0);
  pageIndex = signal(0);
  pageSize = signal(10);
  loading = signal(false);
  error = signal<string | null>(null);
  dialogOpen = signal(false);
  editingRegistration = signal<Registration | null>(null);
  submitting = signal(false);
  searchTerm = signal('');
  private readonly searchInput$ = new Subject<string>();
  private readonly destroyRef = inject(DestroyRef);

  // Form
  form = this.fb.group({
    status: ['PROCESSING' as RegistrationStatus, Validators.required],
  });

  // Column definitions
  columns: ColumnDef<Registration>[] = [
    { key: 'customerName', header: 'Tên khách hàng' },
    { key: 'customerEmail', header: 'Email' },
    { key: 'phoneNumber', header: 'Điện thoại' },
    {
      key: 'classResponse',
      header: 'Lớp học',
      render: (row) => row.classResponse?.name || 'N/A',
    },
    {
      key: 'teacher',
      header: 'Giáo viên',
      render: (row) => {
        const teacher = row.classResponse?.teacher;
        return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'N/A';
      },
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '200px',
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      render: (row) => {
        if (!row.createdAt) return 'N/A';
        return new Date(row.createdAt).toLocaleDateString();
      },
    },
  ];

  ngOnInit(): void {
    this.loadInitialData();

    this.searchInput$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((term: string) => {
        this.searchTerm.set(term);
        this.pageIndex.set(0);
        this.loadRegistrations();
      });
  }

  private loadInitialData(): void {
    this.loading.set(true);
    this.error.set(null);

    // Load registrations and class options in parallel
    forkJoin({
      registrations: this.registrationApi.getAll({ page: this.pageIndex(), size: this.pageSize() }),
      classes: this.classApi.getAllForAdmin({ page: 0, size: 100 }),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ registrations, classes }) => {
          if (registrations.status === 200 && registrations.data) {
            this.registrations.set(registrations.data.data);
            this.totalElements.set(registrations.data.totalElements);
            this.totalPages.set(registrations.data.totalPages);
          }

          if (classes.status === 200 && classes.data) {
            const options = classes.data.data.map((c: Class) => ({
              value: String(c.id),
              label: c.name,
            }));
            this.classOptions.set(options);
          }
        },
        error: (err) => {
          console.error('Failed to load data:', err);
          this.error.set('Không thể tải danh sách đăng ký. Vui lòng thử lại.');
        },
      });
  }

  loadRegistrations(): void {
    this.loading.set(true);
    this.error.set(null);

    this.registrationApi
      .getAll({ page: this.pageIndex(), size: this.pageSize(), search: this.searchTerm() || undefined })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.status === 200 && response.data) {
            this.registrations.set(response.data.data);
            this.totalElements.set(response.data.totalElements);
            this.totalPages.set(response.data.totalPages);
          }
        },
        error: (err) => {
          console.error('Failed to load registrations:', err);
          this.error.set('Không thể tải danh sách đăng ký. Vui lòng thử lại.');
        },
      });
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadRegistrations();
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchInput$.next(value);
  }

  openEditDialog(registration: Registration): void {
    this.editingRegistration.set(registration);
    this.form.patchValue({
      status: registration.status,
    });
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
    this.editingRegistration.set(null);
    this.form.reset({ status: 'PROCESSING' });
  }

  onSubmit(): void {
    if (this.form.invalid || !this.editingRegistration()) return;

    this.submitting.set(true);
    const formValue = this.form.value;

    const updateData: UpdateRegistrationRequest = {
      id: this.editingRegistration()!.id,
      status: formValue.status as RegistrationStatus,
    };

    this.registrationApi
      .update(this.editingRegistration()!.id, updateData)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.notification.showSuccess('Cập nhật trạng thái đăng ký thành công');
          this.closeDialog();
          this.loadRegistrations();
        },
        error: (err) => {
          console.error('Failed to update registration:', err);
          this.notification.showError('Không thể cập nhật đăng ký');
        },
      });
  }

  openDeleteDialog(registration: Registration): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Xóa đăng ký',
        message: `Bạn có chắc chắn muốn xóa đăng ký của "${registration.customerName}"? Hành động này không thể hoàn tác.`,
        confirmText: 'Xóa',
        cancelText: 'Hủy',
        confirmColor: 'warn',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteRegistration(registration);
      }
    });
  }

  private deleteRegistration(registration: Registration): void {
    this.registrationApi.delete(registration.id).subscribe({
      next: () => {
        this.notification.showSuccess('Xóa đăng ký thành công');
        this.loadRegistrations();
      },
      error: (err) => {
        console.error('Failed to delete registration:', err);
        this.notification.showError('Không thể xóa đăng ký');
      },
    });
  }
}
