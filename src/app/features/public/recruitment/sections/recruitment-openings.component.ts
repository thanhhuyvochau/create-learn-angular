import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { RecruitmentApiService } from '../../../../core/api/recruitment-api.service';
import type {
  JobDepartment,
  JobLocation,
  JobPosting,
} from '../../../../models/recruitment.model';
import { JobCardComponent } from './job-card.component';

const DEPARTMENTS: JobDepartment[] = [
  'All Departments',
  'Mathematics',
  'Coding',
  'Admissions',
];

const LOCATIONS: JobLocation[] = [
  'All Locations',
  'Remote',
  'San Francisco',
  'London',
];

const PAGE_SIZE = 10;

@Component({
  selector: 'app-recruitment-openings',
  standalone: true,
  imports: [FormsModule, JobCardComponent, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="openings-section" id="openings">
      <div class="openings-container">

        <!-- Section header -->
        <div class="openings-header">
          <div class="openings-header-text">
            <h2 class="openings-title">Current Openings</h2>
            <p class="openings-subtitle">Find your next challenge in one of our core departments.</p>
          </div>

          <!-- Filters -->
          <div class="openings-filters">
            <select
              class="filter-select"
              [(ngModel)]="selectedDepartment"
              (ngModelChange)="onFilterChange()"
              aria-label="Filter by department"
            >
              @for (dept of departments; track dept) {
                <option [value]="dept">{{ dept }}</option>
              }
            </select>

            <select
              class="filter-select"
              [(ngModel)]="selectedLocation"
              (ngModelChange)="onFilterChange()"
              aria-label="Filter by location"
            >
              @for (loc of locations; track loc) {
                <option [value]="loc">{{ loc }}</option>
              }
            </select>
          </div>
        </div>

        <!-- Loading state -->
        @if (isLoading()) {
          <div class="openings-loading">
            <div class="spinner"></div>
          </div>
        }

        <!-- Error state -->
        @if (!isLoading() && error()) {
          <div class="openings-error">
            <mat-icon class="error-icon">error_outline</mat-icon>
            <p>Failed to load job postings. Please try again later.</p>
          </div>
        }

        <!-- Jobs grid + pagination -->
        @if (!isLoading() && !error()) {

          <!-- Empty: no jobs exist at all -->
          @if (allJobs().length === 0) {
            <div class="openings-empty">
              <mat-icon class="empty-icon">work_off</mat-icon>
              <p class="empty-title">No current job openings at this time.</p>
              <p class="empty-sub">Please check back later — we're always growing.</p>
            </div>
          }

          <!-- Empty: jobs exist but filters match nothing -->
          @if (allJobs().length > 0 && filteredJobs().length === 0) {
            <div class="openings-empty">
              <mat-icon class="empty-icon">find_in_page</mat-icon>
              <p class="empty-title">No openings match the selected filters.</p>
              <p class="empty-sub">Try adjusting the department or location filter.</p>
            </div>
          }

          <!-- Jobs grid -->
          @if (pagedJobs().length > 0) {
            <div class="jobs-grid">
              @for (job of pagedJobs(); track job.id) {
                <app-job-card [job]="job" />
              }
            </div>

            <!-- Pagination -->
            @if (totalPages() > 1) {
              <nav class="pagination" aria-label="Job listings pagination">
                <!-- Previous -->
                <button
                  class="page-btn page-btn--nav"
                  [class.page-btn--disabled]="currentPage() === 1"
                  [disabled]="currentPage() === 1"
                  (click)="goToPage(currentPage() - 1)"
                  aria-label="Previous page"
                >
                  <mat-icon class="nav-icon">chevron_left</mat-icon>
                </button>

                <!-- Page numbers -->
                @for (page of pageNumbers(); track page) {
                  @if (page === -1) {
                    <span class="page-ellipsis" aria-hidden="true">…</span>
                  } @else {
                    <button
                      class="page-btn"
                      [class.page-btn--active]="page === currentPage()"
                      [attr.aria-current]="page === currentPage() ? 'page' : null"
                      [attr.aria-label]="'Page ' + page"
                      (click)="goToPage(page)"
                    >
                      {{ page }}
                    </button>
                  }
                }

                <!-- Next -->
                <button
                  class="page-btn page-btn--nav"
                  [class.page-btn--disabled]="currentPage() === totalPages()"
                  [disabled]="currentPage() === totalPages()"
                  (click)="goToPage(currentPage() + 1)"
                  aria-label="Next page"
                >
                  <mat-icon class="nav-icon">chevron_right</mat-icon>
                </button>
              </nav>

              <!-- Page summary -->
              <p class="pagination-summary" aria-live="polite">
                Showing {{ pageStart() }}–{{ pageEnd() }} of {{ filteredJobs().length }} openings
              </p>
            }
          }
        }

      </div>
    </section>
  `,
  styles: [`
    .openings-section {
      padding: 96px 0;
      background: var(--color-surface-1, #f3f4f5);
    }

    .openings-container {
      max-width: 1184px;
      margin: 0 auto;
      padding: 0 32px;
    }

    /* ── Section header ──────────────────────────────── */
    .openings-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 56px;
      gap: 24px;
      flex-wrap: wrap;
    }

    .openings-title {
      font-size: clamp(1.75rem, 3vw, 2.25rem);
      font-weight: 700;
      color: var(--color-brand-navy-6);
      margin: 0 0 8px 0;
    }

    .openings-subtitle {
      color: var(--color-slate-5);
      font-size: 1rem;
      margin: 0;
    }

    /* ── Filters ─────────────────────────────────────── */
    .openings-filters {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .filter-select {
      appearance: none;
      -webkit-appearance: none;
      background: #ffffff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236c7a76' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right 16px center;
      border: none;
      border-radius: 9999px;
      padding: 8px 40px 8px 20px;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-brand-navy-6);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(108, 122, 118, 0.15);
      cursor: pointer;
      min-width: 160px;
      transition: box-shadow 0.2s ease;
    }

    .filter-select:focus {
      outline: none;
      box-shadow: 0 0 0 2px var(--color-brand-teal-6);
    }

    /* ── Jobs grid ───────────────────────────────────── */
    .jobs-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      column-gap: 28px;
      row-gap: 24px;     /* explicit row spacing — 24px between rows */
    }

    /* ── Loading ─────────────────────────────────────── */
    .openings-loading {
      display: flex;
      justify-content: center;
      padding: 64px 0;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--color-surface-2, #e7e8e9);
      border-top-color: var(--color-brand-teal-6);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ── Error ───────────────────────────────────────── */
    .openings-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 64px 0;
      color: var(--color-error-6, #c62828);
      gap: 12px;
    }

    .error-icon {
      font-size: 2.5rem !important;
      width: 2.5rem !important;
      height: 2.5rem !important;
      line-height: 2.5rem !important;
    }

    /* ── Empty state ─────────────────────────────────── */
    .openings-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 80px 0;
      gap: 12px;
      text-align: center;
    }

    .empty-icon {
      font-size: 3rem !important;
      width: 3rem !important;
      height: 3rem !important;
      line-height: 3rem !important;
      color: var(--color-slate-4, #94a3b8);
      margin-bottom: 4px;
    }

    .empty-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-brand-navy-6);
      margin: 0;
    }

    .empty-sub {
      font-size: 0.95rem;
      color: var(--color-slate-5);
      margin: 0;
    }

    /* ── Pagination ──────────────────────────────────── */
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: 48px;
      flex-wrap: wrap;
    }

    .page-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 40px;
      height: 40px;
      padding: 0 6px;
      border-radius: 8px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--color-brand-navy-6);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
      font-family: inherit;
    }

    .page-btn:hover:not(:disabled):not(.page-btn--active) {
      background: #ffffff;
      border-color: var(--color-slate-3, #cbd5e1);
    }

    .page-btn--active {
      background: var(--color-brand-teal-6);
      color: #ffffff;
      border-color: var(--color-brand-teal-6);
      font-weight: 700;
      pointer-events: none;
    }

    .page-btn--nav {
      color: var(--color-brand-navy-6);
    }

    .page-btn--disabled,
    .page-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .nav-icon {
      font-size: 1.25rem !important;
      width: 1.25rem !important;
      height: 1.25rem !important;
      line-height: 1.25rem !important;
    }

    .page-ellipsis {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 40px;
      height: 40px;
      color: var(--color-slate-5);
      font-size: 0.875rem;
      user-select: none;
    }

    .pagination-summary {
      text-align: center;
      font-size: 0.8rem;
      color: var(--color-slate-5);
      margin: 12px 0 0;
    }

    /* ── Responsive ──────────────────────────────────── */
    @media (max-width: 1024px) {
      .jobs-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .openings-header {
        flex-direction: column;
        align-items: flex-start;
        margin-bottom: 36px;
      }

      .openings-filters {
        width: 100%;
      }

      .filter-select {
        flex: 1;
        min-width: 0;
      }

      .pagination {
        gap: 4px;
        margin-top: 36px;
      }

      .page-btn {
        min-width: 36px;
        height: 36px;
        font-size: 0.8rem;
      }
    }

    @media (max-width: 560px) {
      .openings-section {
        padding: 64px 0;
      }

      .jobs-grid {
        grid-template-columns: 1fr;
        row-gap: 16px;
      }

      .openings-filters {
        flex-direction: column;
      }
    }
  `],
})
export class RecruitmentOpeningsComponent implements OnInit {
  private readonly recruitmentApi = inject(RecruitmentApiService);

  readonly departments: JobDepartment[] = DEPARTMENTS;
  readonly locations: JobLocation[] = LOCATIONS;

  // ── Filter state ───────────────────────────────────────────────────────────
  selectedDepartment: JobDepartment = 'All Departments';
  selectedLocation: JobLocation = 'All Locations';

  // ── Data state ─────────────────────────────────────────────────────────────
  readonly allJobs = signal<JobPosting[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal(false);

  // ── Pagination state ───────────────────────────────────────────────────────
  readonly currentPage = signal(1);
  readonly pageSize = PAGE_SIZE;

  // ── Derived: all jobs that match the active filters ────────────────────────
  readonly filteredJobs = computed((): JobPosting[] => {
    const jobs = this.allJobs();
    const dept = this.selectedDepartment;
    const loc = this.selectedLocation;

    return jobs.filter((job) => {
      const deptMatch = dept === 'All Departments' || job.department === dept;
      const locMatch = loc === 'All Locations' || job.location === loc;
      return deptMatch && locMatch;
    });
  });

  // ── Derived: total page count ──────────────────────────────────────────────
  readonly totalPages = computed((): number =>
    Math.max(1, Math.ceil(this.filteredJobs().length / this.pageSize))
  );

  // ── Derived: slice of filteredJobs for the current page ───────────────────
  readonly pagedJobs = computed((): JobPosting[] => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredJobs().slice(start, start + this.pageSize);
  });

  // ── Derived: 1-based start/end labels for the summary line ────────────────
  readonly pageStart = computed((): number =>
    this.filteredJobs().length === 0
      ? 0
      : (this.currentPage() - 1) * this.pageSize + 1
  );

  readonly pageEnd = computed((): number =>
    Math.min(this.currentPage() * this.pageSize, this.filteredJobs().length)
  );

  // ── Derived: page number buttons with ellipsis markers ────────────────────
  // Returns an array of page numbers and -1 as a sentinel for '…'
  readonly pageNumbers = computed((): number[] => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: number[] = [1];

    if (current > 3) pages.push(-1); // left ellipsis

    const rangeStart = Math.max(2, current - 1);
    const rangeEnd = Math.min(total - 1, current + 1);
    for (let p = rangeStart; p <= rangeEnd; p++) pages.push(p);

    if (current < total - 2) pages.push(-1); // right ellipsis

    pages.push(total);
    return pages;
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadJobs();
  }

  // ── Event handlers ─────────────────────────────────────────────────────────
  onFilterChange(): void {
    // Reset to page 1 whenever a filter changes so results start from the top.
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    const clamped = Math.max(1, Math.min(page, this.totalPages()));
    this.currentPage.set(clamped);
    // Scroll the openings section into view so the user sees the new results
    document.getElementById('openings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Private ────────────────────────────────────────────────────────────────
  private loadJobs(): void {
    this.isLoading.set(true);
    this.error.set(false);

    this.recruitmentApi.getJobPostings().subscribe({
      next: (jobs) => {
        this.allJobs.set(jobs);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.isLoading.set(false);
      },
    });
  }
}
