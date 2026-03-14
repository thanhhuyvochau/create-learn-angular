import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { ClassCardComponent } from '../../../shared/components/class-card/class-card.component';
import { ClassApiService } from '../../../core/api';
import type { ApiListResponse, Class } from '../../../models';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-class-list',
  standalone: true,
  imports: [MatProgressSpinnerModule, MatPaginatorModule, ClassCardComponent],
  template: `
    <div class="class-list-page">
      <!-- Header Banner -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="header-title">AlgoCore: Bệ phóng cho tài năng quốc tế.</h1>
          <p class="header-description">
            Cùng AlgoCore chinh phục các chứng chỉ quốc tế: IGCSE, AS/A Level,
            IBDP, AP với mô hình lớp 1-1 hoặc nhóm nhỏ.
          </p>
        </div>
      </div>

      <!-- Class Grid -->
      <div class="content-container">
        @if (isLoading()) {
          <div class="loading-container">
            <mat-spinner diameter="48"></mat-spinner>
          </div>
        } @else if (error()) {
          <div class="error-container">
            <p>
              Có lỗi xảy ra trong quá trình xử lý. Bạn vui lòng thử lại nhé.
            </p>
          </div>
        } @else {
          <div class="class-grid">
            @for (classItem of classes(); track classItem.id) {
              <app-class-card
                [imageUrl]="classItem.image || 'https://picsum.photos/400/200'"
                [title]="classItem.brief || classItem.name || 'Class'"
                [description]="classItem.brief || ''"
                [buttonText]="'Xem chi tiet'"
                (cardClick)="navigateToClass(classItem.id)"
              />
            }
          </div>

          @if (classes().length === 0) {
            <p class="no-classes">Chua co lop hoc nao.</p>
          }

          <!-- Pagination -->
          @if (totalElements() > 0) {
            <mat-paginator
              [length]="totalElements()"
              [pageSize]="pageSize"
              [pageIndex]="pageIndex()"
              [pageSizeOptions]="[10, 20, 50]"
              (page)="onPageChange($event)"
              showFirstLastButtons
              aria-label="Select page"
            />
          }
        }
      </div>
    </div>
  `,
  styles: [
    `
      .class-list-page {
        min-height: 100vh;
      }

      .page-header {
        background: linear-gradient(
          135deg,
          rgba(26, 54, 93, 0.9) 0%,
          rgba(15, 23, 42, 0.9) 100%
        );
        padding: 80px 24px;
        text-align: center;
      }

      .header-content {
        max-width: 800px;
        margin: 0 auto;
      }

      .header-title {
        font-size: clamp(1.75rem, 4vw, 2.5rem);
        font-weight: 600;
        color: white;
        margin: 0 0 16px 0;
      }

      .header-description {
        font-size: 1.125rem;
        color: #e2e8f0;
        line-height: 1.6;
        margin: 0;
      }

      .content-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 56px 24px;
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

      .class-grid {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 56px;
        margin-bottom: 48px;
      }

      .class-grid app-class-card {
        flex: 0 0 260px;
        max-width: 260px;
      }

      .no-classes {
        text-align: center;
        color: #64748b;
        padding: 48px;
      }

      mat-paginator {
        background: transparent;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .page-header {
          padding: 48px 16px;
        }

        .content-container {
          padding: 32px 16px;
        }

        .class-grid {
          gap: 24px;
        }

        .class-grid app-class-card {
          flex: 0 0 calc(50% - 12px);
          max-width: calc(50% - 12px);
        }
      }
    `,
  ],
})
export class ClassListComponent implements OnInit {
  private readonly classApi = inject(ClassApiService);
  private readonly router = inject(Router);

  isLoading = signal(true);
  error = signal(false);
  classes = signal<Class[]>([]);
  totalElements = signal(0);
  pageIndex = signal(0);
  pageSize = PAGE_SIZE;

  ngOnInit(): void {
    this.loadClasses();
  }

  private loadClasses(): void {
    this.isLoading.set(true);
    this.error.set(false);

    this.classApi
      .getAll({ page: this.pageIndex(), size: this.pageSize })
      .subscribe({
        next: (response) => {
          if (response.status === 200 && response.data) {
            this.classes.set(response.data.data || []);
            this.totalElements.set(response.data.totalElements || 0);
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.isLoading.set(false);
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize = event.pageSize;
    this.loadClasses();
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navigateToClass(classId: number): void {
    this.router.navigate(['/class', classId]);
  }
}
