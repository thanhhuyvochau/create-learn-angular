import { Component, input, output, computed } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [MatPaginatorModule],
  template: `
    <mat-paginator
      [length]="totalElements()"
      [pageSize]="pageSize()"
      [pageIndex]="pageIndex()"
      [pageSizeOptions]="pageSizeOptions()"
      [showFirstLastButtons]="showFirstLastButtons()"
      (page)="onPageChange($event)"
      aria-label="Select page"
    >
    </mat-paginator>
  `,
  styles: [
    `
      :host {
        display: block;
        margin-top: 16px;
      }

      mat-paginator {
        background: transparent;
      }
    `,
  ],
})
export class PaginationComponent {
  // Inputs
  totalElements = input.required<number>();
  pageSize = input<number>(10);
  pageIndex = input<number>(0); // 0-based
  pageSizeOptions = input<number[]>([5, 10, 25, 50]);
  showFirstLastButtons = input<boolean>(true);

  // Outputs
  pageChange = output<{ pageIndex: number; pageSize: number }>();

  // Computed
  totalPages = computed(() =>
    Math.ceil(this.totalElements() / this.pageSize())
  );

  onPageChange(event: PageEvent): void {
    this.pageChange.emit({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
    });
  }
}
