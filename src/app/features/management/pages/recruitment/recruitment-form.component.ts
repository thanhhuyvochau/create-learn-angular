import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import {
  FormBuilder,
  FormArray,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs';

import { RecruitmentApiService } from '../../../../core/api';
import { NotificationService } from '../../../../core/notifications/notification.service';
import type {
  JobPosting,
  CreateJobPostingRequest,
  UpdateJobPostingRequest,
  BadgeVariantEnum,
  JobTypeEnum,
  JobDepartment,
} from '../../../../models';

/** Department options for the dropdown */
const DEPARTMENTS: {
  value: Exclude<JobDepartment, 'All Departments'>;
  label: string;
}[] = [
  { value: 'Mathematics', label: 'Toán học' },
  { value: 'Coding', label: 'Lập trình' },
  { value: 'Admissions', label: 'Tuyển sinh' },
];

/** Badge variant options mapped to departments */
const BADGE_VARIANTS: { value: BadgeVariantEnum; label: string }[] = [
  { value: 'PRIMARY', label: 'Primary' },
  { value: 'SECONDARY', label: 'Secondary' },
  { value: 'TERTIARY', label: 'Tertiary' },
];

/** Job type radio options */
const JOB_TYPES: { value: JobTypeEnum; label: string }[] = [
  { value: 'FULL_TIME', label: 'Toàn thời gian' },
  { value: 'PART_TIME', label: 'Bán thời gian' },
  { value: 'CONTRACT', label: 'Hợp đồng' },
];

/** Commonly used Material icon names for responsibilities/benefits */
const ICON_OPTIONS: string[] = [
  'school',
  'psychology',
  'groups',
  'insights',
  'menu_book',
  'hub',
  'task_alt',
  'verified_user',
  'paid',
  'flight',
  'health_and_safety',
  'card_giftcard',
  'rocket_launch',
  'home_work',
  'payments',
  'work',
  'science',
  'code',
  'trending_up',
  'star',
];

@Component({
  selector: 'app-recruitment-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  template: `
    <div class="page-wrap">
      <!-- ── Page Header ──────────────────────────────────────────── -->
      <section class="page-header">
        <div>
          <nav class="breadcrumb">
            <a routerLink="/management/recruitment" class="breadcrumb-link"
              >Tuyển dụng</a
            >
            <mat-icon class="breadcrumb-sep">chevron_right</mat-icon>
            <span class="breadcrumb-current">
              {{ isEditMode() ? 'Chỉnh sửa' : 'Tạo mới' }}
            </span>
          </nav>
          <h2 class="page-title">
            {{
              isEditMode()
                ? 'Chỉnh sửa tin tuyển dụng'
                : 'Tạo tin tuyển dụng mới'
            }}
          </h2>
          @if (isEditMode() && jobPosting()) {
            <p class="page-subtitle">
              {{ jobPosting()!.title }} • ID: {{ jobPosting()!.id }}
            </p>
          }
        </div>
        <div class="header-actions">
          <button
            mat-stroked-button
            (click)="onDiscard()"
            [disabled]="submitting()"
          >
            Hủy bỏ
          </button>
          <button
            mat-flat-button
            color="primary"
            (click)="onSubmit()"
            [disabled]="form.invalid || submitting()"
          >
            @if (submitting()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              <ng-container>
                <div class="save-content-btn">
                  <mat-icon>save</mat-icon>
                  <span>{{
                    isEditMode() ? 'Lưu thay đổi' : 'Tạo vị trí'
                  }}</span>
                </div>
              </ng-container>
            }
          </button>
        </div>
      </section>

      <!-- ── Loading State ────────────────────────────────────────── -->
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Đang tải dữ liệu...</p>
        </div>
      } @else {
        <!-- ── Form ─────────────────────────────────────────────────── -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-layout">
          <!-- Section: Basic Information ─────────────────────────────── -->
          <section class="form-section">
            <div class="section-header">
              <div class="section-icon">
                <mat-icon>info</mat-icon>
              </div>
              <h3 class="section-title">Thông tin cơ bản</h3>
            </div>

            <div class="fields-grid">
              <!-- Title (full width) -->
              <mat-form-field class="field-full" appearance="outline">
                <mat-label>Tên vị trí</mat-label>
                <input
                  matInput
                  formControlName="title"
                  placeholder="VD: Giảng viên Thuật toán cấp cao"
                />
                @if (form.controls['title'].hasError('required')) {
                  <mat-error>Tên vị trí là bắt buộc</mat-error>
                }
              </mat-form-field>

              <!-- Department -->
              <mat-form-field appearance="outline">
                <mat-label>Bộ phận</mat-label>
                <mat-select formControlName="department">
                  @for (dept of departments; track dept.value) {
                    <mat-option [value]="dept.value">{{
                      dept.label
                    }}</mat-option>
                  }
                </mat-select>
                @if (form.controls['department'].hasError('required')) {
                  <mat-error>Bộ phận là bắt buộc</mat-error>
                }
              </mat-form-field>

              <!-- Location -->
              <mat-form-field appearance="outline">
                <mat-label>Địa điểm</mat-label>
                <input
                  matInput
                  formControlName="location"
                  placeholder="VD: Remote / Hà Nội"
                />
                @if (form.controls['location'].hasError('required')) {
                  <mat-error>Địa điểm là bắt buộc</mat-error>
                }
              </mat-form-field>

              <!-- Job Type (radio group) -->
              <div class="field-group">
                <label class="field-label">Loại hình</label>
                <mat-radio-group
                  formControlName="type"
                  class="type-radio-group"
                >
                  @for (jt of jobTypes; track jt.value) {
                    <mat-radio-button [value]="jt.value" color="primary">
                      {{ jt.label }}
                    </mat-radio-button>
                  }
                </mat-radio-group>
              </div>

              <!-- Deadline -->
              <mat-form-field appearance="outline">
                <mat-label>Hạn nộp hồ sơ</mat-label>
                <input matInput type="date" formControlName="deadline" />
              </mat-form-field>

              <!-- Badge Variant -->
              <mat-form-field appearance="outline">
                <mat-label>Badge Variant</mat-label>
                <mat-select formControlName="badgeVariant">
                  @for (bv of badgeVariants; track bv.value) {
                    <mat-option [value]="bv.value">{{ bv.label }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <!-- Recruiter -->
              <mat-form-field appearance="outline">
                <mat-label>Người phụ trách</mat-label>
                <input
                  matInput
                  formControlName="recruiter"
                  placeholder="VD: Nguyễn Văn A"
                />
              </mat-form-field>

              <!-- Reference -->
              <mat-form-field appearance="outline">
                <mat-label>Mã tham chiếu</mat-label>
                <input
                  matInput
                  formControlName="reference"
                  placeholder="VD: AC-2024-081"
                  [readonly]="isEditMode()"
                />
              </mat-form-field>

              <!-- Active toggle (full width) -->
              <div class="field-full toggle-row">
                <mat-slide-toggle formControlName="isActive" color="primary">
                  Hiển thị công khai
                </mat-slide-toggle>
                <span class="toggle-hint">
                  {{
                    form.controls['isActive'].value
                      ? 'Vị trí đang hiển thị trên trang tuyển dụng'
                      : 'Vị trí đang ẩn'
                  }}
                </span>
              </div>
            </div>
          </section>

          <!-- Section: Description ───────────────────────────────────── -->
          <section class="form-section">
            <div class="section-header">
              <div class="section-icon">
                <mat-icon>subject</mat-icon>
              </div>
              <h3 class="section-title">Mô tả công việc</h3>
            </div>

            <div formArrayName="description" class="description-list">
              @for (
                ctrl of descriptionControls.controls;
                track $index;
                let i = $index
              ) {
                <div class="description-item">
                  <mat-form-field appearance="outline" class="field-full">
                    <mat-label>Đoạn {{ i + 1 }}</mat-label>
                    <textarea
                      matInput
                      [formControlName]="i"
                      rows="4"
                      placeholder="Nhập nội dung mô tả..."
                    ></textarea>
                  </mat-form-field>
                  @if (descriptionControls.length > 1) {
                    <button
                      mat-icon-button
                      type="button"
                      class="remove-btn"
                      (click)="removeDescription(i)"
                      matTooltip="Xóa đoạn"
                    >
                      <mat-icon>close</mat-icon>
                    </button>
                  }
                </div>
              }
              <button
                mat-stroked-button
                type="button"
                color="primary"
                class="add-btn"
                (click)="addDescription()"
              >
                <mat-icon>add</mat-icon>
                Thêm đoạn
              </button>
            </div>
          </section>

          <!-- Section: Responsibilities & Requirements ────────────── -->
          <div class="two-col-grid">
            <!-- Responsibilities -->
            <section class="form-section">
              <div class="section-header">
                <div class="section-icon">
                  <mat-icon>task_alt</mat-icon>
                </div>
                <h3 class="section-title">Trách nhiệm</h3>
                <button
                  mat-stroked-button
                  type="button"
                  color="primary"
                  class="section-action-btn"
                  (click)="addResponsibility()"
                >
                  <mat-icon>add</mat-icon>
                  Thêm
                </button>
              </div>

              <div formArrayName="responsibilities" class="dynamic-list">
                @for (
                  group of responsibilityControls.controls;
                  track $index;
                  let i = $index
                ) {
                  <div class="dynamic-card" [formGroupName]="i">
                    <div class="dynamic-card-header">
                      <mat-form-field appearance="outline" class="icon-field">
                        <mat-label>Icon</mat-label>
                        <mat-select formControlName="icon">
                          @for (ic of iconOptions; track ic) {
                            <mat-option [value]="ic">
                              <mat-icon>{{ ic }}</mat-icon>
                              {{ ic }}
                            </mat-option>
                          }
                        </mat-select>
                      </mat-form-field>
                      <button
                        mat-icon-button
                        type="button"
                        color="warn"
                        class="remove-btn-small"
                        (click)="removeResponsibility(i)"
                        matTooltip="Xóa"
                      >
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                    <mat-form-field appearance="outline" class="field-full">
                      <mat-label>Tiêu đề</mat-label>
                      <input
                        matInput
                        formControlName="title"
                        placeholder="VD: Thiết kế chương trình"
                      />
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="field-full">
                      <mat-label>Mô tả</mat-label>
                      <textarea
                        matInput
                        formControlName="body"
                        rows="2"
                        placeholder="Mô tả chi tiết trách nhiệm..."
                      ></textarea>
                    </mat-form-field>
                  </div>
                }

                @if (responsibilityControls.length === 0) {
                  <div class="empty-list">
                    <mat-icon>playlist_add</mat-icon>
                    <p>Chưa có trách nhiệm nào. Nhấn "Thêm" để bắt đầu.</p>
                  </div>
                }
              </div>
            </section>

            <!-- Requirements -->
            <section class="form-section">
              <div class="section-header">
                <div class="section-icon">
                  <mat-icon>verified_user</mat-icon>
                </div>
                <h3 class="section-title">Yêu cầu</h3>
                <button
                  mat-stroked-button
                  type="button"
                  color="primary"
                  class="section-action-btn"
                  (click)="addRequirement()"
                >
                  <mat-icon>add</mat-icon>
                  Thêm
                </button>
              </div>

              <div formArrayName="requirements" class="dynamic-list">
                @for (
                  ctrl of requirementControls.controls;
                  track $index;
                  let i = $index
                ) {
                  <div class="requirement-row">
                    <mat-icon class="drag-icon">drag_indicator</mat-icon>
                    <mat-form-field appearance="outline" class="field-flex">
                      <input
                        matInput
                        [formControlName]="i"
                        placeholder="VD: Thạc sĩ hoặc Tiến sĩ Toán học"
                      />
                    </mat-form-field>
                    <button
                      mat-icon-button
                      type="button"
                      class="remove-btn-small"
                      (click)="removeRequirement(i)"
                      matTooltip="Xóa"
                    >
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                }

                @if (requirementControls.length === 0) {
                  <div class="empty-list">
                    <mat-icon>playlist_add</mat-icon>
                    <p>Chưa có yêu cầu nào. Nhấn "Thêm" để bắt đầu.</p>
                  </div>
                }
              </div>
            </section>
          </div>

          <!-- Section: Benefits ──────────────────────────────────────── -->
          <section class="form-section">
            <div class="section-header">
              <div class="section-icon">
                <mat-icon>card_giftcard</mat-icon>
              </div>
              <h3 class="section-title">Phúc lợi</h3>
              <button
                mat-stroked-button
                type="button"
                color="primary"
                class="section-action-btn"
                (click)="addBenefit()"
              >
                <mat-icon>add</mat-icon>
                Thêm phúc lợi
              </button>
            </div>

            <div formArrayName="benefits" class="benefits-grid">
              @for (
                group of benefitControls.controls;
                track $index;
                let i = $index
              ) {
                <div class="benefit-card" [formGroupName]="i">
                  <div class="benefit-card-top">
                    <mat-form-field appearance="outline" class="icon-field-sm">
                      <mat-select formControlName="icon">
                        @for (ic of iconOptions; track ic) {
                          <mat-option [value]="ic">
                            <mat-icon>{{ ic }}</mat-icon>
                            {{ ic }}
                          </mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                    <button
                      mat-icon-button
                      type="button"
                      color="warn"
                      class="remove-btn-small"
                      (click)="removeBenefit(i)"
                      matTooltip="Xóa"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                  <mat-form-field appearance="outline" class="field-full">
                    <mat-label>Tiêu đề</mat-label>
                    <input
                      matInput
                      formControlName="title"
                      placeholder="VD: Lương cạnh tranh"
                    />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="field-full">
                    <mat-label>Mô tả</mat-label>
                    <textarea
                      matInput
                      formControlName="body"
                      rows="2"
                      placeholder="Mô tả chi tiết phúc lợi..."
                    ></textarea>
                  </mat-form-field>
                </div>
              }

              @if (benefitControls.length === 0) {
                <div class="empty-list empty-list--wide">
                  <mat-icon>card_giftcard</mat-icon>
                  <p>Chưa có phúc lợi nào. Nhấn "Thêm phúc lợi" để bắt đầu.</p>
                </div>
              }
            </div>
          </section>
        </form>
      }
      <!-- end loading check -->

      <!-- ── Mobile Sticky Footer ──────────────────────────────────── -->
      <div class="mobile-footer">
        <button
          mat-stroked-button
          (click)="onDiscard()"
          [disabled]="submitting()"
        >
          Hủy bỏ
        </button>
        <button
          mat-flat-button
          color="primary"
          (click)="onSubmit()"
          [disabled]="form.invalid || submitting()"
        >
          @if (submitting()) {
            <mat-spinner diameter="18"></mat-spinner>
          } @else {
            {{ isEditMode() ? 'Lưu' : 'Tạo vị trí' }}
          }
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      /* ── Layout ──────────────────────────────────────────────────────── */
      .page-wrap {
        padding: 24px;
        max-width: 960px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding-bottom: 96px;
      }

      /* ── Page Header ─────────────────────────────────────────────────── */
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 16px;
      }
      .breadcrumb {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 8px;
      }
      .breadcrumb-link {
        font-size: 0.875rem;
        font-weight: 500;
        color: #00a896;
        text-decoration: none;
      }
      .breadcrumb-link:hover {
        text-decoration: underline;
      }
      .breadcrumb-sep {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: rgba(0, 0, 0, 0.38);
      }
      .breadcrumb-current {
        font-size: 0.875rem;
        color: rgba(0, 0, 0, 0.6);
      }
      .page-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: rgba(0, 0, 0, 0.87);
        margin: 0 0 4px;
      }
      .page-subtitle {
        font-size: 0.875rem;
        color: rgba(0, 0, 0, 0.6);
        margin: 0;
      }
      .header-actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      /* ── Loading ──────────────────────────────────────────────────────── */
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 64px;
        color: rgba(0, 0, 0, 0.6);
      }

      /* ── Form Layout ─────────────────────────────────────────────────── */
      .form-layout {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      /* ── Form Sections ───────────────────────────────────────────────── */
      .form-section {
        background: #ffffff;
        border-radius: 8px;
        padding: 24px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        border: 1px solid rgba(0, 0, 0, 0.06);
      }
      .section-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 24px;
      }
      .section-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(0, 168, 150, 0.08);
        color: #00a896;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .section-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.87);
        margin: 0;
        flex: 1;
      }
      .section-action-btn {
        margin-left: auto;
      }
      .save-content-btn {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      /* ── Fields Grid ─────────────────────────────────────────────────── */
      .fields-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px 24px;
      }
      .field-full {
        grid-column: 1 / -1;
      }
      .field-flex {
        flex: 1;
      }
      .field-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-top: 4px;
      }
      .field-label {
        font-size: 0.75rem;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.6);
        letter-spacing: 0.02em;
      }
      .type-radio-group {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
      }

      /* Toggle row */
      .toggle-row {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 0;
      }
      .toggle-hint {
        font-size: 0.8125rem;
        color: rgba(0, 0, 0, 0.5);
        font-style: italic;
      }

      /* ── Description List ────────────────────────────────────────────── */
      .description-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .description-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }
      .description-item .field-full {
        flex: 1;
      }
      .add-btn {
        align-self: flex-start;
      }

      /* ── Two Column Grid ─────────────────────────────────────────────── */
      .two-col-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }

      /* ── Dynamic List (Responsibilities / Requirements) ──────────── */
      .dynamic-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .dynamic-card {
        background: #f5f5f5;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid transparent;
        transition: border-color 0.15s;
      }
      .dynamic-card:hover {
        border-color: rgba(0, 168, 150, 0.2);
      }
      .dynamic-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 8px;
      }
      .icon-field {
        width: 180px;
      }
      .icon-field-sm {
        width: 140px;
      }

      /* Requirement row */
      .requirement-row {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #f5f5f5;
        padding: 4px 8px 4px 12px;
        border-radius: 8px;
      }
      .drag-icon {
        color: rgba(0, 0, 0, 0.25);
        font-size: 18px;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }

      /* Remove buttons */
      .remove-btn {
        color: rgba(0, 0, 0, 0.38);
        flex-shrink: 0;
      }
      .remove-btn:hover {
        color: #c62828;
      }
      .remove-btn-small {
        flex-shrink: 0;
      }

      /* Empty list */
      .empty-list {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px 16px;
        color: rgba(0, 0, 0, 0.38);
        text-align: center;
      }
      .empty-list mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        margin-bottom: 8px;
      }
      .empty-list p {
        font-size: 0.8125rem;
        margin: 0;
      }
      .empty-list--wide {
        grid-column: 1 / -1;
      }

      /* ── Benefits Grid ───────────────────────────────────────────────── */
      .benefits-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }
      .benefit-card {
        background: #f5f5f5;
        padding: 16px;
        border-radius: 12px;
        border: 1px solid rgba(0, 0, 0, 0.06);
        transition: box-shadow 0.15s;
      }
      .benefit-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
      .benefit-card-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;
      }

      /* ── Mobile Sticky Footer ────────────────────────────────────────── */
      .mobile-footer {
        display: none;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(8px);
        box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
        gap: 12px;
        z-index: 50;
      }
      .mobile-footer button {
        flex: 1;
      }

      /* ── Responsive ──────────────────────────────────────────────────── */
      @media (max-width: 1024px) {
        .two-col-grid {
          grid-template-columns: 1fr;
        }
        .benefits-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 768px) {
        .page-wrap {
          padding: 16px;
        }
        .fields-grid {
          grid-template-columns: 1fr;
        }
        .benefits-grid {
          grid-template-columns: 1fr;
        }
        .page-header {
          flex-direction: column;
          align-items: stretch;
        }
        .header-actions {
          display: none;
        }
        .mobile-footer {
          display: flex;
        }
      }
    `,
  ],
})
export class RecruitmentFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly recruitmentApi = inject(RecruitmentApiService);
  private readonly notification = inject(NotificationService);

  // ── Constants exposed to template ──────────────────────────────────
  readonly departments = DEPARTMENTS;
  readonly badgeVariants = BADGE_VARIANTS;
  readonly jobTypes = JOB_TYPES;
  readonly iconOptions = ICON_OPTIONS;

  // ── State ──────────────────────────────────────────────────────────
  isEditMode = signal(false);
  loading = signal(false);
  submitting = signal(false);
  jobPosting = signal<JobPosting | null>(null);

  // ── Form ───────────────────────────────────────────────────────────
  form = this.fb.group({
    title: ['', Validators.required],
    department: ['', Validators.required],
    location: ['', Validators.required],
    badgeVariant: ['PRIMARY' as string, Validators.required],
    type: ['FULL_TIME' as string, Validators.required],
    isActive: [true],
    deadline: [''],
    recruiter: [''],
    reference: [''],
    description: this.fb.array<string>([]),
    responsibilities: this.fb.array<FormGroup>([]),
    requirements: this.fb.array<string>([]),
    benefits: this.fb.array<FormGroup>([]),
  });

  // ── FormArray accessors ────────────────────────────────────────────
  get descriptionControls(): FormArray {
    return this.form.controls['description'] as FormArray;
  }

  get responsibilityControls(): FormArray {
    return this.form.controls['responsibilities'] as FormArray;
  }

  get requirementControls(): FormArray {
    return this.form.controls['requirements'] as FormArray;
  }

  get benefitControls(): FormArray {
    return this.form.controls['benefits'] as FormArray;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.loadJobPosting(id);
    } else {
      // Create mode: start with one empty description paragraph
      this.addDescription();
    }
  }

  // ── Data Loading ───────────────────────────────────────────────────
  private loadJobPosting(id: string): void {
    this.loading.set(true);
    this.recruitmentApi
      .getByIdForAdmin(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          const job = response.data;
          this.jobPosting.set(job);
          this.patchForm(job);
        },
        error: () => {
          this.notification.showError(
            'Không thể tải dữ liệu vị trí tuyển dụng',
          );
          this.router.navigate(['/management/recruitment']);
        },
      });
  }

  private patchForm(job: JobPosting): void {
    // Patch simple fields
    this.form.patchValue({
      title: job.title,
      department: job.department,
      location: job.location,
      badgeVariant: job.badgeVariant as string,
      type: job.type ?? 'FULL_TIME',
      isActive: job.isActive ?? true,
      deadline: job.deadline ?? '',
      recruiter: job.recruiter ?? '',
      reference: job.reference ?? '',
    });

    // Patch description array
    this.descriptionControls.clear();
    if (job.description?.length) {
      for (const para of job.description) {
        this.descriptionControls.push(this.fb.control(para));
      }
    } else {
      this.addDescription();
    }

    // Patch responsibilities array
    this.responsibilityControls.clear();
    if (job.responsibilities?.length) {
      for (const resp of job.responsibilities) {
        this.responsibilityControls.push(
          this.fb.group({
            icon: [resp.icon],
            title: [resp.title, Validators.required],
            body: [resp.body],
          }),
        );
      }
    }

    // Patch requirements array
    this.requirementControls.clear();
    if (job.requirements?.length) {
      for (const req of job.requirements) {
        this.requirementControls.push(this.fb.control(req));
      }
    }

    // Patch benefits array
    this.benefitControls.clear();
    if (job.benefits?.length) {
      for (const ben of job.benefits) {
        this.benefitControls.push(
          this.fb.group({
            icon: [ben.icon],
            title: [ben.title, Validators.required],
            body: [ben.body],
          }),
        );
      }
    }
  }

  // ── FormArray Mutations ────────────────────────────────────────────

  addDescription(): void {
    this.descriptionControls.push(this.fb.control(''));
  }

  removeDescription(index: number): void {
    this.descriptionControls.removeAt(index);
  }

  addResponsibility(): void {
    this.responsibilityControls.push(
      this.fb.group({
        icon: ['school'],
        title: ['', Validators.required],
        body: [''],
      }),
    );
  }

  removeResponsibility(index: number): void {
    this.responsibilityControls.removeAt(index);
  }

  addRequirement(): void {
    this.requirementControls.push(this.fb.control(''));
  }

  removeRequirement(index: number): void {
    this.requirementControls.removeAt(index);
  }

  addBenefit(): void {
    this.benefitControls.push(
      this.fb.group({
        icon: ['paid'],
        title: ['', Validators.required],
        body: [''],
      }),
    );
  }

  removeBenefit(index: number): void {
    this.benefitControls.removeAt(index);
  }

  // ── Submit ─────────────────────────────────────────────────────────
  onSubmit(): void {
    if (this.form.invalid || this.submitting()) return;

    this.submitting.set(true);
    const base = this.buildPayload();

    if (this.isEditMode()) {
      const payload: UpdateJobPostingRequest = {
        id: this.jobPosting()!.id,
        ...base,
      };

      this.recruitmentApi
        .update(this.jobPosting()!.id, payload)
        .pipe(finalize(() => this.submitting.set(false)))
        .subscribe({
          next: () => {
            this.notification.showSuccess(
              'Cập nhật vị trí tuyển dụng thành công',
            );
            this.router.navigate(['/management/recruitment']);
          },
          error: () => {
            this.notification.showError('Không thể cập nhật vị trí tuyển dụng');
          },
        });
    } else {
      this.recruitmentApi
        .create(base)
        .pipe(finalize(() => this.submitting.set(false)))
        .subscribe({
          next: () => {
            this.notification.showSuccess('Tạo vị trí tuyển dụng thành công');
            this.router.navigate(['/management/recruitment']);
          },
          error: () => {
            this.notification.showError('Không thể tạo vị trí tuyển dụng');
          },
        });
    }
  }

  private buildPayload(): CreateJobPostingRequest {
    const fv = this.form.getRawValue();
    return {
      title: fv.title ?? '',
      department: fv.department ?? '',
      location: fv.location ?? '',
      badgeVariant: (fv.badgeVariant ?? 'PRIMARY') as BadgeVariantEnum,
      type: (fv.type ?? 'FULL_TIME') as JobTypeEnum,
      isActive: fv.isActive ?? true,
      deadline: fv.deadline || undefined,
      recruiter: fv.recruiter || undefined,
      reference: fv.reference || undefined,
      description: (fv.description ?? []).filter(
        (d: string | null): d is string => d != null && d.trim().length > 0,
      ),
      responsibilities: (fv.responsibilities ?? []).map(
        (r: Record<string, unknown>) => ({
          icon: String(r['icon'] ?? ''),
          title: String(r['title'] ?? ''),
          body: String(r['body'] ?? ''),
        }),
      ),
      requirements: (fv.requirements ?? []).filter(
        (r: string | null): r is string => r != null && r.trim().length > 0,
      ),
      benefits: (fv.benefits ?? []).map((b: Record<string, unknown>) => ({
        icon: String(b['icon'] ?? ''),
        title: String(b['title'] ?? ''),
        body: String(b['body'] ?? ''),
      })),
    };
  }

  onDiscard(): void {
    this.router.navigate(['/management/recruitment']);
  }
}
