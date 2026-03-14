import { Component } from '@angular/core';

import { HeroSectionComponent } from './sections/hero-section.component';
import { FeatureCardSectionComponent } from './sections/feature-card-section.component';
import { PopularSubjectSectionComponent } from './sections/popular-subject-section.component';
import { FreeClassesSectionComponent } from './sections/free-classes-section.component';
import { PopularClassSectionComponent } from './sections/popular-class-section.component';
import { FindBestClassSectionComponent } from './sections/find-best-class-section.component';
import { CustomerReviewSectionComponent } from './sections/customer-review-section.component';
import { NewsSectionComponent } from './sections/news-section.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    HeroSectionComponent,
    FeatureCardSectionComponent,
    PopularSubjectSectionComponent,
    FreeClassesSectionComponent,
    PopularClassSectionComponent,
    FindBestClassSectionComponent,
    CustomerReviewSectionComponent,
    NewsSectionComponent,
  ],
  template: `
    <app-hero-section />
    <app-feature-card-section />
    <app-popular-subject-section />
    <app-free-classes-section />
    <app-popular-class-section />
    <app-find-best-class-section />
    <app-customer-review-section />
    <app-news-section />
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class LandingComponent {}
