import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ClassCardComponent } from '../../../../shared/components/class-card/class-card.component';
import { ClassApiService } from '../../../../core/api';
import type { ApiListResponse, Class } from '../../../../models';

interface DemoClass {
  id: string;
  image: string;
  brief: string;
  name?: string;
}

const DEMO_CLASSES: DemoClass[] = [
  {
    id: 'demo-ibdp',
    image: 'assets/images/Demo-mode.png',
    brief: 'IBDP (SL/HL) - Lo trinh aim 6-7, luyen IA + past papers.',
  },
  {
    id: 'demo-ap',
    image: 'assets/images/Demo-mode.png',
    brief: 'AP - On sat syllabus, chien luoc lam MCQ/FRQ de aim 4-5.',
  },
  {
    id: 'demo-alevel',
    image: 'assets/images/Demo-mode.png',
    brief: 'AS & A Level - Cung co nen tang + luyen de theo command terms.',
  },
  {
    id: 'demo-igcse',
    image: 'assets/images/Demo-mode.png',
    brief: 'IGCSE - Hoc chac core concepts, tang toc bang exam-style practice.',
  },
];

const MAX_ITEMS = 8;

@Component({
  selector: 'app-popular-class-section',
  standalone: true,
  imports: [MatProgressSpinnerModule, ClassCardComponent],
  template: `
    <section class="popular-class-section">
      <h2 class="section-title">Lop Hoc Mui Nhon Tai AlgoCore</h2>
      <p class="section-subtitle">
        Nhung chuong trinh duoc dau tu chuyen sau, hoc theo nhom nho tinh gon,
        dinh huong chien luoc va ca nhan hoa lo trinh de dat thanh tich cao trong cac ky thi quoc te.
      </p>

      @if (useDemo()) {
        <p class="demo-notice">(Demo data - UI test)</p>
      }

      @if (!useDemo() && isLoading()) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      } @else {
        @if (displayClasses().length > 0) {
          <div class="class-grid">
            @for (classItem of displayClasses(); track classItem.id) {
              <app-class-card
                [imageUrl]="classItem.image || 'assets/images/Demo-mode.png'"
                [title]="classItem.brief || classItem.name || 'Class'"
                [description]="classItem.brief || ''"
                [buttonText]="'Learn More'"
                (cardClick)="navigateToClass(classItem.id)"
              />
            }
          </div>
        } @else {
          <p class="no-classes">No classes found. Please try again later.</p>
        }
      }
    </section>
  `,
  styles: [`
    .popular-class-section {
      padding: 48px 24px;
      text-align: center;
      background: #f9fafb;
    }

    .section-title {
      font-size: clamp(1.5rem, 3vw, 2.25rem);
      font-weight: 600;
      color: #1a365d;
      margin: 0 0 16px 0;
    }

    .section-subtitle {
      font-size: 1rem;
      color: rgba(0, 0, 0, 0.6);
      max-width: 800px;
      margin: 0 auto 24px;
      line-height: 1.5;
    }

    .demo-notice {
      font-size: 0.9rem;
      color: #64748b;
      margin: 0 0 24px 0;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px 0;
    }

    .class-grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 40px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .class-grid app-class-card {
      flex: 0 0 260px;
      max-width: 260px;
    }

    .no-classes {
      color: #dc2626;
      padding: 24px;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .class-grid {
        gap: 20px;
      }

      .class-grid app-class-card {
        flex: 0 0 calc(50% - 10px);
        max-width: calc(50% - 10px);
      }
    }
  `],
})
export class PopularClassSectionComponent implements OnInit {
  private readonly classApi = inject(ClassApiService);
  private readonly router = inject(Router);

  isLoading = signal(true);
  useDemo = signal(true);
  displayClasses = signal<(Class | DemoClass)[]>(DEMO_CLASSES);

  ngOnInit(): void {
    this.loadClasses();
  }

  private loadClasses(): void {
    this.classApi.getAll({ page: 0, size: 100 }).subscribe({
      next: (response: ApiListResponse<Class>) => {
        if (response.status === 200 && response.data?.data?.length > 0) {
          this.displayClasses.set(response.data.data.slice(0, MAX_ITEMS));
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

  navigateToClass(classId: string | number): void {
    this.router.navigate(['/class', classId]);
  }
}
