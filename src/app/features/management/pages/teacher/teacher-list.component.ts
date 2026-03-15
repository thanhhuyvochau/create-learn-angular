import { Component, inject, signal, OnInit, TemplateRef, viewChild, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, switchMap } from 'rxjs';
import { of } from 'rxjs';

import {
  PageHeaderComponent,
  DataTableComponent,
  PaginationComponent,
  ConfirmDialogComponent,
  LoadingSpinnerComponent,
  RichTextEditorComponent,
  type ColumnDef,
  type ConfirmDialogData,
  type CellTemplateContext,
} from '../../../../shared/components';
import { TeacherApiService, FileUploadApiService } from '../../../../core/api';
import { NotificationService } from '../../../../core/notifications/notification.service';
import type {
  Teacher,
  Gender,
  CreateTeacherRequest,
  UpdateTeacherRequest,
} from '../../../../models';

@Component({
  selector: 'app-teacher-list',
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
    RichTextEditorComponent,
  ],
  template: `
    <div class="teacher-list-container">
      <app-page-header
        title="Giáo viên"
        subtitle="Quản lý giáo viên và giảng viên"
        (addClick)="openCreateDialog()"
      ></app-page-header>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (error()) {
        <div class="error-message">
          <mat-icon>error</mat-icon>
          <span>{{ error() }}</span>
          <button mat-button color="primary" (click)="loadTeachers()">Thử lại</button>
        </div>
      } @else {
        <div class="table-section">
          <app-data-table
            [data]="teachers()"
            [columns]="columns"
            [cellTemplates]="cellTemplates()"
            [showActions]="true"
            [emptyMessage]="'Không tìm thấy giáo viên nào'"
            (edit)="openEditDialog($event)"
            (delete)="openDeleteDialog($event)"
          >
          </app-data-table>

          <ng-template #profileImageTemplate let-row>
            @if (row.profileImageUrl) {
              <img
                [src]="row.profileImageUrl"
                [alt]="row.firstName + ' ' + row.lastName"
                class="table-profile-image"
              />
            } @else {
              <div class="table-profile-placeholder">
                <mat-icon>person</mat-icon>
              </div>
            }
          </ng-template>

          <div class="table-footer">
            <span class="table-caption">
              Hiển thị {{ teachers().length }} trên {{ totalElements() }} mục
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
          <div class="dialog-content dialog-large" (click)="$event.stopPropagation()">
            <div class="dialog-header">
              <h2>{{ editingTeacher() ? 'Chỉnh sửa giáo viên' : 'Tạo giáo viên' }}</h2>
              <button mat-icon-button (click)="closeDialog()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="dialog-body">
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Họ</mat-label>
                  <input matInput formControlName="firstName" placeholder="Nhập họ" />
                  @if (form.controls.firstName.hasError('required')) {
                    <mat-error>Họ là bắt buộc</mat-error>
                  }
                  @if (form.controls.firstName.hasError('minlength')) {
                    <mat-error>Họ quá ngắn</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Tên</mat-label>
                  <input matInput formControlName="lastName" placeholder="Nhập tên" />
                  @if (form.controls.lastName.hasError('required')) {
                    <mat-error>Tên là bắt buộc</mat-error>
                  }
                  @if (form.controls.lastName.hasError('minlength')) {
                    <mat-error>Tên quá ngắn</mat-error>
                  }
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Giới tính</mat-label>
                <mat-select formControlName="gender">
                  <mat-option value="MALE">Nam</mat-option>
                  <mat-option value="FEMALE">Nữ</mat-option>
                </mat-select>
              </mat-form-field>

              <div class="form-field-group">
                <label class="form-label">Giới thiệu <span class="required">*</span></label>
                <app-rich-text-editor
                  [content]="form.controls.introduction.value || ''"
                  (contentChange)="form.controls.introduction.setValue($event)"
                  placeholder="Viết giới thiệu về giáo viên..."
                ></app-rich-text-editor>
                @if (form.controls.introduction.hasError('required') && form.controls.introduction.touched) {
                  <span class="error-text">Giới thiệu là bắt buộc</span>
                }
              </div>

              <div class="file-upload-section">
                <label class="file-upload-label">Ảnh đại diện</label>
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
                  [disabled]="uploading()"
                >
                  <mat-icon>upload</mat-icon>
                  {{ selectedFile() ? 'Đổi ảnh' : 'Tải lên ảnh' }}
                </button>
                @if (selectedFile()) {
                  <span class="file-name">{{ selectedFile()?.name }}</span>
                }
                @if (uploading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                }
              </div>

              @if (previewUrl()) {
                <div class="image-preview">
                  <img [src]="previewUrl()" alt="Xem trước ảnh đại diện" />
                </div>
              }

              <div class="dialog-actions">
                <button
                  type="button"
                  mat-button
                  (click)="closeDialog()"
                  [disabled]="submitting() || uploading()"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  mat-raised-button
                  color="primary"
                  [disabled]="form.invalid || submitting() || uploading()"
                >
                  @if (submitting()) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    {{ editingTeacher() ? 'Cập nhật' : 'Tạo mới' }}
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
      .teacher-list-container {
        padding: 24px;
      }

      .table-profile-image {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #e0e0e0;
      }

      .table-profile-placeholder {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #e0e0e0;
      }

      .table-profile-placeholder mat-icon {
        color: #9e9e9e;
        font-size: 24px;
        width: 24px;
        height: 24px;
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

      .dialog-large {
        max-width: 700px;
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

      .form-row {
        display: flex;
        gap: 16px;
      }

      .half-width {
        flex: 1;
        margin-bottom: 16px;
      }

      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }

      .form-field-group {
        margin-bottom: 16px;
      }

      .form-label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
      }

      .required {
        color: #f44336;
      }

      .error-text {
        color: #f44336;
        font-size: 12px;
        margin-top: 4px;
        display: block;
      }

      .file-upload-section {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }

      .file-upload-label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
        flex-shrink: 0;
      }

      .file-name {
        font-size: 14px;
        color: #666;
      }

      .image-preview {
        margin-bottom: 16px;
      }

      .image-preview img {
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
    `,
  ],
})
export class TeacherListComponent implements OnInit {
  private readonly teacherApi = inject(TeacherApiService);
  private readonly fileUploadApi = inject(FileUploadApiService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  // Cell templates
  profileImageTemplate = viewChild.required<TemplateRef<CellTemplateContext<Teacher>>>('profileImageTemplate');
  cellTemplates = computed(() => ({
    profileImageUrl: this.profileImageTemplate(),
  }));

  // State signals
  teachers = signal<Teacher[]>([]);
  totalElements = signal(0);
  totalPages = signal(0);
  pageIndex = signal(0);
  pageSize = signal(10);
  loading = signal(false);
  error = signal<string | null>(null);
  dialogOpen = signal(false);
  editingTeacher = signal<Teacher | null>(null);
  submitting = signal(false);
  uploading = signal(false);
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  uploadedImageUrl = signal<string | null>(null);

  // Form
  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    introduction: ['', Validators.required],
    gender: ['MALE' as Gender, Validators.required],
    profileImageUrl: [''],
  });

  // Column definitions
  columns: ColumnDef<Teacher>[] = [
    {
      key: 'profileImageUrl',
      header: 'Ảnh',
      sortable: false,
      width: '80px',
    },
    { key: 'firstName', header: 'Họ' },
    { key: 'lastName', header: 'Tên' },
    {
      key: 'gender',
      header: 'Giới tính',
      render: (row) => row.gender === 'MALE' ? 'Nam' : 'Nữ',
    },
  ];

  ngOnInit(): void {
    this.loadTeachers();
  }

  loadTeachers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.teacherApi
      .getAll({ page: this.pageIndex(), size: this.pageSize() })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.status === 200 && response.data) {
            this.teachers.set(response.data.data);
            this.totalElements.set(response.data.totalElements);
            this.totalPages.set(response.data.totalPages);
          }
        },
        error: (err) => {
          console.error('Failed to load teachers:', err);
          this.error.set('Không thể tải danh sách giáo viên. Vui lòng thử lại.');
        },
      });
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadTeachers();
  }

  openCreateDialog(): void {
    this.editingTeacher.set(null);
    this.form.reset({ gender: 'MALE' });
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.uploadedImageUrl.set(null);
    this.dialogOpen.set(true);
  }

  openEditDialog(teacher: Teacher): void {
    this.editingTeacher.set(teacher);
    this.form.patchValue({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      introduction: teacher.introduction,
      gender: teacher.gender,
      profileImageUrl: teacher.profileImageUrl,
    });
    this.selectedFile.set(null);
    this.previewUrl.set(teacher.profileImageUrl || null);
    this.uploadedImageUrl.set(teacher.profileImageUrl || null);
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
    this.editingTeacher.set(null);
    this.form.reset({ gender: 'MALE' });
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.uploadedImageUrl.set(null);
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

      // Upload the file immediately
      this.uploadFile(file);
    }
  }

  private uploadFile(file: File): void {
    this.uploading.set(true);
    this.fileUploadApi
      .upload(file)
      .pipe(finalize(() => this.uploading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.status === 200 && response.data) {
            this.uploadedImageUrl.set(response.data);
            this.form.patchValue({ profileImageUrl: response.data });
            this.notification.showSuccess('Tải ảnh lên thành công');
          }
        },
        error: (err) => {
          console.error('Failed to upload image:', err);
          this.notification.showError('Không thể tải ảnh lên');
          this.selectedFile.set(null);
          this.previewUrl.set(this.editingTeacher()?.profileImageUrl || null);
        },
      });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const formValue = this.form.value;

    if (this.editingTeacher()) {
      const updateData: UpdateTeacherRequest = {
        id: this.editingTeacher()!.id,
        firstName: formValue.firstName!,
        lastName: formValue.lastName!,
        introduction: formValue.introduction!,
        gender: formValue.gender as Gender,
        profileImageUrl: this.uploadedImageUrl() || formValue.profileImageUrl || '',
      };

      this.teacherApi
        .update(this.editingTeacher()!.id, updateData)
        .pipe(finalize(() => this.submitting.set(false)))
        .subscribe({
          next: () => {
            this.notification.showSuccess('Cập nhật giáo viên thành công');
            this.closeDialog();
            this.loadTeachers();
          },
          error: (err) => {
            console.error('Failed to update teacher:', err);
            this.notification.showError('Không thể cập nhật giáo viên');
          },
        });
    } else {
      const createData: CreateTeacherRequest = {
        firstName: formValue.firstName!,
        lastName: formValue.lastName!,
        introduction: formValue.introduction!,
        gender: formValue.gender as Gender,
        profileImageUrl: this.uploadedImageUrl() || '',
      };

      this.teacherApi
        .create(createData)
        .pipe(finalize(() => this.submitting.set(false)))
        .subscribe({
          next: () => {
            this.notification.showSuccess('Tạo giáo viên thành công');
            this.closeDialog();
            this.loadTeachers();
          },
          error: (err) => {
            console.error('Failed to create teacher:', err);
            this.notification.showError('Không thể tạo giáo viên');
          },
        });
    }
  }

  openDeleteDialog(teacher: Teacher): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Xóa giáo viên',
        message: `Bạn có chắc chắn muốn xóa "${teacher.firstName} ${teacher.lastName}"? Hành động này không thể hoàn tác.`,
        confirmText: 'Xóa',
        cancelText: 'Hủy',
        confirmColor: 'warn',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteTeacher(teacher);
      }
    });
  }

  private deleteTeacher(teacher: Teacher): void {
    this.teacherApi.delete(teacher.id).subscribe({
      next: () => {
        this.notification.showSuccess('Xóa giáo viên thành công');
        this.loadTeachers();
      },
      error: (err) => {
        console.error('Failed to delete teacher:', err);
        this.notification.showError('Không thể xóa giáo viên');
      },
    });
  }
}
