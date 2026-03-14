import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SubjectApiService } from '../../../../core/api';
import type { Subject } from '../../../../models';

interface SubjectCardData {
  id: number;
  name: string;
  imageSrc: string;
}

const PLACEHOLDER_ICON = '/images/Demo-mode.png';

const DEMO_SUBJECT_CARDS: SubjectCardData[] = [
  { id: 1, name: 'IBDP', imageSrc: PLACEHOLDER_ICON },
  { id: 2, name: 'AP', imageSrc: PLACEHOLDER_ICON },
  { id: 3, name: 'AS/A Level', imageSrc: PLACEHOLDER_ICON },
  { id: 4, name: 'IGCSE', imageSrc: PLACEHOLDER_ICON },
];

@Component({
  selector: 'app-popular-subject-section',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatProgressSpinnerModule],
  template: `
    <section class="subject-section">
      <h2 class="section-title">Chương Trình Học Thuật Quốc Tế Nổi Bật</h2>

      @if (useDemo()) {
        <p class="demo-notice">(Dữ liệu mẫu - Test UI)</p>
      }

      <div class="subject-grid">
        @if (!useDemo() && isLoading()) {
          <mat-spinner diameter="48"></mat-spinner>
        } @else {
          @for (subject of subjects(); track subject.id) {
            <a [routerLink]="['/class/subject', subject.id]" class="subject-card-link">
              <mat-card class="subject-card">
                <div class="subject-icon">
                  <img [src]="subject.imageSrc" [alt]="subject.name" />
                </div>
                <h3 class="subject-name">{{ subject.name }}</h3>
              </mat-card>
            </a>
          }
        }
      </div>
    </section>
  `,
  styles: [`
    .subject-section {
      padding: 48px 24px;
      text-align: center;
    }

    .section-title {
      font-size: clamp(1.75rem, 4vw, 3rem);
      font-weight: 600;
      color: #0d9488;
      margin: 0 0 16px 0;
    }

    .demo-notice {
      font-size: 0.9rem;
      color: #64748b;
      margin: 0 0 32px 0;
    }

    .subject-grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 30px;
      max-width: 1352px;
      margin: 48px auto 0;
    }

    .subject-card-link {
      text-decoration: none;
    }

    .subject-card {
      width: 280px;
      padding: 32px;
      border-radius: 16px;
      text-align: center;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .subject-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }

    .subject-icon {
      width: 120px;
      height: 120px;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .subject-icon img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .subject-name {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1a365d;
      margin: 0;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .subject-card {
        width: 140px;
        padding: 20px;
      }

      .subject-icon {
        width: 80px;
        height: 80px;
      }

      .subject-name {
        font-size: 1rem;
      }
    }
  `],
})
export class PopularSubjectSectionComponent implements OnInit {
  private readonly subjectApi = inject(SubjectApiService);

  subjects = signal<SubjectCardData[]>(DEMO_SUBJECT_CARDS);
  isLoading = signal(true);
  useDemo = signal(true);

  ngOnInit(): void {
    this.loadSubjects();
  }

  private loadSubjects(): void {
    this.subjectApi.getAll({ page: 0, size: 100 }).subscribe({
      next: (response) => {
        if (response.status === 200 && response.data?.data?.length > 0) {
          const cards = response.data.data.map((s: Subject) => ({
            id: s.id,
            name: s.name,
            imageSrc: s.iconBase64
              ? `data:image/png;base64,${s.iconBase64}`
              : PLACEHOLDER_ICON,
          }));
          this.subjects.set(cards);
          this.useDemo.set(false);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        // Keep demo data on error
      },
    });
  }
}
