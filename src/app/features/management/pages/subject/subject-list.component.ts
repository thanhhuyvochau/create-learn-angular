import {
  Component,
  DestroyRef,
  inject,
  signal,
  computed,
  OnInit,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject as RxSubject, finalize } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
        title="Môn học"
        subtitle="Quản lý các môn học"
        (addClick)="openCreateDialog()"
      ></app-page-header>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (error()) {
        <div class="error-message">
          <mat-icon>error</mat-icon>
          <span>{{ error() }}</span>
          <button mat-button color="primary" (click)="loadSubjects()">
            Thử lại
          </button>
        </div>
      } @else {
        <div class="table-section">
          <div class="search-bar">
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="search-field">
              <mat-label>Tìm kiếm</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input
                matInput
                [value]="searchTerm()"
                (input)="onSearch($event)"
                placeholder="Tìm theo tên..."
              />
            </mat-form-field>
          </div>
          <app-data-table
            [data]="subjects()"
            [columns]="columns"
            [showActions]="true"
            [emptyMessage]="'Không tìm thấy môn học nào'"
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
              Hiển thị {{ subjects().length }} trên {{ totalElements() }} mục
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
                {{ editingSubject() ? 'Chỉnh sửa môn học' : 'Tạo môn học' }}
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
                <mat-label>Tên</mat-label>
                <input
                  matInput
                  formControlName="name"
                  placeholder="Nhập tên môn học"
                />
                @if (form.controls.name.hasError('required')) {
                  <mat-error>Tên là bắt buộc</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Mô tả</mat-label>
                <textarea
                  matInput
                  formControlName="description"
                  placeholder="Nhập mô tả môn học"
                  rows="3"
                ></textarea>
              </mat-form-field>

              <div class="file-upload-section">
                <label class="file-upload-label">Biểu tượng</label>
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
                  {{ selectedFile() ? 'Đổi tệp' : 'Tải lên biểu tượng' }}
                </button>
                @if (selectedFile()) {
                  <span class="file-name">{{ selectedFile()?.name }}</span>
                }
              </div>

              @if (previewUrl()) {
                <div class="icon-preview">
                  <img [src]="previewUrl()" alt="Xem trước biểu tượng" />
                </div>
              }

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
                    {{ editingSubject() ? 'Cập nhật' : 'Tạo mới' }}
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

      .search-bar {
        padding: 16px 16px 0;
      }

      .search-field {
        width: 100%;
        max-width: 400px;
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
  searchTerm = signal('');
  private readonly searchInput$ = new RxSubject<string>();
  private readonly destroyRef = inject(DestroyRef);

  // Form
  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
  });

  // Column definitions
  columns: ColumnDef<Subject>[] = [
    {
      key: 'iconBase64',
      header: 'Biểu tượng',
      sortable: false,
      width: '80px',
      align: 'center',
    },
    { key: 'name', header: 'Tên' },
    { key: 'description', header: 'Mô tả' },
  ];

  ngOnInit(): void {
    this.loadSubjects();
    this.searchInput$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(term => {
      this.searchTerm.set(term);
      this.pageIndex.set(0);
      this.loadSubjects();
    });
  }

  loadSubjects(): void {
    this.loading.set(true);
    this.error.set(null);

    this.subjectApi
      .getAll({ page: this.pageIndex(), size: this.pageSize(), search: this.searchTerm() || undefined })
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
          this.error.set('Không thể tải danh sách môn học. Vui lòng thử lại.');
        },
      });
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadSubjects();
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchInput$.next(value);
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
            this.notification.showSuccess('Cập nhật môn học thành công');
            this.closeDialog();
            this.loadSubjects();
          },
          error: (err) => {
            console.error('Failed to update subject:', err);
            this.notification.showError('Không thể cập nhật môn học');
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
            this.notification.showSuccess('Tạo môn học thành công');
            this.closeDialog();
            this.loadSubjects();
          },
          error: (err) => {
            console.error('Failed to create subject:', err);
            this.notification.showError('Không thể tạo môn học');
          },
        });
    }
  }

  openDeleteDialog(subject: Subject): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Xóa môn học',
        message: `Bạn có chắc chắn muốn xóa "${subject.name}"? Hành động này không thể hoàn tác.`,
        confirmText: 'Xóa',
        cancelText: 'Hủy',
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
        this.notification.showSuccess('Xóa môn học thành công');
        this.loadSubjects();
      },
      error: (err) => {
        console.error('Failed to delete subject:', err);
        this.notification.showError('Không thể xóa môn học');
      },
    });
  }
}
