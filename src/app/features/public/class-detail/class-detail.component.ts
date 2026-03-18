import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { ClassApiService, RegistrationApiService } from '../../../core/api';
import { NotificationService } from '../../../core/notifications/notification.service';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { RegistrationDialogComponent } from './registration-dialog.component';
import type { Class } from '../../../models';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    MatButtonModule,
    MatChipsModule,
    MatDialogModule,
    MatIconModule,
    SafeHtmlPipe,
  ],
  template: `
    <div class="class-detail-page">
      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      } @else if (error() || !classData()) {
        <div class="error-container">
          <p>Lớp học không tồn tại hoặc có lỗi xảy ra.</p>
          <button mat-raised-button color="primary" (click)="goBack()">
            Quay lại
          </button>
        </div>
      } @else {
        <div class="class-content">
          <!-- Main Info Section -->
          <div class="main-info">
            <div class="class-image">
              <img
                [src]="classData()!.image || 'https://picsum.photos/600/400'"
                [alt]="classData()!.name"
              />
            </div>

            <div class="class-info">
              <!-- Subjects -->
              @if (classData()!.subjects && classData()!.subjects.length) {
                <p class="subject-tags">
                  {{ getSubjectNames() }}
                </p>
              }

              <h5 class="class-name">{{ classData()!.name }}</h5>
              <p class="class-brief">{{ classData()!.brief }}</p>

              <!-- Schedule -->
              @if (
                classData()!.scheduleResponses &&
                classData()!.scheduleResponses.length
              ) {
                <div class="schedule-section">
                  <p class="schedule-label">Lịch học:</p>
                  <div class="schedule-chips">
                    @for (
                      schedule of classData()!.scheduleResponses;
                      track schedule.id
                    ) {
                      <mat-chip-set>
                        <mat-chip>{{ schedule.time }}</mat-chip>
                      </mat-chip-set>
                    }
                  </div>
                </div>
              }

              <button
                mat-raised-button
                color="primary"
                class="register-button"
                (click)="openRegistrationDialog()"
              >
                Đăng ký lớp học
              </button>
            </div>
          </div>
          <hr id="separate-line" />
          <!-- Description Section -->
          @if (classData()!.description) {
            <div class="description-section">
              <!-- <h2 class="description-title">Mô tả lớp học</h2> -->
              <div
                class="description-content"
                [innerHTML]="classData()!.description | safeHtml"
              ></div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .class-detail-page {
        min-height: 100vh;
        padding-bottom: 80px;
      }

      .loading-container,
      .error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 50vh;
        gap: 16px;
      }

      .error-container p {
        color: #dc2626;
      }

      .class-content {
        max-width: 1200px;
        margin: 0 auto;
      }

      .main-info {
        display: flex;
        gap: 20px;
        padding: 24px;
      }

      .class-image {
        flex: 0 0 auto;
      }

      .class-image img {
        max-height: 350px;
        width: auto;
        object-fit: contain;
        border-radius: 12px;
      }

      .expert-icons {
        margin-top: 16px;
        text-align: center;
      }

      .expert-text {
        font-size: 0.875rem;
        color: #64748b;
      }

      .class-info {
        flex: 1;
        padding: 28px;
        max-width: 700px;
      }

      .subject-tags {
        font-size: 0.75rem;
        color: #64748b;
        margin: 0 0 8px 0;
        text-transform: uppercase;
      }

      .class-name {
        font-weight: 600;
        color: #2563eb;
        margin: 0 0 12px 0;
      }

      .class-brief {
        font-size: 1.25rem;
        font-weight: 500;
        color: #374151;
        margin: 0 0 20px 0;
        line-height: 1.5;
      }

      .schedule-section {
        margin-bottom: 28px;
      }

      .schedule-label {
        font-size: 1rem;
        font-weight: 500;
        color: #374151;
        margin: 0 0 8px 0;
      }

      .schedule-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .register-button {
        padding: 12px 32px;
        font-size: 1rem;
        border-radius: 8px;
      }

      .description-section {
        max-width: 900px;
        margin: 40px auto 100px;
        padding: 0 24px;
      }

      .description-content {
        line-height: 1.8;
        color: #374151;
      }

      .description-content :deep(h1),
      .description-content :deep(h2),
      .description-content :deep(h3) {
        color: var(--color-brand-navy-6);
        margin-top: 24px;
        margin-bottom: 12px;
      }

      .description-content :deep(p) {
        margin-bottom: 16px;
      }

      .description-content :deep(ul),
      .description-content :deep(ol) {
        padding-left: 24px;
        margin-bottom: 16px;
      }
      #separate-line {
        border: none;
        height: 1px;
        background-color: rgba(0, 0, 0, 0.12);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
        margin: 24px 0;
      }
      /* Responsive */
      @media (max-width: 768px) {
        .main-info {
          flex-direction: column;
          align-items: center;
        }

        .class-image img {
          max-width: 100%;
          max-height: 250px;
        }

        .class-info {
          padding: 16px;
          text-align: center;
        }

        .schedule-chips {
          justify-content: center;
        }
      }
    `,
  ],
})
export class ClassDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly classApi = inject(ClassApiService);
  private readonly registrationApi = inject(RegistrationApiService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  isLoading = signal(true);
  error = signal(false);
  classData = signal<Class | null>(null);

  ngOnInit(): void {
    const classId = this.route.snapshot.paramMap.get('id');
    if (classId) {
      this.loadClass(Number(classId));
    } else {
      this.error.set(true);
      this.isLoading.set(false);
    }
  }

  private loadClass(classId: number): void {
    this.classApi.getById(classId).subscribe({
      next: (response) => {
        if (response.status === 200 && response.data) {
          this.classData.set(response.data);
        } else {
          this.error.set(true);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.isLoading.set(false);
      },
    });
  }

  getSubjectNames(): string {
    return (
      this.classData()
        ?.subjects?.map((s) => s.name.toUpperCase())
        .join(', ') || ''
    );
  }

  openRegistrationDialog(): void {
    const dialogRef = this.dialog.open(RegistrationDialogComponent, {
      width: '500px',
      data: {
        classId: this.classData()?.id,
        className: this.classData()?.name,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.submitRegistration(result);
      }
    });
  }

  private submitRegistration(data: {
    customerName: string;
    customerEmail: string;
    phoneNumber: string;
  }): void {
    const clazzId = this.classData()?.id;
    if (!clazzId) {
      this.notification.showError('Lỗi: Không tìm thấy lớp học.');
      return;
    }

    const submitData = {
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      phoneNumber: data.phoneNumber,
      status: 'PROCESSING' as const,
      clazzId,
    };

    this.registrationApi.create(submitData).subscribe({
      next: () => {
        this.notification.showSuccess('Đăng ký thành công!');
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.notification.showError('Không thể đăng ký. Vui lòng thử lại.');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/class']);
  }
}
