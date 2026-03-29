import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { RecruitmentApiService } from '../../../../core/api/recruitment-api.service';
import type { JobPosting } from '../../../../models/recruitment.model';
import {
  JobDetailHeroComponent,
  JobDetailDescriptionComponent,
  JobDetailResponsibilitiesComponent,
  JobDetailRequirementsComponent,
  JobDetailBenefitsComponent,
  JobDetailSidebarComponent,
} from './sections';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [
    RouterModule,
    MatIconModule,
    JobDetailHeroComponent,
    JobDetailDescriptionComponent,
    JobDetailResponsibilitiesComponent,
    JobDetailRequirementsComponent,
    JobDetailBenefitsComponent,
    JobDetailSidebarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Loading -->
    @if (isLoading()) {
      <div class="state-center">
        <div class="spinner"></div>
      </div>
    }

    <!-- Not found -->
    @if (!isLoading() && !job()) {
      <div class="state-center">
        <mat-icon class="state-icon">work_off</mat-icon>
        <p class="state-title">Không tìm thấy vị trí tuyển dụng.</p>
        <a class="state-link" routerLink="/recruitment">
          <mat-icon class="back-arrow">arrow_back</mat-icon>
          Quay lại tất cả vị trí tuyển dụng
        </a>
      </div>
    }

    <!-- Content -->
    @if (!isLoading() && job(); as posting) {
      <app-job-detail-hero [job]="posting" />

      <main class="detail-main">
        <div class="detail-container">
          <div class="detail-grid">

            <!-- Left: stacked content sections -->
            <div class="detail-content">
              @if (posting.description && posting.description.length > 0) {
                <app-job-detail-description [paragraphs]="posting.description" />
              }

              @if (posting.responsibilities && posting.responsibilities.length > 0) {
                <app-job-detail-responsibilities [items]="posting.responsibilities" />
              }

              @if (posting.requirements && posting.requirements.length > 0) {
                <app-job-detail-requirements [items]="posting.requirements" />
              }

              @if (posting.benefits && posting.benefits.length > 0) {
                <app-job-detail-benefits [items]="posting.benefits" />
              }
            </div>

            <!-- Right: sticky sidebar -->
            <app-job-detail-sidebar [job]="posting" />

          </div>
        </div>
      </main>
    }
  `,
  styles: [`
    /* ── Loading / error states ──────────────────────────── */
    .state-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      gap: 16px;
      padding: 64px 32px;
    }

    .spinner {
      width: 52px;
      height: 52px;
      border: 4px solid var(--color-surface-2, #e7e8e9);
      border-top-color: var(--color-brand-teal-6);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .state-icon {
      font-size: 3rem !important;
      width: 3rem !important;
      height: 3rem !important;
      line-height: 3rem !important;
      color: var(--color-slate-4, #94a3b8);
    }

    .state-title {
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--color-brand-navy-6);
      margin: 0;
    }

    .state-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--color-brand-teal-6);
      font-weight: 600;
      font-size: 0.95rem;
      text-decoration: none;
      margin-top: 4px;
    }

    .state-link:hover {
      text-decoration: underline;
    }

    .back-arrow {
      font-size: 1rem !important;
      width: 1rem !important;
      height: 1rem !important;
      line-height: 1rem !important;
    }

    /* ── Main layout ─────────────────────────────────────── */
    .detail-main {
      background: var(--color-surface-1, #f3f4f5);
      padding-bottom: 80px;
    }

    .detail-container {
      max-width: 1184px;
      margin: 0 auto;
      padding: 0 32px;
      margin-top: -96px; /* pull up over hero diagonal clip */
      position: relative;
      z-index: 1;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 40px;
      align-items: start;
    }

    /* Left column: stacked sections */
    .detail-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
      min-width: 0; /* prevent grid blowout */
    }

    /* ── Responsive ──────────────────────────────────────── */
    @media (max-width: 1024px) {
      .detail-grid {
        grid-template-columns: 1fr 300px;
        gap: 28px;
      }
    }

    @media (max-width: 768px) {
      .detail-container {
        padding: 0 20px;
        margin-top: -64px;
      }

      .detail-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class JobDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly recruitmentApi = inject(RecruitmentApiService);

  readonly job = signal<JobPosting | null>(null);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? parseInt(idParam, 10) : NaN;

    if (isNaN(id)) {
      this.isLoading.set(false);
      return;
    }

    this.recruitmentApi.getJobPostingById(id).subscribe({
      next: (posting) => {
        this.job.set(posting ?? null);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
