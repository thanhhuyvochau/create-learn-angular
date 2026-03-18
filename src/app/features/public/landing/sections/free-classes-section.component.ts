import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ClassCardComponent } from '../../../../shared/components/class-card/class-card.component';
import { ClassApiService } from '../../../../core/api';
import type { ApiListResponse } from '../../../../models';
import type { Class } from '../../../../models';

@Component({
  selector: 'app-free-classes-section',
  standalone: true,
  imports: [ClassCardComponent],
  template: `
    <section class="free-classes-section" id="free-classes-section">
      <div class="section-container">
        <!-- Top Row: Text + 2 Cards (desktop only) -->
        <div class="top-row">
          <div class="text-content">
            <h2 class="section-title">Bắt Đầu Với</h2>
            <h2 class="section-title">Lớp Học Thử Miễn Phí</h2>
            <p class="section-description">
              Trải nghiệm phương pháp giảng dạy chuẩn quốc tế tại AlgoCore.
              Học theo nhóm nhỏ, định hướng rõ mục tiêu IB, AP & Cambridge,
              tập trung tư duy học thuật và chiến lược nâng cao điểm số.
            </p>
          </div>
          <div class="top-cards">
            @for (classItem of topClasses(); track classItem.id) {
              <div class="card-wrapper">
                <app-class-card
                  [imageUrl]="classItem.image || 'https://picsum.photos/400/200'"
                  [title]="classItem.brief || classItem.name || 'Class'"
                  [description]="classItem.brief || ''"
                  [buttonText]="'Học miễn phí'"
                  (cardClick)="navigateToClass(classItem.id)"
                />
              </div>
            }
          </div>
        </div>

        <!-- Bottom Grid: 4-6 Cards -->
        <div class="bottom-grid">
          @for (classItem of displayClasses(); track classItem.id; let i = $index) {
            <div class="card-wrapper" [class.hide-desktop]="i < 2">
              <app-class-card
                [imageUrl]="classItem.image || 'https://picsum.photos/400/200'"
                [title]="classItem.brief || classItem.name || 'Class'"
                [description]="classItem.brief || ''"
                [buttonText]="'Nhận miễn phí'"
                (cardClick)="navigateToClass(classItem.id)"
              />
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .free-classes-section {
      background: linear-gradient(135deg, var(--color-brand-navy-6) 0%, #0f172a 100%);
      padding: 48px 24px;
    }

    .section-container {
      max-width: 1152px;
      margin: 0 auto;
    }

    .top-row {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }

    .text-content {
      flex: 1;
      padding-right: 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .section-title {
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 600;
      color: white;
      margin: 0;
      line-height: 1.2;
    }

    .section-description {
      font-size: 1.25rem;
      color: white;
      line-height: 1.6;
      margin: 20px 0 0 0;
    }

    .top-cards {
      flex: 1;
      display: flex;
      gap: 20px;
      justify-content: center;
    }

    .top-cards .card-wrapper {
      flex: 1;
      max-width: calc(50% - 10px);
    }

    .bottom-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      justify-content: center;
    }

    .bottom-grid .card-wrapper {
      flex: 0 0 calc(25% - 15px);
      max-width: calc(25% - 15px);
    }

    .hide-desktop {
      display: none;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .top-row {
        flex-direction: column;
      }

      .text-content {
        padding-right: 0;
        text-align: center;
      }

      .top-cards {
        display: none;
      }

      .bottom-grid .card-wrapper {
        flex: 0 0 calc(50% - 10px);
        max-width: calc(50% - 10px);
      }

      .hide-desktop {
        display: block;
      }
    }

    @media (max-width: 600px) {
      .bottom-grid .card-wrapper {
        flex: 0 0 calc(50% - 4px);
        max-width: calc(50% - 4px);
      }
    }
  `],
})
export class FreeClassesSectionComponent implements OnInit {
  private readonly classApi = inject(ClassApiService);
  private readonly router = inject(Router);

  classes = signal<Class[]>([]);

  topClasses = signal<Class[]>([]);
  displayClasses = signal<Class[]>([]);

  ngOnInit(): void {
    this.loadClasses();
  }

  private loadClasses(): void {
    this.classApi.getAll({ page: 0, size: 100 }).subscribe({
      next: (response: ApiListResponse<Class>) => {
        if (response.status === 200 && response.data?.data) {
          const allClasses = response.data.data;
          this.classes.set(allClasses);
          this.topClasses.set(allClasses.slice(0, 2));
          this.displayClasses.set(allClasses.slice(0, 6));
        }
      },
      error: (err: Error) => console.error('Failed to load classes:', err),
    });
  }

  navigateToClass(classId: number): void {
    this.router.navigate(['/class', classId]);
  }
}
