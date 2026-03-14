import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { NewsCardComponent } from '../../../shared/components/news-card/news-card.component';
import { NewsApiService } from '../../../core/api';
import type { News } from '../../../models';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [MatProgressSpinnerModule, NewsCardComponent],
  template: `
    <div class="news-list-page">
      <!-- Header Banner - Desktop -->
      <div class="page-header desktop">
        <div class="header-image">
          <img src="assets/images/class-banner.png" alt="News Banner" />
          <div class="header-overlay">
            <h1 class="header-title">Kids' Coding Corner</h1>
            <h2 class="header-subtitle">
              Fun projects and resources for kids and teens to learn coding
            </h2>
          </div>
        </div>
      </div>

      <!-- Header Banner - Mobile -->
      <div class="page-header mobile">
        <div class="mobile-overlay"></div>
        <div class="mobile-content">
          <h1 class="mobile-title">Kids'</h1>
          <h2 class="mobile-title">Coding Corner</h2>
          <p class="mobile-subtitle">
            Fun projects and resources for kids and teens to learn coding
          </p>
        </div>
      </div>

      <!-- News Grid -->
      <div class="content-container">
        @if (isLoading()) {
          <div class="loading-container">
            <mat-spinner diameter="48"></mat-spinner>
          </div>
        } @else if (error()) {
          <div class="error-container">
            <p>Co loi xay ra khi tai tin tuc. Vui long thu lai sau.</p>
          </div>
        } @else {
          <div class="news-grid">
            @for (newsItem of news(); track newsItem.id) {
              <div class="news-card-wrapper">
                <app-news-card
                  [news]="newsItem"
                  (cardClick)="navigateToNews(newsItem.id)"
                />
              </div>
            }
          </div>

          @if (news().length === 0) {
            <p class="no-news">Chua co bai viet nao.</p>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .news-list-page {
      min-height: 100vh;
    }

    /* Desktop Header */
    .page-header.desktop {
      display: block;
    }

    .page-header.mobile {
      display: none;
    }

    .header-image {
      position: relative;
      height: 400px;
      overflow: hidden;
    }

    .header-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .header-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(26, 54, 93, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .header-title {
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 700;
      color: white;
      margin: 0 0 16px 0;
      text-align: center;
    }

    .header-subtitle {
      font-size: clamp(1rem, 2vw, 1.5rem);
      font-weight: 400;
      color: #e2e8f0;
      margin: 0;
      text-align: center;
      max-width: 600px;
    }

    /* Mobile Header */
    .page-header.mobile {
      position: relative;
      height: 360px;
      background: linear-gradient(135deg, rgba(26, 54, 93, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    }

    .mobile-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
    }

    .mobile-content {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 20px;
      text-align: center;
    }

    .mobile-title {
      font-size: 2rem;
      font-weight: 700;
      color: #2563eb;
      margin: 0;
    }

    .mobile-subtitle {
      font-size: 1.125rem;
      color: white;
      margin: 16px 0 0 0;
      max-width: 300px;
    }

    /* Content */
    .content-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 56px 24px 100px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px 0;
    }

    .error-container {
      text-align: center;
      color: #dc2626;
      padding: 48px;
    }

    .news-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 40px 24px;
      justify-items: center;
    }

    .news-card-wrapper {
      width: 100%;
      max-width: 260px;
      transform: scale(0.92);
    }

    .no-news {
      text-align: center;
      color: #64748b;
      padding: 48px;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .news-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 768px) {
      .page-header.desktop {
        display: none;
      }

      .page-header.mobile {
        display: block;
      }

      .news-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 24px 16px;
      }

      .content-container {
        padding: 32px 16px 80px;
      }
    }

    @media (max-width: 480px) {
      .news-grid {
        grid-template-columns: 1fr;
      }

      .news-card-wrapper {
        max-width: 100%;
        transform: none;
      }
    }
  `],
})
export class NewsListComponent implements OnInit {
  private readonly newsApi = inject(NewsApiService);
  private readonly router = inject(Router);

  isLoading = signal(true);
  error = signal(false);
  news = signal<News[]>([]);

  ngOnInit(): void {
    this.loadNews();
  }

  private loadNews(): void {
    this.newsApi.getAllNews({ page: 0, size: 100 }).subscribe({
      next: (response) => {
        if (response.status === 200 && response.data?.data) {
          // Only show published news
          const publishedNews = response.data.data.filter((n: News) => n.isDisplay);
          this.news.set(publishedNews);
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
