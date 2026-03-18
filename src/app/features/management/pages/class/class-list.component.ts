import {
  Component,
  inject,
  signal,
  OnInit,
  TemplateRef,
  viewChild,
  computed,
} from '@angular/core';
import {
  FormBuilder,
  FormArray,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize, forkJoin } from 'rxjs';

import {
  PageHeaderComponent,
  DataTableComponent,
  PaginationComponent,
  ConfirmDialogComponent,
  LoadingSpinnerComponent,
  RichTextEditorComponent,
  StatusBadgeComponent,
  type ColumnDef,
  type ConfirmDialogData,
  type CellTemplateContext,
} from '../../../../shared/components';
import {
  ClassApiService,
  SubjectApiService,
  GradeApiService,
  TeacherApiService,
  ScheduleApiService,
  FileUploadApiService,
} from '../../../../core/api';
import { NotificationService } from '../../../../core/notifications/notification.service';
import type {
  Class,
  CreateClassRequest,
  UpdateClassRequest,
  Subject,
  Grade,
  Teacher,
} from '../../../../models';

interface ScheduleEntry {
  id?: number;
  time: string;
  isNew?: boolean;
}

@Component({
  selector: 'app-class-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    PageHeaderComponent,
    DataTableComponent,
    PaginationComponent,
    LoadingSpinnerComponent,
    RichTextEditorComponent,
    StatusBadgeComponent,
  ],
  template: `
    <div class="class-list-container">
      <app-page-header
        title="Lớp học"
        subtitle="Quản lý các lớp học"
        (addClick)="openCreateDialog()"
      ></app-page-header>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (error()) {
        <div class="error-message">
          <mat-icon>error</mat-icon>
          <span>{{ error() }}</span>
          <button mat-button color="primary" (click)="loadClasses()">
            Thử lại
          </button>
        </div>
      } @else {
        <div class="table-section">
          <app-data-table
            [data]="classes()"
            [columns]="columns"
            [cellTemplates]="cellTemplates()"
            [showActions]="true"
            [emptyMessage]="'Không tìm thấy lớp học nào'"
            (edit)="openEditDialog($event)"
            (delete)="openDeleteDialog($event)"
          >
          </app-data-table>

          <ng-template #statusTemplate let-row>
            <app-status-badge
              [status]="row.isDisplayed ? 'ACTIVE' : 'HIDDEN'"
            ></app-status-badge>
          </ng-template>

          <ng-template #gradesTemplate let-row>
            @if (row.grades?.length) {
              @if (row.grades.length <= 2) {
                <span>{{ getGradeNames(row.grades) }}</span>
              } @else {
                <span
                  class="grades-truncated"
                  [matTooltip]="getGradeNames(row.grades)"
                  matTooltipPosition="above"
                >
                  {{ getTruncatedGrades(row.grades) }}
                </span>
              }
            } @else {
              <span class="no-data">—</span>
            }
          </ng-template>

          <div class="table-footer">
            <span class="table-caption">
              Hiển thị {{ classes().length }} trên {{ totalElements() }} mục
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
          <div
            class="dialog-content dialog-extra-large"
            (click)="$event.stopPropagation()"
          >
            <div class="dialog-header">
              <h2>{{ editingClass() ? 'Chỉnh sửa lớp học' : 'Tạo lớp học' }}</h2>
              <button mat-icon-button (click)="closeDialog()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <form
              [formGroup]="form"
              (ngSubmit)="onSubmit()"
              class="dialog-body"
            >
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Tên lớp</mat-label>
                  <input
                    matInput
                    formControlName="name"
                    placeholder="Nhập tên lớp học"
                  />
                  @if (form.controls.name.hasError('required')) {
                    <mat-error>Tên lớp là bắt buộc</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Học phí</mat-label>
                  <input
                    matInput
                    type="number"
                    formControlName="price"
                    placeholder="Nhập học phí"
                  />
                  @if (form.controls.price.hasError('required')) {
                    <mat-error>Học phí là bắt buộc</mat-error>
                  }
                  @if (form.controls.price.hasError('min')) {
                    <mat-error>Học phí không được âm</mat-error>
                  }
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Mô tả ngắn</mat-label>
                <input
                  matInput
                  formControlName="brief"
                  placeholder="Nhập mô tả ngắn"
                />
                @if (form.controls.brief.hasError('required')) {
                  <mat-error>Mô tả ngắn là bắt buộc</mat-error>
                }
              </mat-form-field>

              <div class="form-field-group">
                <label class="form-label"
                  >Mô tả chi tiết <span class="required">*</span></label
                >
                <app-rich-text-editor
                  [content]="form.controls.description.value || ''"
                  (contentChange)="form.controls.description.setValue($event)"
                  placeholder="Viết mô tả chi tiết về lớp học..."
                ></app-rich-text-editor>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Yêu cầu</mat-label>
                  <textarea
                    matInput
                    formControlName="requirement"
                    rows="2"
                  ></textarea>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Cam kết</mat-label>
                  <textarea
                    matInput
                    formControlName="guarantee"
                    rows="2"
                  ></textarea>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="third-width">
                  <mat-label>Môn học</mat-label>
                  <mat-select formControlName="subjectIds" multiple>
                    @for (subject of subjects(); track subject.id) {
                      <mat-option [value]="subject.id">{{
                        subject.name
                      }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="third-width">
                  <mat-label>Khối lớp</mat-label>
                  <mat-select formControlName="gradeIds" multiple>
                    @for (grade of grades(); track grade.id) {
                      <mat-option [value]="grade.id">{{
                        grade.name
                      }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="third-width">
                  <mat-label>Giáo viên</mat-label>
                  <mat-select formControlName="teacherId">
                    <mat-option [value]="null">Không có</mat-option>
                    @for (teacher of teachers(); track teacher.id) {
                      <mat-option [value]="teacher.id">
                        {{ teacher.firstName }} {{ teacher.lastName }}
                      </mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>

              <!-- Schedules -->
              <div class="schedules-section">
                <label class="form-label">Lịch học</label>
                @for (
                  schedule of schedules.controls;
                  track $index;
                  let i = $index
                ) {
                  <div class="schedule-row">
                    <mat-form-field appearance="outline" class="schedule-input">
                      <input
                        matInput
                        [formControl]="getScheduleControl(i)"
                        placeholder="VD: Thứ Ba - 8h đến 9h"
                      />
                    </mat-form-field>
                    <button
                      type="button"
                      mat-icon-button
                      color="primary"
                      (click)="addSchedule()"
                    >
                      <mat-icon>add</mat-icon>
                    </button>
                    @if (schedules.length > 1) {
                      <button
                        type="button"
                        mat-icon-button
                        color="warn"
                        (click)="removeSchedule(i)"
                      >
                        <mat-icon>delete</mat-icon>
                      </button>
                    }
                  </div>
                }
              </div>

              <!-- Image Upload -->
              <div class="file-upload-section">
                <label class="file-upload-label">Hình ảnh</label>
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
                  {{ selectedFile() ? 'Đổi hình ảnh' : 'Tải hình ảnh' }}
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
                  <img [src]="previewUrl()" alt="Xem trước lớp học" />
                </div>
              }

              <div class="checkbox-row">
                <mat-checkbox formControlName="isDisplayed"
                  >Hiển thị lớp học này</mat-checkbox
                >
              </div>

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
                    {{ editingClass() ? 'Cập nhật' : 'Tạo mới' }}
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
      .class-list-container {
        padding: 24px;
      }

      .grades-truncated {
        cursor: help;
        border-bottom: 1px dotted #666;
      }

      .no-data {
        color: #999;
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

      .dialog-extra-large {
        max-width: 900px;
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

      .form-row {
        display: flex;
        gap: 16px;
      }

      .half-width {
        flex: 1;
        margin-bottom: 16px;
      }

      .third-width {
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

      .schedules-section {
        margin-bottom: 16px;
      }

      .schedule-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .schedule-input {
        flex: 1;
      }

      .file-upload-section {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }

      .file-upload-label {
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
export class ClassListComponent implements OnInit {
  private readonly classApi = inject(ClassApiService);
  private readonly subjectApi = inject(SubjectApiService);
  private readonly gradeApi = inject(GradeApiService);
  private readonly teacherApi = inject(TeacherApiService);
  private readonly scheduleApi = inject(ScheduleApiService);
  private readonly fileUploadApi = inject(FileUploadApiService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  // Cell templates
  statusTemplate =
    viewChild.required<TemplateRef<CellTemplateContext<Class>>>(
      'statusTemplate',
    );
  gradesTemplate =
    viewChild.required<TemplateRef<CellTemplateContext<Class>>>(
      'gradesTemplate',
    );
  cellTemplates = computed(() => ({
    isDisplayed: this.statusTemplate(),
    grades: this.gradesTemplate(),
  }));

  // State signals
  classes = signal<Class[]>([]);
  subjects = signal<Subject[]>([]);
  grades = signal<Grade[]>([]);
  teachers = signal<Teacher[]>([]);
  totalElements = signal(0);
  totalPages = signal(0);
  pageIndex = signal(0);
  pageSize = signal(10);
  loading = signal(false);
  error = signal<string | null>(null);
  dialogOpen = signal(false);
  editingClass = signal<Class | null>(null);
  submitting = signal(false);
  uploading = signal(false);
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  uploadedImageUrl = signal<string | null>(null);
  deletedScheduleIds = signal<number[]>([]);

  // Form with FormArray for schedules
  form = this.fb.group({
    name: ['', Validators.required],
    brief: ['', Validators.required],
    description: ['', Validators.required],
    requirement: [''],
    guarantee: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    subjectIds: [[] as number[]],
    gradeIds: [[] as number[]],
    teacherId: [null as number | null],
    isDisplayed: [true],
    image: [''],
    schedules: this.fb.array([this.fb.control('')]),
  });

  get schedules(): FormArray {
    return this.form.get('schedules') as FormArray;
  }

  getScheduleControl(index: number): FormControl<string> {
    return this.schedules.at(index) as FormControl<string>;
  }

  // Column definitions
  columns: ColumnDef<Class>[] = [
    { key: 'name', header: 'Tên lớp' },
    {
      key: 'brief',
      header: 'Mô tả ngắn',
      render: (row) =>
        row.brief?.length > 50 ? row.brief.slice(0, 50) + '...' : row.brief,
    },
    {
      key: 'teacher',
      header: 'Giáo viên',
      render: (row) =>
        row.teacher ? `${row.teacher.firstName} ${row.teacher.lastName}` : '—',
    },
    {
      key: 'price',
      header: 'Học phí',
      render: (row) => `$${row.price}`,
    },
    {
      key: 'isDisplayed',
      header: 'Trạng thái',
      width: '200px',
    },
    {
      key: 'grades',
      header: 'Khối lớp',
    },
  ];

  // Helper methods for grades
  getGradeNames(grades: Grade[]): string {
    return grades.map((g) => g.name).join(', ');
  }

  getTruncatedGrades(grades: Grade[]): string {
    const first2 = grades
      .slice(0, 2)
      .map((g) => g.name)
      .join(', ');
    return `${first2} +${grades.length - 2} more`;
  }

  private scheduleEntries: ScheduleEntry[] = [];

  ngOnInit(): void {
    this.loadClasses();
    this.loadDropdownData();
  }

  loadClasses(): void {
    this.loading.set(true);
    this.error.set(null);

    this.classApi
      .getAllForAdmin({ page: this.pageIndex(), size: this.pageSize() })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.status === 200 && response.data) {
            this.classes.set(response.data.data);
            this.totalElements.set(response.data.totalElements);
            this.totalPages.set(response.data.totalPages);
          }
        },
        error: (err) => {
          console.error('Failed to load classes:', err);
          this.error.set('Không thể tải danh sách lớp học. Vui lòng thử lại.');
        },
      });
  }

  loadDropdownData(): void {
    forkJoin({
      subjects: this.subjectApi.getAll({ page: 0, size: 100 }),
      grades: this.gradeApi.getAll({ page: 0, size: 100 }),
      teachers: this.teacherApi.getAll({ page: 0, size: 100 }),
    }).subscribe({
      next: ({ subjects, grades, teachers }) => {
        if (subjects.data) this.subjects.set(subjects.data.data);
        if (grades.data) this.grades.set(grades.data.data);
        if (teachers.data) this.teachers.set(teachers.data.data);
      },
      error: (err) => console.error('Failed to load dropdown data:', err),
    });
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadClasses();
  }

  addSchedule(): void {
    this.schedules.push(this.fb.control(''));
    this.scheduleEntries.push({ time: '', isNew: true });
  }

  removeSchedule(index: number): void {
    if (this.schedules.length <= 1) return;

    const entry = this.scheduleEntries[index];
    if (entry?.id && !entry.isNew) {
      this.deletedScheduleIds.update((ids) => [...ids, entry.id!]);
    }

    this.schedules.removeAt(index);
    this.scheduleEntries.splice(index, 1);
  }

  openCreateDialog(): void {
    this.editingClass.set(null);
    this.form.reset({
      name: '',
      brief: '',
      description: '',
      requirement: '',
      guarantee: '',
      price: 0,
      subjectIds: [],
      gradeIds: [],
      teacherId: null,
      isDisplayed: true,
      image: '',
    });
    this.schedules.clear();
    this.schedules.push(this.fb.control(''));
    this.scheduleEntries = [{ time: '', isNew: true }];
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.uploadedImageUrl.set(null);
    this.deletedScheduleIds.set([]);
    this.dialogOpen.set(true);
  }

  openEditDialog(classItem: Class): void {
    this.editingClass.set(classItem);
    this.form.patchValue({
      name: classItem.name,
      brief: classItem.brief,
      description: classItem.description,
      requirement: classItem.requirement,
      guarantee: classItem.guarantee,
      price: classItem.price,
      subjectIds: classItem.subjects?.map((s) => s.id) || [],
      gradeIds: classItem.grades?.map((g) => g.id) || [],
      teacherId: classItem.teacher?.id || null,
      isDisplayed: classItem.isDisplayed,
      image: classItem.image,
    });

    // Setup schedules
    this.schedules.clear();
    this.scheduleEntries = [];
    if (classItem.scheduleResponses?.length) {
      classItem.scheduleResponses.forEach((s) => {
        this.schedules.push(this.fb.control(s.time || ''));
        this.scheduleEntries.push({ id: s.id, time: s.time, isNew: false });
      });
    } else {
      this.schedules.push(this.fb.control(''));
      this.scheduleEntries.push({ time: '', isNew: true });
    }

    this.selectedFile.set(null);
    this.previewUrl.set(classItem.image || null);
    this.uploadedImageUrl.set(classItem.image || null);
    this.deletedScheduleIds.set([]);
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
    this.editingClass.set(null);
    this.form.reset();
    this.schedules.clear();
    this.schedules.push(this.fb.control(''));
    this.scheduleEntries = [];
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.uploadedImageUrl.set(null);
    this.deletedScheduleIds.set([]);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile.set(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);

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
            this.form.patchValue({ image: response.data });
            this.notification.showSuccess('Tải hình ảnh thành công');
          }
        },
        error: (err) => {
          console.error('Failed to upload image:', err);
          const msg = err?.error?.message || 'Không thể tải hình ảnh';
          this.notification.showError(msg);
          this.selectedFile.set(null);
          this.previewUrl.set(this.editingClass()?.image || null);
        },
      });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const formValue = this.form.value;
    const imageUrl = this.uploadedImageUrl() || formValue.image || '';

    if (this.editingClass()) {
      const updateData: UpdateClassRequest = {
        id: this.editingClass()!.id,
        name: formValue.name!,
        brief: formValue.brief!,
        description: formValue.description!,
        requirement: formValue.requirement || '',
        guarantee: formValue.guarantee || '',
        price: formValue.price!,
        subjectIds: formValue.subjectIds || [],
        gradeIds: formValue.gradeIds || [],
        teacherId: formValue.teacherId,
        isDisplayed: formValue.isDisplayed!,
        image: imageUrl,
      };

      this.classApi
        .update(this.editingClass()!.id, updateData)
        .pipe(finalize(() => this.submitting.set(false)))
        .subscribe({
          next: () => {
            this.handleSchedules(this.editingClass()!.id);
            this.notification.showSuccess('Cập nhật lớp học thành công');
            this.closeDialog();
            this.loadClasses();
          },
          error: (err) => {
            console.error('Failed to update class:', err);
            this.notification.showError('Không thể cập nhật lớp học');
          },
        });
    } else {
      const createData: CreateClassRequest = {
        name: formValue.name!,
        brief: formValue.brief!,
        description: formValue.description!,
        requirement: formValue.requirement || '',
        guarantee: formValue.guarantee || '',
        price: formValue.price!,
        subjectIds: formValue.subjectIds || [],
        gradeIds: formValue.gradeIds || [],
        teacherId: formValue.teacherId,
        isDisplayed: formValue.isDisplayed!,
        image: imageUrl,
      };

      this.classApi
        .create(createData)
        .pipe(finalize(() => this.submitting.set(false)))
        .subscribe({
          next: (response) => {
            if (response.data?.id) {
              this.handleSchedules(response.data.id);
            }
            this.notification.showSuccess('Tạo lớp học thành công');
            this.closeDialog();
            this.loadClasses();
          },
          error: (err) => {
            console.error('Failed to create class:', err);
            this.notification.showError('Không thể tạo lớp học');
          },
        });
    }
  }

  private handleSchedules(classId: number): void {
    // Delete removed schedules
    const deletedIds = this.deletedScheduleIds();
    const deleteObs = deletedIds.map((id) => this.scheduleApi.delete(id));

    // Create/update schedules
    const scheduleValues = this.schedules.value as string[];
    const createUpdateObs: ReturnType<typeof this.scheduleApi.create>[] = [];

    scheduleValues.forEach((time, index) => {
      if (!time?.trim()) return;

      const entry = this.scheduleEntries[index];
      if (entry?.isNew || !entry?.id) {
        createUpdateObs.push(
          this.scheduleApi.create({ time: time.trim(), clazzId: classId }),
        );
      } else if (entry.id) {
        createUpdateObs.push(
          this.scheduleApi.update(entry.id, {
            id: entry.id,
            time: time.trim(),
            clazzId: classId,
          }),
        );
      }
    });

    if (deleteObs.length > 0 || createUpdateObs.length > 0) {
      forkJoin([...deleteObs, ...createUpdateObs]).subscribe({
        error: (err) => console.error('Failed to update schedules:', err),
      });
    }
  }

  openDeleteDialog(classItem: Class): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Xóa lớp học',
        message: `Bạn có chắc chắn muốn xóa "${classItem.name}"? Hành động này không thể hoàn tác.`,
        confirmText: 'Xóa',
        cancelText: 'Hủy',
        confirmColor: 'warn',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteClass(classItem);
      }
    });
  }

  private deleteClass(classItem: Class): void {
    this.classApi.delete(classItem.id).subscribe({
      next: () => {
        this.notification.showSuccess('Xóa lớp học thành công');
        this.loadClasses();
      },
      error: (err) => {
        console.error('Failed to delete class:', err);
        this.notification.showError('Không thể xóa lớp học');
      },
    });
  }
}
