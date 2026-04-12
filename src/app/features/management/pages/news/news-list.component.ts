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
  RichTextEditorComponent,
  StatusBadgeComponent,
  type ColumnDef,
  type ConfirmDialogData,
  type CellTemplateContext,
} from '../../../../shared/components';
import { NewsApiService, FileUploadApiService } from '../../../../core/api';
import { NotificationService } from '../../../../core/notifications/notification.service';
import type { News, CreateNewsRequest, UpdateNewsRequest } from '../../../../models';

@Component({
  selector: 'app-news-list',
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
    RichTextEditorComponent,
    StatusBadgeComponent,
  ],
  template: `
    <div class="news-list-container">
      <app-page-header
        title="Tin tức"
        subtitle="Quản lý bài viết tin tức"
        (addClick)="openCreateDialog()"
      ></app-page-header>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (error()) {
        <div class="error-message">
          <mat-icon>error</mat-icon>
          <span>{{ error() }}</span>
          <button mat-button color="primary" (click)="loadNews()">Thử lại</button>
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
                placeholder="Tìm theo tiêu đề..."
              />
            </mat-form-field>
          </div>
          <app-data-table
            [data]="newsList()"
            [columns]="columns"
            [cellTemplates]="cellTemplates()"
            [showActions]="true"
            [emptyMessage]="'Không tìm thấy tin tức nào'"
            (edit)="openEditDialog($event)"
            (delete)="openDeleteDialog($event)"
          >
          </app-data-table>

          <ng-template #imageTemplate let-row>
            @if (row.image) {
              <img
                [src]="row.image"
                [alt]="row.title"
                class="table-news-image"
              />
            } @else {
              <div class="table-image-placeholder">
                <mat-icon>image</mat-icon>
              </div>
            }
          </ng-template>

          <ng-template #statusTemplate let-row>
            <app-status-badge [status]="row.isDisplay ? 'PUBLISHED' : 'DRAFT'"></app-status-badge>
          </ng-template>

          <div class="table-footer">
            <span class="table-caption">
              Hiển thị {{ newsList().length }} trên {{ totalElements() }} mục
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
              <h2>{{ editingNews() ? 'Chỉnh sửa tin tức' : 'Tạo tin tức' }}</h2>
              <button mat-icon-button (click)="closeDialog()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="dialog-body">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tiêu đề</mat-label>
                <input matInput formControlName="title" placeholder="Nhập tiêu đề tin tức" />
                @if (form.controls.title.hasError('required')) {
                  <mat-error>Tiêu đề là bắt buộc</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Mô tả ngắn</mat-label>
                <textarea
                  matInput
                  formControlName="brief"
                  placeholder="Nhập mô tả ngắn"
                  rows="2"
                ></textarea>
                @if (form.controls.brief.hasError('required')) {
                  <mat-error>Mô tả ngắn là bắt buộc</mat-error>
                }
              </mat-form-field>

              <div class="form-field-group">
                <label class="form-label">Nội dung <span class="required">*</span></label>
                <app-rich-text-editor
                  [content]="form.controls.content.value || ''"
                  (contentChange)="form.controls.content.setValue($event)"
                  placeholder="Viết nội dung tin tức..."
                ></app-rich-text-editor>
              </div>

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
                  <img [src]="previewUrl()" alt="Xem trước tin tức" />
                </div>
              }

              <div class="checkbox-row">
                <mat-checkbox formControlName="isDisplay">Hiển thị tin tức này</mat-checkbox>
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
                    {{ editingNews() ? 'Cập nhật' : 'Tạo mới' }}
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
      .news-list-container {
        padding: 24px;
      }

      .table-news-image {
        width: 60px;
        height: 40px;
        object-fit: cover;
        border-radius: 4px;
        border: 1px solid #e0e0e0;
      }

      .table-image-placeholder {
        width: 60px;
        height: 40px;
        border-radius: 4px;
        background-color: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #e0e0e0;
      }

      .table-image-placeholder mat-icon {
        color: #9e9e9e;
        font-size: 20px;
        width: 20px;
        height: 20px;
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

      .dialog-large {
        max-width: 700px;
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
export class NewsListComponent implements OnInit {
  private readonly newsApi = inject(NewsApiService);
  private readonly fileUploadApi = inject(FileUploadApiService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  // Cell templates
  imageTemplate = viewChild.required<TemplateRef<CellTemplateContext<News>>>('imageTemplate');
  statusTemplate = viewChild.required<TemplateRef<CellTemplateContext<News>>>('statusTemplate');
  cellTemplates = computed(() => ({
    image: this.imageTemplate(),
    isDisplay: this.statusTemplate(),
  }));

  // State signals
  newsList = signal<News[]>([]);
  totalElements = signal(0);
  totalPages = signal(0);
  pageIndex = signal(0);
  pageSize = signal(10);
  loading = signal(false);
  error = signal<string | null>(null);
  dialogOpen = signal(false);
  editingNews = signal<News | null>(null);
  submitting = signal(false);
  uploading = signal(false);
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  uploadedImageUrl = signal<string | null>(null);
  searchTerm = signal('');
  private readonly searchInput$ = new Subject<string>();
  private readonly destroyRef = inject(DestroyRef);

  // Form
  form = this.fb.group({
    title: ['', Validators.required],
    brief: ['', Validators.required],
    content: ['', Validators.required],
    isDisplay: [true],
    image: [''],
  });

  // Column definitions
  columns: ColumnDef<News>[] = [
    {
      key: 'image',
      header: 'Hình ảnh',
      sortable: false,
      width: '80px',
    },
    { key: 'title', header: 'Tiêu đề' },
    {
      key: 'brief',
      header: 'Mô tả ngắn',
      render: (row) => row.brief?.length > 50 ? row.brief.slice(0, 50) + '...' : row.brief,
    },
    {
      key: 'isDisplay',
      header: 'Trạng thái',
      width: '200px',
    },
  ];

  ngOnInit(): void {
    this.loadNews();

    this.searchInput$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((term: string) => {
        this.searchTerm.set(term);
        this.pageIndex.set(0);
        this.loadNews();
      });
  }

  loadNews(): void {
    this.loading.set(true);
    this.error.set(null);

    this.newsApi
      .getAllNews({ page: this.pageIndex(), size: this.pageSize(), search: this.searchTerm() || undefined })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.status === 200 && response.data) {
            this.newsList.set(response.data.data);
            this.totalElements.set(response.data.totalElements);
            this.totalPages.set(response.data.totalPages);
          }
        },
        error: (err) => {
          console.error('Failed to load news:', err);
          this.error.set('Không thể tải tin tức. Vui lòng thử lại.');
        },
      });
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadNews();
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchInput$.next(value);
  }

  openCreateDialog(): void {
    this.editingNews.set(null);
    this.form.reset({ isDisplay: true });
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.uploadedImageUrl.set(null);
    this.dialogOpen.set(true);
  }

  openEditDialog(news: News): void {
    this.editingNews.set(news);
    this.form.patchValue({
      title: news.title,
      brief: news.brief,
      content: news.content,
      isDisplay: news.isDisplay,
      image: news.image,
    });
    this.selectedFile.set(null);
    this.previewUrl.set(news.image || null);
    this.uploadedImageUrl.set(news.image || null);
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
    this.editingNews.set(null);
    this.form.reset({ isDisplay: true });
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.uploadedImageUrl.set(null);
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
          this.previewUrl.set(this.editingNews()?.image || null);
        },
      });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const formValue = this.form.value;
    const imageUrl = this.uploadedImageUrl() || formValue.image || '';

    if (this.editingNews()) {
      const updateData: UpdateNewsRequest = {
        id: this.editingNews()!.id,
        title: formValue.title!,
        brief: formValue.brief!,
        content: formValue.content!,
        isDisplay: formValue.isDisplay!,
        image: imageUrl,
      };

      this.newsApi
        .update(this.editingNews()!.id, updateData)
        .pipe(finalize(() => this.submitting.set(false)))
        .subscribe({
          next: () => {
            this.notification.showSuccess('Cập nhật tin tức thành công');
            this.closeDialog();
            this.loadNews();
          },
          error: (err) => {
            console.error('Failed to update news:', err);
            this.notification.showError('Không thể cập nhật tin tức');
          },
        });
    } else {
      const createData: CreateNewsRequest = {
        title: formValue.title!,
        brief: formValue.brief!,
        content: formValue.content!,
        isDisplay: formValue.isDisplay!,
        image: imageUrl,
      };

      this.newsApi
        .create(createData)
        .pipe(finalize(() => this.submitting.set(false)))
        .subscribe({
          next: () => {
            this.notification.showSuccess('Tạo tin tức thành công');
            this.closeDialog();
            this.loadNews();
          },
          error: (err) => {
            console.error('Failed to create news:', err);
            this.notification.showError('Không thể tạo tin tức');
          },
        });
    }
  }

  openDeleteDialog(news: News): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Xóa tin tức',
        message: `Bạn có chắc chắn muốn xóa "${news.title}"? Hành động này không thể hoàn tác.`,
        confirmText: 'Xóa',
        cancelText: 'Hủy',
        confirmColor: 'warn',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteNews(news);
      }
    });
  }

  private deleteNews(news: News): void {
    this.newsApi.delete(news.id).subscribe({
      next: () => {
        this.notification.showSuccess('Xóa tin tức thành công');
        this.loadNews();
      },
      error: (err) => {
        console.error('Failed to delete news:', err);
        this.notification.showError('Không thể xóa tin tức');
      },
    });
  }
}
