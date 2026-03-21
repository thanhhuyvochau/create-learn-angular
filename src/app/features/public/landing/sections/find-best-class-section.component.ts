import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { ConsultationApiService } from '../../../../core/api';
import { NotificationService } from '../../../../core/notifications/notification.service';

@Component({
  selector: 'app-find-best-class-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  template: `
    <section id="find-best-class" class="consultation-section">
      <div class="section-header">
        <h2 class="section-title">Đăng Ký Tư Vấn Miễn Phí</h2>
        <p class="section-subtitle">
          Trao đổi cùng đội ngũ học thuật AlgoCore để xây dựng lộ trình phù hợp
          cho mục tiêu IB, AP & Cambridge.
        </p>
      </div>

      <mat-card class="consultation-card">
        @if (successMessage()) {
          <div class="notification success">
            <mat-icon>check_circle</mat-icon>
            <span>{{ successMessage() }}</span>
          </div>
        }

        @if (errorMessage()) {
          <div class="notification error">
            <mat-icon>error</mat-icon>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <form
          [formGroup]="form"
          (ngSubmit)="onSubmit()"
          class="consultation-form"
        >
          <div class="form-layout">
            <div class="form-image">
              <img
                src="https://cdn.create-learn.us/next-image/create-learn-prod/strapi-studio/Class_Recommendation_Widge_3321183a76.png?width=640"
                alt="Consultation Form Image"
              />
            </div>

            <div class="form-fields">
              <mat-form-field appearance="outline">
                <mat-label>Họ và tên</mat-label>
                <input
                  matInput
                  formControlName="customerName"
                  placeholder="Nhập họ và tên của phụ huynh/học sinh"
                />
                @if (
                  form.get('customerName')?.hasError('required') &&
                  form.get('customerName')?.touched
                ) {
                  <mat-error>Họ và tên là bắt buộc</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Số điện thoại</mat-label>
                <input
                  matInput
                  formControlName="phoneNumber"
                  placeholder="Nhập số điện thoại để đội ngũ tư vấn liên hệ"
                />
                @if (
                  form.get('phoneNumber')?.hasError('required') &&
                  form.get('phoneNumber')?.touched
                ) {
                  <mat-error>Số điện thoại là bắt buộc</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input
                  matInput
                  type="email"
                  formControlName="email"
                  placeholder="Nhập email để nhận lộ trình và tài liệu tham khảo"
                />
                @if (
                  form.get('email')?.hasError('required') &&
                  form.get('email')?.touched
                ) {
                  <mat-error>Email là bắt buộc</mat-error>
                }
                @if (
                  form.get('email')?.hasError('email') &&
                  form.get('email')?.touched
                ) {
                  <mat-error>Email không hợp lệ</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Mục tiêu & nhu cầu học tập</mat-label>
                <textarea
                  matInput
                  formControlName="content"
                  rows="4"
                  placeholder="Chia sẻ chương trình đang theo học (IB/AP/Cambridge), mục tiêu điểm số và những khó khăn hiện tại"
                ></textarea>
                @if (
                  form.get('content')?.hasError('required') &&
                  form.get('content')?.touched
                ) {
                  <mat-error>Nội dung là bắt buộc</mat-error>
                }
              </mat-form-field>

              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="isLoading()"
                class="submit-button"
              >
                @if (isLoading()) {
                  <span>Đang gửi...</span>
                } @else {
                  <span>Đăng Ký Tư Vấn Ngay</span>
                }
              </button>
            </div>
          </div>
        </form>
      </mat-card>
    </section>
  `,
  styles: [
    `
      .consultation-section {
        background: var(--gradient-brand);
        padding: 48px 24px;
      }

      .section-header {
        text-align: center;
        margin-bottom: 40px;
      }

      .section-title {
        font-size: clamp(2rem, 4vw, 3rem);
        font-weight: 500;
        color: var(--color-brand-navy-6);
        margin: 0 0 16px 0;
      }

      .section-subtitle {
        font-size: 1rem;
        color: #64748b;
        max-width: 600px;
        margin: 0 auto;
      }

      .consultation-card {
        max-width: 1152px;
        margin: 0 auto;
        padding: 32px;
        border-radius: 12px;
      }

      .notification {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 24px;
      }

      .notification.success {
        background: #d1fae5;
        color: #065f46;
      }

      .notification.error {
        background: #fee2e2;
        color: #991b1b;
      }

      .consultation-form {
        width: 100%;
      }

      .form-layout {
        display: flex;
        align-items: center;
        gap: 50px;
      }

      .form-image {
        flex: 0 0 254px;
      }

      .form-image img {
        width: 100%;
        height: auto;
      }

      .form-fields {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      mat-form-field {
        width: 100%;
        max-width: 400px;
      }

      .submit-button {
        width: 232px;
        padding: 12px 24px;
        font-size: 1rem;
        border-radius: 8px;
        background-color: var(--color-brand-teal-6);
        color: var(--color-surface-1);
        font-weight: 500;
        transition: background-color 0.3s;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .form-layout {
          flex-direction: column;
          gap: 20px;
        }

        .form-image {
          flex: none;
          width: 200px;
        }

        mat-form-field {
          max-width: 90%;
        }
      }
    `,
  ],
})
export class FindBestClassSectionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly consultationApi = inject(ConsultationApiService);
  private readonly notification = inject(NotificationService);

  isLoading = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    customerName: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    content: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.consultationApi.create(this.form.value).subscribe({
      next: () => {
        this.successMessage.set(
          'Yêu cầu tư vấn đã được gửi thành công! Chúng tôi sẽ liên hệ với bạn sớm.',
        );
        this.form.reset();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error submitting consultation:', err);
        this.errorMessage.set(
          'Không thể gửi yêu cầu tư vấn. Vui lòng thử lại sau.',
        );
        this.isLoading.set(false);
      },
    });
  }
}
