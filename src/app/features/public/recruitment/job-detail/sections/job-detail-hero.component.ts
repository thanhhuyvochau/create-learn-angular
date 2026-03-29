import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import type { JobPosting } from '../../../../../models/recruitment.model';

@Component({
  selector: 'app-job-detail-hero',
  standalone: true,
  imports: [RouterModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="hero">
      <div class="hero-bg"></div>
      <div class="hero-container">

        <!-- Breadcrumb -->
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a class="breadcrumb-link" routerLink="/recruitment">Tuyển Dụng</a>
          <mat-icon class="breadcrumb-chevron">chevron_right</mat-icon>
          <span class="breadcrumb-current">{{ job().department }}</span>
        </nav>

        <!-- Title -->
        <h1 class="hero-title">{{ job().title }}</h1>

        <!-- Meta row -->
        <div class="hero-meta">
          <div class="meta-item">
            <mat-icon class="meta-icon">school</mat-icon>
            <span>Bộ Phận {{ job().department }}</span>
          </div>
          <div class="meta-item">
            <mat-icon class="meta-icon">place</mat-icon>
            <span>{{ job().location }}</span>
          </div>
          @if (job().type) {
            <div class="meta-item">
              <mat-icon class="meta-icon">schedule</mat-icon>
              <span>{{ job().type }}</span>
            </div>
          }
        </div>

      </div>
    </header>
  `,
  styles: [`
    .hero {
      position: relative;
      padding-top: 128px;
      padding-bottom: 160px;
      overflow: hidden;
    }

    .hero-bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #006b5f 0%, #00a896 100%);
      clip-path: polygon(0 0, 100% 0, 100% 82%, 0% 100%);
      z-index: 0;
    }

    .hero-container {
      position: relative;
      z-index: 1;
      max-width: 1184px;
      margin: 0 auto;
      padding: 0 32px;
    }

    /* Breadcrumb */
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 24px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .breadcrumb-link {
      color: #79f7e3;
      text-decoration: none;
      transition: opacity 0.2s ease;
    }

    .breadcrumb-link:hover {
      opacity: 0.75;
      text-decoration: underline;
    }

    .breadcrumb-chevron {
      font-size: 1rem !important;
      width: 1rem !important;
      height: 1rem !important;
      line-height: 1rem !important;
      color: rgba(255, 255, 255, 0.5);
    }

    .breadcrumb-current {
      color: rgba(255, 255, 255, 0.75);
    }

    /* Title */
    .hero-title {
      font-size: clamp(2.25rem, 5vw, 3.5rem);
      font-weight: 800;
      color: #ffffff;
      line-height: 1.15;
      margin: 0 0 28px;
      max-width: 800px;
    }

    /* Meta row */
    .hero-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
      font-size: 0.95rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .meta-icon {
      font-size: 1.25rem !important;
      width: 1.25rem !important;
      height: 1.25rem !important;
      line-height: 1.25rem !important;
      color: #79f7e3;
    }

    @media (max-width: 560px) {
      .hero {
        padding-top: 100px;
        padding-bottom: 120px;
      }

      .hero-container {
        padding: 0 20px;
      }

      .hero-meta {
        gap: 16px;
      }
    }
  `],
})
export class JobDetailHeroComponent {
  readonly job = input.required<JobPosting>();
}
