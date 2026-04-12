import { Component, inject, signal, OnInit, TemplateRef, viewChild, computed, DestroyRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, Subject } from 'rxjs';
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
import { AccountApiService } from '../../../../core/api';
import { NotificationService } from '../../../../core/notifications/notification.service';
import type {
  Account,
  CreateAccountRequest,
  UpdateAccountRequest,
} from '../../../../models';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    DataTableComponent,
    PaginationComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
  ],
  template: `
    <div class="account-list-container">
      <app-page-header
        title="Tài khoản"
        subtitle="Quản lý tài khoản người dùng"
        (addClick)="openCreateDialog()"
      ></app-page-header>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (error()) {
        <div class="error-message">
          <mat-icon>error</mat-icon>
          <span>{{ error() }}</span>
          <button mat-button color="primary" (click)="loadAccounts()">Thử lại</button>
        </div>
      } @else {
        <div class="table-section">
          <div class="search-bar">
            <mat-form-field
              appearance="outline"
              subscriptSizing="dynamic"
              class="search-field small"
            >
              <mat-label>Tìm kiếm</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input
                matInput
                [value]="searchTerm()"
                (input)="onSearch($event)"
                placeholder="Tìm theo tên đăng nhập, email, số điện thoại..."
              />
            </mat-form-field>
          </div>
          <app-data-table
            [data]="accounts()"
            [columns]="columns"
            [cellTemplates]="cellTemplates()"
            [showActions]="true"
            [emptyMessage]="'Không tìm thấy tài khoản nào'"
            (edit)="openEditDialog($event)"
            (delete)="openDeleteDialog($event)"
          >
          </app-data-table>

          <ng-template #statusTemplate let-row>
            <app-status-badge [status]="row.activated ? 'ACTIVE' : 'INACTIVE'"></app-status-badge>
          </ng-template>

          <div class="table-footer">
            <span class="table-caption">
              Hiển thị {{ accounts().length }} trên {{ totalElements() }} mục
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

      <!-- Create/Edit Dialog -->
      @if (dialogOpen()) {
        <div class="dialog-overlay" (click)="closeDialog()">
          <div class="dialog-content" (click)="$event.stopPropagation()">
            <div class="dialog-header">
              <h2>{{ editingAccount() ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản' }}</h2>
              <button mat-icon-button (click)="closeDialog()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="dialog-body" autocomplete="off">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tên đăng nhập</mat-label>
                <input
                  matInput
                  formControlName="username"
                  placeholder="Nhập tên đăng nhập"
                  autocomplete="off"
                  data-form-type="other"
                />
                @if (form.controls.username.hasError('required')) {
                  <mat-error>Tên đăng nhập là bắt buộc</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input
                  matInput
                  formControlName="email"
                  placeholder="Nhập địa chỉ email"
                  type="email"
                  autocomplete="off"
                  data-form-type="other"
                />
                @if (form.controls.email.hasError('required')) {
                  <mat-error>Email là bắt buộc</mat-error>
                } @else if (form.controls.email.hasError('pattern')) {
                  <mat-error>Vui lòng nhập địa chỉ email hợp lệ</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ editingAccount() ? 'Mật khẩu (để trống nếu giữ nguyên)' : 'Mật khẩu' }}</mat-label>
                <input
                  matInput
                  formControlName="password"
                  [placeholder]="editingAccount() ? 'Để trống để giữ mật khẩu hiện tại' : 'Nhập mật khẩu'"
                  type="password"
                  autocomplete="new-password"
                  data-form-type="other"
                />
                @if (form.controls.password.hasError('required')) {
                  <mat-error>Mật khẩu là bắt buộc</mat-error>
                } @else if (form.controls.password.hasError('minlength')) {
                  <mat-error>Mật khẩu phải có ít nhất 6 ký tự</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Số điện thoại</mat-label>
                <input
                  matInput
                  formControlName="phone"
                  placeholder="Nhập số điện thoại"
                  autocomplete="off"
                  data-form-type="other"
                />
                @if (form.controls.phone.hasError('required')) {
                  <mat-error>Số điện thoại là bắt buộc</mat-error>
                } @else if (form.controls.phone.hasError('pattern')) {
                  <mat-error>Vui lòng nhập số điện thoại hợp lệ</mat-error>
                }
              </mat-form-field>

              <div class="checkbox-row">
                <mat-checkbox formControlName="activated">Kích hoạt tài khoản</mat-checkbox>
              </div>

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
                    {{ editingAccount() ? 'Cập nhật' : 'Tạo mới' }}
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .account-list-container {
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
        position: sticky;
        top: 0;
        background: white;
        z-index: 1;
      }

      .dialog-header h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }

      .dialog-body {
        padding: 24px;
      }

      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }

      .checkbox-row {
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
export class AccountListComponent implements OnInit {
  private readonly accountApi = inject(AccountApiService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  // Cell templates
  statusTemplate = viewChild.required<TemplateRef<CellTemplateContext<Account>>>('statusTemplate');
  cellTemplates = computed(() => ({
    activated: this.statusTemplate(),
  }));

  // State signals
  accounts = signal<Account[]>([]);
  totalElements = signal(0);
  totalPages = signal(0);
  pageIndex = signal(0);
  pageSize = signal(10);
  loading = signal(false);
  error = signal<string | null>(null);
  dialogOpen = signal(false);
  editingAccount = signal<Account | null>(null);
  submitting = signal(false);
  searchTerm = signal('');
  private readonly searchInput$ = new Subject<string>();
  private readonly destroyRef = inject(DestroyRef);

  // Form - password validators will be set dynamically based on create/edit mode
  form = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.pattern(/^\S+@\S+$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-()]+$/)]],
    activated: [true],
  });

  // Column definitions
  columns: ColumnDef<Account>[] = [
    { key: 'username', header: 'Tên đăng nhập' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Số điện thoại' },
    {
      key: 'activated',
      header: 'Trạng thái',
      width: '200px',
    },
  ];

  ngOnInit(): void {
    this.loadAccounts();

    this.searchInput$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((term: string) => {
        this.searchTerm.set(term);
        this.pageIndex.set(0);
        this.loadAccounts();
      });
  }

  loadAccounts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.accountApi
      .getAll({ page: this.pageIndex(), size: this.pageSize(), search: this.searchTerm() || undefined })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.status === 200 && response.data) {
            this.accounts.set(response.data.data);
            this.totalElements.set(response.data.totalElements);
            this.totalPages.set(response.data.totalPages);
          }
        },
        error: (err) => {
          console.error('Failed to load accounts:', err);
          this.error.set('Không thể tải danh sách tài khoản. Vui lòng thử lại.');
        },
      });
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadAccounts();
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchInput$.next(value);
  }

  openCreateDialog(): void {
    this.editingAccount.set(null);
    this.form.reset({ activated: true });
    // Password is required for create mode
    this.form.controls.password.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.controls.password.updateValueAndValidity();
    this.dialogOpen.set(true);
  }

  openEditDialog(account: Account): void {
    this.editingAccount.set(account);
    this.form.patchValue({
      username: account.username,
      email: account.email,
      password: '', // Leave empty for edit mode
      phone: account.phone,
      activated: account.activated,
    });
    // Password is optional for edit mode (only minLength if provided)
    this.form.controls.password.clearValidators();
    this.form.controls.password.setValidators([Validators.minLength(6)]);
    this.form.controls.password.updateValueAndValidity();
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
    this.editingAccount.set(null);
    this.form.reset({ activated: true });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const formValue = this.form.value;

    if (this.editingAccount()) {
      const updateData: UpdateAccountRequest = {
        id: this.editingAccount()!.id,
        username: formValue.username!,
        email: formValue.email!,
        phone: formValue.phone!,
        activated: formValue.activated!,
      };

      // Only include password if provided
      if (formValue.password) {
        updateData.password = formValue.password;
      }

      this.accountApi
        .update(this.editingAccount()!.id, updateData)
        .pipe(finalize(() => this.submitting.set(false)))
        .subscribe({
          next: () => {
            this.notification.showSuccess('Cập nhật tài khoản thành công');
            this.closeDialog();
            this.loadAccounts();
          },
          error: (err) => {
            console.error('Failed to update account:', err);
            this.notification.showError('Không thể cập nhật tài khoản');
          },
        });
    } else {
      const createData: CreateAccountRequest = {
        username: formValue.username!,
        email: formValue.email!,
        password: formValue.password!,
        phone: formValue.phone!,
        activated: formValue.activated!,
      };

      this.accountApi
        .create(createData)
        .pipe(finalize(() => this.submitting.set(false)))
        .subscribe({
          next: () => {
            this.notification.showSuccess('Tạo tài khoản thành công');
            this.closeDialog();
            this.loadAccounts();
          },
          error: (err) => {
            console.error('Failed to create account:', err);
            this.notification.showError('Không thể tạo tài khoản');
          },
        });
    }
  }

  openDeleteDialog(account: Account): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Xóa tài khoản',
        message: `Bạn có chắc chắn muốn xóa tài khoản "${account.username}"? Hành động này không thể hoàn tác.`,
        confirmText: 'Xóa',
        cancelText: 'Hủy',
        confirmColor: 'warn',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteAccount(account);
      }
    });
  }

  private deleteAccount(account: Account): void {
    this.accountApi.delete(account.id).subscribe({
      next: () => {
        this.notification.showSuccess('Xóa tài khoản thành công');
        this.loadAccounts();
      },
      error: (err) => {
        console.error('Failed to delete account:', err);
        this.notification.showError('Không thể xóa tài khoản');
      },
    });
  }
}
