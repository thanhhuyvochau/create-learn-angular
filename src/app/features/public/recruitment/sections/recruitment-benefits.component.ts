import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import type { RecruitmentBenefit } from '../../../../models/recruitment.model';

const BENEFITS: RecruitmentBenefit[] = [
  {
    icon: 'trending_up',       // classic: trending_up ✓
    title: 'Professional Growth',
    description:
      'Continuous learning stipends, weekly knowledge-sharing sessions, and a clear path to leadership.',
  },
  {
    icon: 'group',             // classic equivalent of Material Symbols 'groups'
    title: 'Collaborative Environment',
    description:
      'Work alongside world-class educators and software engineers in a flat, high-trust organizational structure.',
  },
  {
    icon: 'stars',             // classic equivalent of Material Symbols 'auto_awesome'
    title: 'Student Success',
    description:
      'Directly impact thousands of learners. We measure our success by the breakthroughs our students achieve.',
  },
  {
    icon: 'favorite',          // classic equivalent of Material Symbols 'health_and_safety'
    title: 'Holistic Wellbeing',
    description:
      'Comprehensive healthcare, flexible remote-work options, and a genuine commitment to work-life harmony.',
  },
];

@Component({
  selector: 'app-recruitment-benefits',
  standalone: true,
  imports: [NgFor, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="benefits-section">
      <div class="benefits-container">
        <!-- Left heading column -->
        <div class="benefits-heading">
          <h2 class="benefits-title">Why Join AlgoCore Education?</h2>
          <p class="benefits-subtitle">
            We provide an environment where your intellectual curiosity meets
            real-world impact.
          </p>
          <div class="benefits-divider"></div>
        </div>

        <!-- Benefits grid -->
        <div class="benefits-grid">
          <div
            *ngFor="let benefit of benefits; trackBy: trackByIcon"
            class="benefit-card"
          >
            <div class="benefit-icon-wrap">
              <mat-icon class="benefit-icon">{{ benefit.icon }}</mat-icon>
            </div>
            <h3 class="benefit-card-title">{{ benefit.title }}</h3>
            <p class="benefit-card-desc">{{ benefit.description }}</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .benefits-section {
      padding: 96px 0;
      background: #ffffff;
    }

    .benefits-container {
      max-width: 1184px;
      margin: 0 auto;
      padding: 0 32px;
      display: flex;
      gap: 64px;
      align-items: flex-start;
    }

    /* Heading column */
    .benefits-heading {
      flex: 0 0 300px;
      position: sticky;
      top: 80px;
    }

    .benefits-title {
      font-size: clamp(1.75rem, 3vw, 2.25rem);
      font-weight: 700;
      color: var(--color-brand-navy-6);
      line-height: 1.25;
      margin: 0 0 20px 0;
    }

    .benefits-subtitle {
      color: var(--color-slate-5);
      font-size: 1.05rem;
      line-height: 1.7;
      margin: 0 0 32px 0;
    }

    .benefits-divider {
      height: 4px;
      width: 56px;
      border-radius: 9999px;
      background: var(--color-brand-teal-6);
    }

    /* Grid */
    .benefits-grid {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px 40px;
    }

    /* Card */
    .benefit-card {
      display: flex;
      flex-direction: column;
    }

    .benefit-icon-wrap {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background: var(--color-surface-2, #f3f4f5);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      transition: background 0.25s ease;
    }

    .benefit-card:hover .benefit-icon-wrap {
      background: var(--color-brand-teal-6);
    }

    .benefit-icon {
      font-size: 1.5rem !important;
      width: 1.5rem !important;
      height: 1.5rem !important;
      line-height: 1.5rem !important;
      color: var(--color-brand-teal-6);
      transition: color 0.25s ease;
    }

    .benefit-card:hover .benefit-icon {
      color: #ffffff;
    }

    .benefit-card-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--color-brand-navy-6);
      margin: 0 0 10px 0;
    }

    .benefit-card-desc {
      font-size: 0.95rem;
      color: var(--color-slate-5);
      line-height: 1.7;
      margin: 0;
    }

    /* Responsive */
    @media (max-width: 900px) {
      .benefits-container {
        flex-direction: column;
        gap: 40px;
      }

      .benefits-heading {
        flex: none;
        position: static;
      }

      .benefits-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 560px) {
      .benefits-section {
        padding: 64px 0;
      }

      .benefits-grid {
        grid-template-columns: 1fr;
        gap: 36px;
      }
    }
  `],
})
export class RecruitmentBenefitsComponent {
  readonly benefits: RecruitmentBenefit[] = BENEFITS;

  trackByIcon(_index: number, benefit: RecruitmentBenefit): string {
    return benefit.icon;
  }
}
