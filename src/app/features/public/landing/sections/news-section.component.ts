import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ClassCardComponent } from '../../../../shared/components/class-card/class-card.component';
import { NewsApiService } from '../../../../core/api';
import type { News } from '../../../../models';

@Component({
  selector: 'app-news-section',
  standalone: true,
  imports: [MatProgressSpinnerModule, ClassCardComponent],
  template: `
    <section class="news-section">
      <h2 class="section-title">Bài viết học thuật của AlgoCore</h2>

      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      } @else if (error()) {
        <p class="error-message">Không thể tải tin tức. Vui lòng thử lại sau.</p>
      } @else if (displayNews().length === 0) {
        <p class="no-news">Chưa có bài viết nào.</p>
      } @else {
        <div class="news-grid">
          @for (newsItem of displayNews(); track newsItem.id) {
            <app-class-card
              [imageUrl]="newsItem.image || 'https://picsum.photos/400/200'"
              [title]="newsItem.title"
              [description]="newsItem.brief || ''"
              [buttonText]="'Tìm hiểu thêm'"
              (cardClick)="navigateToNews(newsItem.id)"
            />
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .news-section {
      padding: 48px 24px;
      text-align: center;
      background: white;
    }

    .section-title {
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 600;
      color: #2563eb;
      margin: 0 0 40px 0;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px 0;
    }

    .error-message {
      color: #dc2626;
      padding: 24px;
    }

    .no-news {
      color: #64748b;
      padding: 24px;
    }

    .news-grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 40px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .news-grid app-class-card {
      flex: 1 1 220px;
      max-width: 260px;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .news-grid {
        gap: 20px;
      }

      .news-grid app-class-card {
        flex: 0 0 calc(50% - 10px);
        max-width: calc(50% - 10px);
      }
    }
  `],
})
export class NewsSectionComponent implements OnInit {
  private readonly newsApi = inject(NewsApiService);
  private readonly router = inject(Router);

  isLoading = signal(true);
  error = signal(false);
  displayNews = signal<News[]>([]);

  ngOnInit(): void {
    this.loadNews();
  }

  private loadNews(): void {
    this.newsApi.getAllNews({ page: 0, size: 100 }).subscribe({
      next: (response) => {
        if (response.status === 200 && response.data?.data) {
          // Only show published (isDisplay=true) news, max 8 items
          const publishedNews = response.data.data
            .filter((n: News) => n.isDisplay)
            .slice(0, 8);
          this.displayNews.set(publishedNews);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.isLoading.set(false);
      },
    });
  }

  navigateToNews(newsId: number): void {
    this.router.navigate(['/news', newsId]);
  }
}
