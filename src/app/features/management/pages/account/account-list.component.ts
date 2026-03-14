import { Component, inject, signal, OnInit, TemplateRef, viewChild, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
        title="Accounts"
        subtitle="Manage user accounts"
        (addClick)="openCreateDialog()"
      ></app-page-header>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (error()) {
        <div class="error-message">
          <mat-icon>error</mat-icon>
          <span>{{ error() }}</span>
          <button mat-button color="primary" (click)="loadAccounts()">Retry</button>
        </div>
      } @else {
        <div class="table-section">
          <app-data-table
            [data]="accounts()"
            [columns]="columns"
            [cellTemplates]="cellTemplates()"
            [showActions]="true"
            [emptyMessage]="'No accounts found'"
            (edit)="openEditDialog($event)"
            (delete)="openDeleteDialog($event)"
          >
          </app-data-table>

          <ng-template #statusTemplate let-row>
            <app-status-badge [status]="row.activated ? 'ACTIVE' : 'INACTIVE'"></app-status-badge>
          </ng-template>

          <div class="table-footer">
            <span class="table-caption">
              Showing {{ accounts().length }} of {{ totalElements() }} items
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
              <h2>{{ editingAccount() ? 'Edit Account' : 'Create Account' }}</h2>
              <button mat-icon-button (click)="closeDialog()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="dialog-body" autocomplete="off">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Username</mat-label>
                <input
                  matInput
                  formControlName="username"
                  placeholder="Enter username"
                  autocomplete="off"
                  data-form-type="other"
                />
                @if (form.controls.username.hasError('required')) {
                  <mat-error>Username is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input
                  matInput
                  formControlName="email"
                  placeholder="Enter email address"
                  type="email"
                  autocomplete="off"
                  data-form-type="other"
                />
                @if (form.controls.email.hasError('required')) {
                  <mat-error>Email is required</mat-error>
                } @else if (form.controls.email.hasError('pattern')) {
                  <mat-error>Please enter a valid email address</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ editingAccount() ? 'Password (leave empty to keep current)' : 'Password' }}</mat-label>
                <input
                  matInput
                  formControlName="password"
                  [placeholder]="editingAccount() ? 'Leave empty to keep current password' : 'Enter password'"
                  type="password"
                  autocomplete="new-password"
                  data-form-type="other"
                />
                @if (form.controls.password.hasError('required')) {
                  <mat-error>Password is required</mat-error>
                } @else if (form.controls.password.hasError('minlength')) {
                  <mat-error>Password must be at least 6 characters</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Phone</mat-label>
                <input
                  matInput
                  formControlName="phone"
                  placeholder="Enter phone number"
                  autocomplete="off"
                  data-form-type="other"
                />
                @if (form.controls.phone.hasError('required')) {
                  <mat-error>Phone is required</mat-error>
                } @else if (form.controls.phone.hasError('pattern')) {
                  <mat-error>Please enter a valid phone number</mat-error>
                }
              </mat-form-field>

              <div class="checkbox-row">
                <mat-checkbox formControlName="activated">Account Activated</mat-checkbox>
              </div>

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
                    {{ editingAccount() ? 'Update' : 'Create' }}
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
    { key: 'username', header: 'Username' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    {
      key: 'activated',
      header: 'Status',
      width: '100px',
    },
  ];

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.accountApi
      .getAll({ page: this.pageIndex(), size: this.pageSize() })
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
          this.error.set('Failed to load accounts. Please try again.');
        },
      });
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadAccounts();
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
            this.notification.showSuccess('Account updated successfully');
            this.closeDialog();
            this.loadAccounts();
          },
          error: (err) => {
            console.error('Failed to update account:', err);
            this.notification.showError('Failed to update account');
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
            this.notification.showSuccess('Account created successfully');
            this.closeDialog();
            this.loadAccounts();
          },
          error: (err) => {
            console.error('Failed to create account:', err);
            this.notification.showError('Failed to create account');
          },
        });
    }
  }

  openDeleteDialog(account: Account): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Account',
        message: `Are you sure you want to delete the account "${account.username}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
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
        this.notification.showSuccess('Account deleted successfully');
        this.loadAccounts();
      },
      error: (err) => {
        console.error('Failed to delete account:', err);
        this.notification.showError('Failed to delete account');
      },
    });
  }
}
