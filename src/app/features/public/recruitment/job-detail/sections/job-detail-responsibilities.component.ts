import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import type { JobResponsibility } from '../../../../../models/recruitment.model';

@Component({
  selector: 'app-job-detail-responsibilities',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="resp-card">
      <h2 class="resp-heading">Trách Nhiệm Chính</h2>
      <div class="resp-grid">
        @for (item of items(); track item.title) {
          <div class="resp-item">
            <div class="resp-icon-wrap">
              <mat-icon class="resp-icon">{{ item.icon }}</mat-icon>
            </div>
            <div class="resp-text">
              <h4 class="resp-item-title">{{ item.title }}</h4>
              <p class="resp-item-body">{{ item.body }}</p>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .resp-card {
      background: var(--color-surface-1, #f3f4f5);
      border-radius: 12px;
      padding: 40px;
    }

    .resp-heading {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--color-brand-navy-6);
      margin: 0 0 32px;
    }

    .resp-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 32px;
    }

    .resp-item {
      display: flex;
      gap: 16px;
    }

    .resp-icon-wrap {
      flex-shrink: 0;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(0, 168, 150, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .resp-icon {
      font-size: 1.25rem !important;
      width: 1.25rem !important;
      height: 1.25rem !important;
      line-height: 1.25rem !important;
      color: var(--color-brand-teal-6);
    }

    .resp-item-title {
      font-size: 0.975rem;
      font-weight: 700;
      color: var(--color-brand-navy-6);
      margin: 0 0 6px;
    }

    .resp-item-body {
      font-size: 0.875rem;
      color: var(--color-slate-5);
      line-height: 1.6;
      margin: 0;
    }

    @media (max-width: 640px) {
      .resp-grid {
        grid-template-columns: 1fr;
        gap: 24px;
      }
    }
  `],
})
export class JobDetailResponsibilitiesComponent {
  readonly items = input.required<JobResponsibility[]>();
}
