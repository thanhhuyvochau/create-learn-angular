import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

import { NewsApiService } from '../../../core/api';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import type { News } from '../../../models';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [MatProgressSpinnerModule, MatButtonModule, SafeHtmlPipe],
  template: `
    <div class="news-detail-page">
      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      } @else if (error() || !newsData()) {
        <div class="error-container">
          <p>Bai viet khong ton tai hoac co loi xay ra.</p>
          <button mat-raised-button color="primary" (click)="goBack()">
            Quay lai
          </button>
        </div>
      } @else {
        <article class="news-content">
          <!-- News Image -->
          @if (newsData()!.image) {
            <div class="news-image">
              <img [src]="newsData()!.image" [alt]="newsData()!.title" />
            </div>
          }

          <!-- News Title -->
          <h1 class="news-title">{{ newsData()!.title }}</h1>

          <!-- News Brief -->
          @if (newsData()!.brief) {
            <p class="news-brief">{{ newsData()!.brief }}</p>
          }

          <!-- News Content -->
          <div class="news-body" [innerHTML]="newsData()!.content | safeHtml"></div>

          <!-- Draft Warning -->
          @if (!newsData()!.isDisplay) {
            <div class="draft-warning">
              Bai viet nay dang o che do nhap va chua duoc xuat ban.
            </div>
          }
        </article>
      }
    </div>
  `,
  styles: [`
    .news-detail-page {
      min-height: 100vh;
      padding: 48px 24px 100px;
    }

    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 50vh;
      gap: 16px;
    }

    .error-container p {
      color: #dc2626;
    }

    .news-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .news-image {
      margin-bottom: 32px;
      border-radius: 12px;
      overflow: hidden;
    }

    .news-image img {
      width: 100%;
      max-height: 400px;
      object-fit: cover;
    }

    .news-title {
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      font-weight: 700;
      color: #2563eb;
      text-align: center;
      margin: 0 0 24px 0;
      line-height: 1.3;
    }

    .news-brief {
      font-size: 1.25rem;
      font-style: italic;
      color: #64748b;
      text-align: center;
      margin: 0 0 40px 0;
      line-height: 1.5;
    }

    .news-body {
      font-size: 1.125rem;
      line-height: 1.8;
      color: #374151;
    }

    .news-body :deep(h1),
    .news-body :deep(h2),
    .news-body :deep(h3),
    .news-body :deep(h4) {
      color: var(--color-brand-navy-6);
      margin-top: 32px;
      margin-bottom: 16px;
    }

    .news-body :deep(p) {
      margin-bottom: 20px;
    }

    .news-body :deep(ul),
    .news-body :deep(ol) {
      padding-left: 28px;
      margin-bottom: 20px;
    }

    .news-body :deep(li) {
      margin-bottom: 8px;
    }

    .news-body :deep(blockquote) {
      border-left: 4px solid #2563eb;
      padding-left: 20px;
      margin: 24px 0;
      color: #64748b;
      font-style: italic;
    }

    .news-body :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 24px 0;
    }

    .news-body :deep(a) {
      color: #2563eb;
      text-decoration: underline;
    }

    .news-body :deep(a:hover) {
      color: #1d4ed8;
    }

    .draft-warning {
      margin-top: 40px;
      padding: 16px 24px;
      background: #fef3c7;
      border-radius: 8px;
      color: #92400e;
      text-align: center;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .news-detail-page {
        padding: 32px 16px 80px;
      }

      .news-body {
        font-size: 1rem;
      }
    }
  `],
})
export class NewsDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly newsApi = inject(NewsApiService);

  isLoading = signal(true);
  error = signal(false);
  newsData = signal<News | null>(null);

  ngOnInit(): void {
    const newsId = this.route.snapshot.paramMap.get('id');
    if (newsId) {
      this.loadNews(Number(newsId));
    } else {
      this.error.set(true);
      this.isLoading.set(false);
    }
  }

  private loadNews(newsId: number): void {
    this.newsApi.getById(newsId).subscribe({
      next: (response) => {
        if (response.status === 200 && response.data) {
          this.newsData.set(response.data);
        } else {
          this.error.set(true);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.isLoading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/news']);
  }
}
