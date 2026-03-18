import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

interface FeatureCard {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const FEATURE_CARDS_DATA: FeatureCard[] = [
  {
    id: 'academic-excellence',
    icon: '/images/react-icon.webp',
    title: 'Giáo dục\nhàng đầu',
    description:
      'Lộ trình quốc tế chuẩn hóa, được cập nhật liên tục. Tập trung đúng trọng tâm để tối ưu điểm số.',
  },
  {
    id: 'small-group',
    icon: '/images/people-icon.webp',
    title: 'Lớp học\nquy mô nhỏ',
    description:
      'Tối đa 3-5 học sinh/lớp để tăng tương tác. Theo sát tiến độ và phản hồi chi tiết từng buổi.',
  },
  {
    id: 'expert-teachers',
    icon: '/images/ideal-icon.webp',
    title: 'Giáo viên\ngiàu kinh nghiệm',
    description:
      'Giáo viên được tuyển chọn kỹ và đào tạo bài bản. Kinh nghiệm luyện thi IB/AP/IGCSE/A Level thực chiến.',
  },
  {
    id: 'result-oriented',
    icon: '/images/certificate.png',
    title: 'Cam kết\nđầu ra',
    description:
      'Cá nhân hóa theo mục tiêu và timeline của học viên. Chưa đạt mục tiêu sẽ được hỗ trợ bổ sung đến khi đạt.',
  },
];

@Component({
  selector: 'app-feature-card-section',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <section class="feature-section">
      <div class="feature-container">
        @for (card of featureCards; track card.id) {
          <div class="feature-card-wrapper">
            <mat-card class="feature-card">
              <div class="icon-container">
                <img [src]="card.icon" [alt]="card.title" class="feature-icon" />
              </div>
              <mat-card-content>
                <h3 class="feature-title">{{ card.title }}</h3>
                <p class="feature-description">{{ card.description }}</p>
              </mat-card-content>
            </mat-card>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .feature-section {
      background: linear-gradient(135deg, var(--color-brand-navy-6) 0%, #0f172a 100%);
      padding: 100px 24px 62px;
    }

    .feature-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 60px 30px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .feature-card-wrapper {
      position: relative;
      padding-top: 48px;
    }

    .feature-card {
      position: relative;
      width: 252px;
      height: 276px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 68px 20px 48px;
    }

    .icon-container {
      position: absolute;
      top: -48px;
      left: 50%;
      transform: translateX(-50%);
      width: 96px;
      height: 96px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .feature-icon {
      width: 72px;
      height: auto;
    }

    .feature-title {
      font-size: 1.35rem;
      font-weight: 600;
      color: var(--color-brand-teal-6);
      margin: 0 0 16px 0;
      white-space: pre-line;
      line-height: 1.3;
    }

    .feature-description {
      font-size: 0.875rem;
      font-weight: 500;
      color: #64748b;
      line-height: 1.5;
      margin: 0;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .feature-card-wrapper {
        width: 80%;
      }

      .feature-card {
        width: 100%;
      }
    }
  `],
})
export class FeatureCardSectionComponent {
  featureCards = FEATURE_CARDS_DATA;
}
