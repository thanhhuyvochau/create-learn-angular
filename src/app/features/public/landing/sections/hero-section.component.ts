import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

const HERO_CONTENT = {
  mainTitle: 'Chinh Phục Chương Trình',
  subtitlePrefix: 'Quốc Tế Cùng',
  brandName: 'AlgoCore',
  description:
    'Đồng hành cùng học sinh IGCSE, AS/A Level, IB và AP với lộ trình cá nhân hóa, tập trung tối đa vào điểm số và chiến lược thi.',
  ctaText: 'Đăng ký tư vấn ngay',
} as const;

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <section class="hero">
      <!-- Desktop Hero -->
      <div class="hero-desktop">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">{{ content.mainTitle }}</h1>
            <h2 class="hero-subtitle">
              {{ content.subtitlePrefix }}
              <span class="brand-highlight">{{ content.brandName }}</span>
            </h2>
            <p class="hero-description">{{ content.description }}</p>
            <button
              mat-raised-button
              color="primary"
              class="cta-button"
              (click)="scrollToFreeClasses()"
            >
              {{ content.ctaText }}
            </button>
          </div>
        </div>
        <div class="hero-image">
          <img
            src="/images/class-banner.png"
            alt="Kids learning coding"
            loading="eager"
          />
        </div>
      </div>

      <!-- Mobile Hero -->
      <div class="hero-mobile">
        <div class="mobile-overlay"></div>
        <div class="mobile-content">
          <h1 class="mobile-title">{{ content.mainTitle }}</h1>
          <h2 class="mobile-subtitle">
            {{ content.subtitlePrefix }}
            <span class="brand-highlight">{{ content.brandName }}</span>
          </h2>
          <p class="mobile-description">{{ content.description }}</p>
          <button
            mat-raised-button
            color="primary"
            class="cta-button"
            (click)="scrollToFreeClasses()"
          >
            {{ content.ctaText }}
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .hero {
        width: 100%;
        background:var(--gradient-brand)
      }

      /* Desktop Hero */
      .hero-desktop {
        display: flex;
        min-height: 540px;
      }

      .hero-content {
        flex: 0 0 42%;
        display: flex;
        align-items: center;
        padding-left: 10%;
      }

      .hero-text {
        max-width: 500px;
      }

      .hero-title {
        font-size: clamp(2rem, 4vw, 3rem);
        font-weight: 700;
        color: var(--color-brand-navy-6);
        margin: 0 0 8px 0;
        line-height: 1.2;
      }

      .hero-subtitle {
        font-size: clamp(1.5rem, 3vw, 2rem);
        font-weight: 600;
        color: var(--color-brand-navy-6);
        margin: 0 0 24px 0;
      }

      .brand-highlight {
        color: var(--color-brand-teal-6);
        font-weight: 800;
      }

      .hero-description {
        font-size: 1rem;
        color: #64748b;
        line-height: 1.6;
        margin: 0 0 32px 0;
      }

      .cta-button {
        padding: 12px 32px;
        font-size: 1rem;
        font-weight: 500;
        border-radius: 8px;
      }

      .hero-image {
        flex: 0 0 58%;
        position: relative;
        overflow: hidden;
      }

      .hero-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        clip-path: polygon(20% 0, 100% 0, 100% 100%, 0% 100%);
      }

      /* Mobile Hero */
      .hero-mobile {
        display: none;
        position: relative;
        min-height: 540px;
        background: linear-gradient(
          135deg,
          rgba(26, 54, 93, 0.9) 0%,
          rgba(15, 23, 42, 0.9) 100%
        );
      }

      .mobile-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.55);
      }

      .mobile-content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        min-height: 540px;
        text-align: center;
      }

      .mobile-title {
        font-size: 2.5rem;
        font-weight: 700;
        color: white;
        margin: 0 0 8px 0;
      }

      .mobile-subtitle {
        font-size: 1.75rem;
        font-weight: 600;
        color: white;
        margin: 0 0 20px 0;
      }

      .mobile-description {
        font-size: 1.125rem;
        color: #f1f5f9;
        line-height: 1.5;
        margin: 0 0 24px 0;
        max-width: 400px;
      }

      /* Experts Bar */
      .experts-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 24px;
        padding: 24px;
        background: white;
        border-top: 1px solid #e2e8f0;
      }

      .experts-text {
        font-size: 0.875rem;
        color: #64748b;
      }

      .expert-logos {
        display: flex;
        gap: 16px;
        align-items: center;
      }

      .expert-logo {
        height: 40px;
        width: auto;
        opacity: 0.7;
        transition: opacity 0.2s;
      }

      .expert-logo:hover {
        opacity: 1;
      }

      /* Responsive */
      @media (max-width: 900px) {
        .hero-desktop {
          display: none;
        }

        .hero-mobile {
          display: block;
        }

        .experts-bar {
          flex-direction: column;
          gap: 16px;
        }
      }
    `,
  ],
})
export class HeroSectionComponent {
  content = HERO_CONTENT;

  scrollToFreeClasses(): void {
    const element = document.getElementById('free-classes-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
