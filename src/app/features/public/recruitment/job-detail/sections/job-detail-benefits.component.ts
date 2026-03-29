import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import type { JobBenefit } from '../../../../../models/recruitment.model';

@Component({
  selector: 'app-job-detail-benefits',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="ben-card">
      <div class="ben-corner-accent" aria-hidden="true"></div>
      <h2 class="ben-heading">Phúc Lợi Tổ Chức</h2>
      <div class="ben-grid">
        @for (item of items(); track item.title) {
          <div class="ben-item">
            <mat-icon class="ben-icon">{{ item.icon }}</mat-icon>
            <h4 class="ben-item-title">{{ item.title }}</h4>
            <p class="ben-item-body">{{ item.body }}</p>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .ben-card {
      background: var(--color-surface-2, #e7e8e9);
      border-radius: 12px;
      padding: 40px;
      position: relative;
      overflow: hidden;
    }

    .ben-corner-accent {
      position: absolute;
      top: 0;
      right: 0;
      width: 120px;
      height: 120px;
      background: rgba(0, 168, 150, 0.1);
      border-bottom-left-radius: 100%;
      pointer-events: none;
    }

    .ben-heading {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--color-brand-navy-6);
      margin: 0 0 32px;
      position: relative;
      z-index: 1;
    }

    .ben-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      position: relative;
      z-index: 1;
    }

    .ben-item {
      background: #ffffff;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    }

    .ben-icon {
      font-size: 1.5rem !important;
      width: 1.5rem !important;
      height: 1.5rem !important;
      line-height: 1.5rem !important;
      color: var(--color-brand-teal-6);
      display: block;
      margin-bottom: 12px;
    }

    .ben-item-title {
      font-size: 0.975rem;
      font-weight: 700;
      color: var(--color-brand-navy-6);
      margin: 0 0 6px;
    }

    .ben-item-body {
      font-size: 0.8rem;
      color: var(--color-slate-5);
      line-height: 1.55;
      margin: 0;
    }

    @media (max-width: 560px) {
      .ben-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class JobDetailBenefitsComponent {
  readonly items = input.required<JobBenefit[]>();
}
