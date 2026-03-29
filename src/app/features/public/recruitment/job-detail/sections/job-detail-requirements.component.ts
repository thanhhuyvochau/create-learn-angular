import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-job-detail-requirements',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="req-card">
      <h2 class="req-heading">Yêu Cầu &amp; Bằng Cấp</h2>
      <ul class="req-list">
        @for (item of items(); track $index) {
          <li class="req-item">
            <mat-icon class="req-check">check_circle</mat-icon>
            <span>{{ item }}</span>
          </li>
        }
      </ul>
    </section>
  `,
  styles: [`
    .req-card {
      background: #ffffff;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
      border: 1px solid rgba(187, 202, 197, 0.25);
    }

    .req-heading {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--color-brand-navy-6);
      margin: 0 0 24px;
    }

    .req-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .req-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      color: var(--color-slate-5);
      font-size: 0.975rem;
      line-height: 1.6;
    }

    .req-check {
      font-size: 1.25rem !important;
      width: 1.25rem !important;
      height: 1.25rem !important;
      line-height: 1.25rem !important;
      color: var(--color-brand-teal-6);
      flex-shrink: 0;
      margin-top: 2px;
    }
  `],
})
export class JobDetailRequirementsComponent {
  readonly items = input.required<string[]>();
}
