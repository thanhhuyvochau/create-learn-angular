import {
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import type {
  JobPosting,
  DepartmentBadgeVariant,
} from '../../../../models/recruitment.model';

interface BadgeConfig {
  bgClass: string;
  textClass: string;
}

const BADGE_CONFIG: Record<DepartmentBadgeVariant, BadgeConfig> = {
  secondary: { bgClass: 'badge--secondary', textClass: '' },
  primary: { bgClass: 'badge--primary', textClass: '' },
  tertiary: { bgClass: 'badge--tertiary', textClass: '' },
};

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="job-card">
      <div class="job-card-header">
        <span [class]="badgeClasses()">{{ job().department }}</span>
        <mat-icon class="bookmark-icon">bookmark_border</mat-icon>
      </div>

      <h3 class="job-card-title">{{ job().title }}</h3>

      <div class="job-card-location">
        <mat-icon class="location-icon">place</mat-icon>
        <span>{{ job().location }}</span>
      </div>

      <a class="job-card-link" href="#">
        View Details
        <mat-icon class="link-arrow">arrow_forward</mat-icon>
      </a>
    </article>
  `,
  styles: [
    `
      .job-card {
        background: #ffffff;
        border-radius: 12px;
        padding: 32px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
        display: flex;
        flex-direction: column;
        transition:
          box-shadow 0.25s ease,
          transform 0.25s ease;
      }

      .job-card:hover {
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
        transform: translateY(-4px);
      }

      /* Header row: badge + bookmark */
      .job-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
      }

      /* Department badge */
      .badge {
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 0.65rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .badge--secondary {
        background: #a6c5fe;
        color: #264778;
      }

      .badge--primary {
        background: #79f7e3;
        color: #00201c;
      }

      .badge--tertiary {
        background: #d3e4fe;
        color: #0b1c30;
      }

      /* Bookmark icon */
      .bookmark-icon {
        font-size: 1.25rem !important;
        width: 1.25rem !important;
        height: 1.25rem !important;
        line-height: 1.25rem !important;
        color: var(--color-slate-4, #94a3b8);
        cursor: pointer;
        transition: color 0.2s ease;
      }

      .bookmark-icon:hover {
        color: var(--color-brand-teal-6);
      }

      /* Title */
      .job-card-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--color-brand-navy-6);
        margin: 0 0 8px 0;
        line-height: 1.35;
        flex: 1;
      }

      /* Location */
      .job-card-location {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--color-slate-5);
        font-size: 0.875rem;
        margin-bottom: 32px;
      }

      .location-icon {
        font-size: 1rem !important;
        width: 1rem !important;
        height: 1rem !important;
        line-height: 1rem !important;
      }

      /* CTA link */
      .job-card-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--color-brand-teal-6);
        font-weight: 700;
        font-size: 0.875rem;
        text-decoration: none;
        margin-top: auto;
      }

      .link-arrow {
        font-size: 0.875rem !important;
        width: 0.875rem !important;
        height: 0.875rem !important;
        line-height: 0.875rem !important;
        transition: transform 0.2s ease;
      }

      .job-card-link:hover .link-arrow {
        transform: translateX(4px);
      }
    `,
  ],
})
export class JobCardComponent {
  readonly job = input.required<JobPosting>();

  readonly badgeClasses = computed((): string => {
    const variant = this.job().badgeVariant;
    const cfg = BADGE_CONFIG[variant];
    return `badge ${cfg.bgClass}`;
  });
}
