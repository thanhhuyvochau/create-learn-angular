import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';

import {
  PageHeaderComponent,
  DataTableComponent,
  PaginationComponent,
  ConfirmDialogComponent,
  LoadingSpinnerComponent,
  type ColumnDef,
  type ConfirmDialogData,
  type CellTemplateContext,
} from '../../../../shared/components';
import { SubjectApiService } from '../../../../core/api';
import { NotificationService } from '../../../../core/notifications/notification.service';
import type {
  Subject,
  CreateSubjectRequest,
  UpdateSubjectRequest,
} from '../../../../models';

@Component({
  selector: 'app-subject-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    DataTableComponent,
    LoadingSpinnerComponent,
    PaginationComponent,
  ],
  template: `
    <div class="subject-list-container">
      <app-page-header
        title="Subjects"
        subtitle="Manage educational subjects"
        (addClick)="openCreateDialog()"
      ></app-page-header>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (error()) {
        <div class="error-message">
          <mat-icon>error</mat-icon>
          <span>{{ error() }}</span>
          <button mat-button color="primary" (click)="loadSubjects()">
            Retry
          </button>
        </div>
      } @else {
        <div class="table-section">
          <app-data-table
            [data]="subjects()"
            [columns]="columns"
            [showActions]="true"
            [emptyMessage]="'No subjects found'"
            [cellTemplates]="cellTemplates()"
            (edit)="openEditDialog($event)"
            (delete)="openDeleteDialog($event)"
          >
            <ng-template #actions let-row>
              <button
                mat-icon-button
                color="primary"
                matTooltip="Edit"
                (click)="openEditDialog(row)"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-icon-button
                color="warn"
                matTooltip="Delete"
                (click)="openDeleteDialog(row)"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </ng-template>
          </app-data-table>

          <!-- Cell templates for custom rendering -->
          <ng-template #iconTemplate let-row>
            @if (row.iconBase64) {
              <img
                [src]="'data:image/png;base64,' + row.iconBase64"
                alt="Subject icon"
                class="table-icon"
              />
            } @else {
              <mat-icon class="table-icon-placeholder">image</mat-icon>
            }
          </ng-template>

          <div class="table-footer">
            <span class="table-caption">
              Showing {{ subjects().length }} of {{ totalElements() }} items
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
              <h2>
                {{ editingSubject() ? 'Edit Subject' : 'Create Subject' }}
              </h2>
              <button mat-icon-button (click)="closeDialog()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <form
              [formGroup]="form"
              (ngSubmit)="onSubmit()"
              class="dialog-body"
            >
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Name</mat-label>
                <input
                  matInput
                  formControlName="name"
                  placeholder="Enter subject name"
                />
                @if (form.controls.name.hasError('required')) {
                  <mat-error>Name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea
                  matInput
                  formControlName="description"
                  placeholder="Enter subject description"
                  rows="3"
                ></textarea>
              </mat-form-field>

              <div class="file-upload-section">
                <label class="file-upload-label">Icon</label>
                <input
                  type="file"
                  #fileInput
                  accept="image/*"
                  (change)="onFileSelect($event)"
                  style="display: none"
                />
                <button
                  type="button"
                  mat-stroked-button
                  (click)="fileInput.click()"
                >
                  <mat-icon>upload</mat-icon>
                  {{ selectedFile() ? 'Change File' : 'Upload Icon' }}
                </button>
                @if (selectedFile()) {
                  <span class="file-name">{{ selectedFile()?.name }}</span>
                }
              </div>

              @if (previewUrl()) {
                <div class="icon-preview">
                  <img [src]="previewUrl()" alt="Icon preview" />
                </div>
              }

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
                    {{ editingSubject() ? 'Update' : 'Create' }}
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
      .subject-list-container {
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

      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }

      .file-upload-section {
        margin-bottom: 16px;
      }

      .file-upload-label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
      }

      .file-name {
        margin-left: 12px;
        font-size: 14px;
        color: #666;
      }

      .icon-preview {
        margin-bottom: 16px;
      }

      .icon-preview img {
        max-width: 200px;
        max-height: 200px;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
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

      .table-icon {
        width: 40px;
        height: 40px;
        object-fit: contain;
        border-radius: 4px;
      }

      .table-icon-placeholder {
        width: 40px;
        height: 40px;
        color: #bdbdbd;
        font-size: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class SubjectListComponent implements OnInit {
  private readonly subjectApi = inject(SubjectApiService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  // Template references for custom cell rendering
  iconTemplate =
    viewChild.required<TemplateRef<CellTemplateContext<Subject>>>(
      'iconTemplate',
    );

  // Computed cell templates map
  cellTemplates = computed(() => ({
    iconBase64: this.iconTemplate(),
  }));

  // State signals
  subjects = signal<Subject[]>([]);
  totalElements = signal(0);
  totalPages = signal(0);
  pageIndex = signal(0);
  pageSize = signal(10);
  loading = signal(false);
  error = signal<string | null>(null);
  dialogOpen = signal(false);
  editingSubject = signal<Subject | null>(null);
  submitting = signal(false);
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);

  // Form
  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
  });

  // Column definitions
  columns: ColumnDef<Subject>[] = [
    {
      key: 'iconBase64',
      header: 'Icon',
      sortable: false,
      width: '80px',
      align: 'center',
    },
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description' },
  ];

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.loading.set(true);
    this.error.set(null);

    this.subjectApi
      .getAll({ page: this.pageIndex(), size: this.pageSize() })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.status === 200 && response.data) {
            this.subjects.set(response.data.data);
            this.totalElements.set(response.data.totalElements);
            this.totalPages.set(response.data.totalPages);
          }
        },
        error: (err) => {
          console.error('Failed to load subjects:', err);
          this.error.set('Failed to load subjects. Please try again.');
        },
      });
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadSubjects();
  }

  openCreateDialog(): void {
    this.editingSubject.set(null);
    this.form.reset();
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.dialogOpen.set(true);
  }

  openEditDialog(subject: Subject): void {
    this.editingSubject.set(subject);
    this.form.patchValue({
      name: subject.name,
      description: subject.description || '',
    });
    this.selectedFile.set(null);
    if (subject.iconBase64) {
      this.previewUrl.set(`data:image/png;base64,${subject.iconBase64}`);
    } else {
      this.previewUrl.set(null);
    }
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
    this.editingSubject.set(null);
    this.form.reset();
    this.selectedFile.set(null);
    this.previewUrl.set(null);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile.set(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const formValue = this.form.value;

    if (this.editingSubject()) {
      const updateData: UpdateSubjectRequest = {
        id: this.editingSubject()!.id,
        name: formValue.name!,
        description: formValue.description || undefined,
        icon: this.selectedFile() || undefined,
      };

      this.subjectApi
        .update(this.editingSubject()!.id, updateData)
        .pipe(finalize(() => this.submitting.set(false)))
        .subscribe({
          next: () => {
            this.notification.showSuccess('Subject updated successfully');
            this.closeDialog();
            this.loadSubjects();
          },
          error: (err) => {
            console.error('Failed to update subject:', err);
            this.notification.showError('Failed to update subject');
          },
        });
    } else {
      const createData: CreateSubjectRequest = {
        name: formValue.name!,
        description: formValue.description || undefined,
        icon: this.selectedFile() || undefined,
      };

      this.subjectApi
        .create(createData)
        .pipe(finalize(() => this.submitting.set(false)))
        .subscribe({
          next: () => {
            this.notification.showSuccess('Subject created successfully');
            this.closeDialog();
            this.loadSubjects();
          },
          error: (err) => {
            console.error('Failed to create subject:', err);
            this.notification.showError('Failed to create subject');
          },
        });
    }
  }

  openDeleteDialog(subject: Subject): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Subject',
        message: `Are you sure you want to delete "${subject.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteSubject(subject);
      }
    });
  }

  private deleteSubject(subject: Subject): void {
    this.subjectApi.delete(subject.id).subscribe({
      next: () => {
        this.notification.showSuccess('Subject deleted successfully');
        this.loadSubjects();
      },
      error: (err) => {
        console.error('Failed to delete subject:', err);
        this.notification.showError('Failed to delete subject');
      },
    });
  }
}
