import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RecruitmentHeroComponent } from './sections/recruitment-hero.component';
import { RecruitmentBenefitsComponent } from './sections/recruitment-benefits.component';
import { RecruitmentOpeningsComponent } from './sections/recruitment-openings.component';
import { RecruitmentNewsletterComponent } from './sections/recruitment-newsletter.component';

@Component({
  selector: 'app-recruitment',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RecruitmentHeroComponent,
    RecruitmentBenefitsComponent,
    RecruitmentOpeningsComponent,
    RecruitmentNewsletterComponent,
  ],
  template: `
    <app-recruitment-hero />
    <app-recruitment-benefits />
    <app-recruitment-openings />
    <app-recruitment-newsletter />
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class RecruitmentComponent {}
