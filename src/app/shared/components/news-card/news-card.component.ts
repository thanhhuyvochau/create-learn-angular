import { Component, input, output, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { DatePipe } from '@angular/common';

import type { News } from '../../../models';

@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [MatCardModule, DatePipe],
  template: `
    <mat-card class="news-card" (click)="onCardClick()">
      <div class="card-image-container">
        <img
          [src]="displayImage()"
          [alt]="displayTitle()"
          class="card-image"
        />
      </div>
      <mat-card-content>
        @if (displayDate()) {
          <span class="card-date">{{ displayDate() | date:'dd/MM/yyyy' }}</span>
        }
        <h3 class="card-title">{{ displayTitle() }}</h3>
        <p class="card-brief">{{ displayBrief() }}</p>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .news-card {
      cursor: pointer;
      height: 100%;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s;
      border-radius: 12px;
      overflow: hidden;
    }

    .news-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }

    .card-image-container {
      position: relative;
      width: 100%;
      padding-top: 60%; /* 5:3 aspect ratio */
      overflow: hidden;
    }

    .card-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }

    .news-card:hover .card-image {
      transform: scale(1.05);
    }

    mat-card-content {
      flex: 1;
      padding: 16px;
    }

    .card-date {
      font-size: 0.75rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .card-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-brand-navy-6);
      margin: 8px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.4;
    }

    .card-brief {
      font-size: 0.875rem;
      color: #64748b;
      line-height: 1.5;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `],
})
export class NewsCardComponent {
  // Accept either a news object or individual inputs
  news = input<News | null>(null);
  imageUrl = input<string>('');
  title = input<string>('');
  brief = input<string>('');
  date = input<string>('');

  cardClick = output<void>();

  // Computed values that check news object first, then fall back to individual inputs
  displayImage = computed(() => {
    const newsData = this.news();
    return newsData?.image || this.imageUrl() || '/images/placeholder-news.jpg';
  });

  displayTitle = computed(() => {
    const newsData = this.news();
    return newsData?.title || this.title() || '';
  });

  displayBrief = computed(() => {
    const newsData = this.news();
    return newsData?.brief || this.brief() || '';
  });

  displayDate = computed(() => {
    const newsData = this.news();
    return newsData?.createdAt || this.date() || '';
  });

  onCardClick(): void {
    this.cardClick.emit();
  }
}
