import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface Review {
  review: string;
  rating: number;
  name: string;
  date: string;
}

const REVIEW_DATA: Review[] = [
  {
    review:
      'Lộ trình học rõ ràng, tập trung đúng mục tiêu IB/AP. Con cải thiện kỹ năng làm bài chỉ sau vài buổi.',
    rating: 5,
    name: 'Phụ huynh bạn Minh',
    date: '2024-01-15',
  },
  {
    review:
      'Giáo viên hướng dẫn rất chiến lược, sửa bài chi tiết. Học nhóm nhỏ nên con được theo sát liên tục.',
    rating: 5,
    name: 'Phụ huynh bạn An',
    date: '2024-01-12',
  },
  {
    review:
      'Nội dung bám sát syllabus Cambridge, luyện đề đúng dạng, giúp con tự tin hơn khi vào kỳ thi.',
    rating: 5,
    name: 'Bạn Khánh (AS Level)',
    date: '2024-01-10',
  },
  {
    review:
      'Tư vấn học thuật rất kỹ, chỉ ra đúng lỗ hổng và đưa kế hoạch học phù hợp. Tiến bộ thấy rõ.',
    rating: 4,
    name: 'Phụ huynh bạn Vy',
    date: '2024-01-08',
  },
  {
    review:
      'Môi trường học nghiêm túc và chất lượng. Con học được tư duy giải bài thay vì học mẹo.',
    rating: 5,
    name: 'Bạn Nam (IBDP)',
    date: '2024-01-05',
  },
  {
    review:
      'Thầy cô theo sát mục tiêu điểm số, feedback nhanh. Mình thấy đúng định vị "premium" của AlgoCore.',
    rating: 5,
    name: 'Bạn Linh (AP)',
    date: '2024-01-03',
  },
  {
    review:
      'Lớp học có cấu trúc rõ ràng: lý thuyết ngắn gọn, luyện tập trọng tâm, chấm chữa theo rubric.',
    rating: 5,
    name: 'Phụ huynh bạn Huy',
    date: '2023-12-28',
  },
  {
    review:
      'Chương trình phù hợp với học sinh cần tăng tốc. Giáo viên hướng dẫn cách học và tự luyện ở nhà.',
    rating: 4,
    name: 'Bạn Trang (IGCSE)',
    date: '2023-12-25',
  },
];

@Component({
  selector: 'app-customer-review-section',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <section class="review-section">
      <h2 class="section-title">Phụ huynh & học sinh tin tưởng AlgoCore</h2>
      <p class="section-subtitle">
        Định hướng học thuật rõ ràng • Nhóm nhỏ tinh gọn • Tập trung kết quả IB, AP & Cambridge
      </p>

      <div class="reviews-container">
        <button class="nav-button prev" (click)="scrollLeft()">
          <mat-icon>chevron_left</mat-icon>
        </button>

        <div class="reviews-scroll" #reviewsScroll>
          @for (review of reviews; track review.name + review.date) {
            <mat-card class="review-card">
              <div class="review-text">
                <span class="quote">"</span>
                {{ review.review }}
                <span class="quote">"</span>
              </div>
              <div class="review-footer">
                <div class="rating">
                  @for (star of getStars(review.rating); track $index) {
                    <mat-icon class="star filled">star</mat-icon>
                  }
                  @for (star of getStars(5 - review.rating); track $index) {
                    <mat-icon class="star">star_border</mat-icon>
                  }
                </div>
                <div class="reviewer-info">
                  <span class="reviewer-name">- {{ review.name }}</span>
                  <span class="review-date">{{ formatDate(review.date) }}</span>
                </div>
              </div>
            </mat-card>
          }
        </div>

        <button class="nav-button next" (click)="scrollRight()">
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>
    </section>
  `,
  styles: [`
    .review-section {
      background: linear-gradient(135deg, var(--color-brand-navy-6) 0%, #0f172a 100%);
      padding: 48px 24px;
      text-align: center;
    }

    .section-title {
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 500;
      color: white;
      margin: 0 0 16px 0;
    }

    .section-subtitle {
      font-size: 1rem;
      color: white;
      margin: 0 0 40px 0;
    }

    .reviews-container {
      display: flex;
      align-items: center;
      gap: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .nav-button {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: none;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .nav-button:hover {
      background: #e2e8f0;
    }

    .nav-button mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .reviews-scroll {
      display: flex;
      gap: 20px;
      overflow-x: auto;
      scroll-behavior: smooth;
      scrollbar-width: none;
      -ms-overflow-style: none;
      padding: 8px 0;
    }

    .reviews-scroll::-webkit-scrollbar {
      display: none;
    }

    .review-card {
      flex: 0 0 300px;
      min-height: 213px;
      padding: 20px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .review-text {
      font-size: 1rem;
      line-height: 1.5;
      color: #374151;
      text-align: left;
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .quote {
      font-size: 1.25rem;
      font-weight: 900;
      line-height: 1;
    }

    .review-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 16px;
    }

    .rating {
      display: flex;
      gap: 2px;
    }

    .star {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #fbbf24;
    }

    .star.filled {
      color: #fbbf24;
    }

    .reviewer-info {
      text-align: right;
    }

    .reviewer-name {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: #374151;
    }

    .review-date {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: #64748b;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .nav-button {
        display: none;
      }

      .review-card {
        flex: 0 0 280px;
      }
    }
  `],
})
export class CustomerReviewSectionComponent {
  reviews = REVIEW_DATA;

  getStars(count: number): number[] {
    return Array(Math.max(0, count)).fill(0);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.toLocaleString('en', { month: 'short' });
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  scrollLeft(): void {
    const container = document.querySelector('.reviews-scroll');
    if (container) {
      container.scrollBy({ left: -320, behavior: 'smooth' });
    }
  }

  scrollRight(): void {
    const container = document.querySelector('.reviews-scroll');
    if (container) {
      container.scrollBy({ left: 320, behavior: 'smooth' });
    }
  }
}
