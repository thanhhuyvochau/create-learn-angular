import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-recruitment-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <section class="hero">
      <!-- Background image with diagonal mask -->
      <div class="hero-bg">
        <img
          class="hero-bg-img"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPEyK4gUc4gSquNuuOHtpTiuzpQ3xB2YsamwdHGp60ImBuGjHqN6ayvJvcaThPk4R2rFTuXJxXU6UTxDoMiHo3FfWXZfDuLvW9zvfgfZImoA48kVjnT9_M_h35r2R3U-KUyIdKAQWRgzNV5UoDUU7v8Q0hPYKigezdcA5lne3568OuwUEswesJZ_2505p3izSeX-9UazeFJnAWcI-_qwxGoBOb7-6MtNYjYk2YeOIC0VPfN4maF161mBkFXOcCdQA8Q_Vjh8aN3KU"
          alt="Modern educational environment with diverse professionals collaborating"
          loading="eager"
        />
        <div class="hero-gradient"></div>
      </div>

      <!-- Content -->
      <div class="hero-content">
        <div class="hero-inner">
          <span class="hero-eyebrow">Cơ Hội Nghề Nghiệp</span>
          <h1 class="hero-title">
            Gia Nhập Sứ Mệnh
            <span class="hero-title-accent">Chuyển Hóa</span>
            Giáo Dục
          </h1>
          <p class="hero-description">
            Hãy cùng chúng tôi xây dựng tương lai của tư duy thuật toán. Chúng tôi đang tìm kiếm
            những nhà giáo dục, nhà sáng tạo và nhà tư duy đam mê để tái định nghĩa
            trải nghiệm lớp học.
          </p>
          <div class="hero-actions">
            <a class="btn-primary" href="#openings">Khám Phá Vị Trí</a>
            <a class="btn-ghost" href="#">
              Văn Hóa Của Chúng Tôi
              <mat-icon class="btn-ghost-icon">arrow_forward</mat-icon>
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      position: relative;
      min-height: 600px;
      display: flex;
      align-items: center;
      overflow: hidden;
      background: var(--color-brand-navy-8);
    }

    /* Background */
    .hero-bg {
      position: absolute;
      inset: 0;
      z-index: 0;
    }

    .hero-bg-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.9;
      clip-path: polygon(0 0, 100% 0, 100% 85%, 0% 100%);
    }

    .hero-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to right,
        rgba(0, 27, 61, 0.92) 0%,
        rgba(0, 27, 61, 0.6) 55%,
        transparent 100%
      );
    }

    /* Content */
    .hero-content {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 1184px;
      margin: 0 auto;
      padding: 80px 32px;
    }

    .hero-inner {
      max-width: 620px;
    }

    .hero-eyebrow {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 9999px;
      background: var(--color-brand-teal-6);
      color: #fff;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 24px;
    }

    .hero-title {
      font-size: clamp(2.5rem, 6vw, 4.25rem);
      font-weight: 800;
      color: #ffffff;
      line-height: 1.1;
      margin: 0 0 28px 0;
    }

    .hero-title-accent {
      color: var(--color-brand-teal-4);
    }

    .hero-description {
      font-size: clamp(1rem, 1.5vw, 1.2rem);
      color: #e2e8f0;
      line-height: 1.7;
      margin: 0 0 40px 0;
      font-weight: 300;
      opacity: 0.92;
    }

    /* Actions */
    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
    }

    .btn-primary {
      display: inline-block;
      padding: 16px 32px;
      border-radius: 9999px;
      background: linear-gradient(135deg, var(--color-brand-teal-6) 0%, var(--color-brand-teal-5) 100%);
      color: #ffffff;
      font-weight: 700;
      font-size: 0.95rem;
      text-decoration: none;
      box-shadow: 0 4px 24px rgba(0, 168, 150, 0.3);
      transition: box-shadow 0.2s ease, transform 0.15s ease;
    }

    .btn-primary:hover {
      box-shadow: 0 8px 32px rgba(0, 168, 150, 0.5);
      transform: translateY(-1px);
    }

    .btn-ghost {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 16px 32px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #ffffff;
      font-weight: 700;
      font-size: 0.95rem;
      text-decoration: none;
      transition: background 0.2s ease;
    }

    .btn-ghost:hover {
      background: rgba(255, 255, 255, 0.18);
    }

    .btn-ghost-icon {
      font-size: 1rem !important;
      width: 1rem !important;
      height: 1rem !important;
      line-height: 1 !important;
      vertical-align: middle;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .hero-content {
        padding: 64px 20px;
      }

      .hero-inner {
        max-width: 100%;
      }

      .hero-actions {
        flex-direction: column;
        align-items: flex-start;
      }

      .btn-primary,
      .btn-ghost {
        width: 100%;
        justify-content: center;
      }
    }
  `],
})
export class RecruitmentHeroComponent {}
