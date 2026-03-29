import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

@Component({
  selector: 'app-job-detail-description',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="desc-card">
      <h2 class="desc-heading">
        <span class="accent-bar" aria-hidden="true"></span>
        Mô Tả Công Việc
      </h2>
      @for (para of paragraphs(); track $index) {
        <p class="desc-para" [class.desc-para--lead]="$first">{{ para }}</p>
      }
    </section>
  `,
  styles: [`
    .desc-card {
      background: #ffffff;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    }

    .desc-heading {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--color-brand-navy-6);
      margin: 0 0 24px;
    }

    .accent-bar {
      display: inline-block;
      width: 4px;
      height: 28px;
      background: var(--color-brand-teal-6);
      border-radius: 9999px;
      flex-shrink: 0;
    }

    .desc-para {
      color: var(--color-slate-5);
      line-height: 1.75;
      margin: 0 0 16px;
      font-size: 0.975rem;
    }

    .desc-para--lead {
      font-size: 1.05rem;
      color: var(--color-slate-6, #475569);
    }

    .desc-para:last-child {
      margin-bottom: 0;
    }
  `],
})
export class JobDetailDescriptionComponent {
  readonly paragraphs = input.required<string[]>();
}
