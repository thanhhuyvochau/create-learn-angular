import {
  Component,
  input,
  output,
  computed,
  TemplateRef,
  contentChild,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgTemplateOutlet } from '@angular/common';

export interface ColumnDef<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

export interface CellTemplateContext<T> {
  $implicit: T;
  row: T;
}

export type SortDirection = 'asc' | 'desc' | '';

export interface SortState {
  active: string;
  direction: SortDirection;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    NgTemplateOutlet,
  ],
  template: `
    <div class="table-container">
      <table
        mat-table
        [dataSource]="data()"
        matSort
        [matSortActive]="sortState()?.active || ''"
        [matSortDirection]="sortState()?.direction || ''"
        (matSortChange)="onSortChange($event)"
      >
        @for (column of columns(); track column.key) {
          <ng-container [matColumnDef]="column.key.toString()">
            <th
              mat-header-cell
              *matHeaderCellDef
              [mat-sort-header]="column.sortable !== false ? column.key.toString() : ''"
              [disabled]="column.sortable === false"
              [style.width]="column.width || 'auto'"
              [style.text-align]="column.align || 'left'"
            >
              {{ column.header }}
            </th>
            <td
              mat-cell
              *matCellDef="let row"
              [style.text-align]="column.align || 'left'"
            >
              @if (cellTemplates()[column.key.toString()]) {
                <ng-container
                  *ngTemplateOutlet="cellTemplates()[column.key.toString()]; context: { $implicit: row, row: row }"
                ></ng-container>
              } @else {
                {{ getCellValue(row, column) }}
              }
            </td>
          </ng-container>
        }

        @if (showActions()) {
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef style="width: 120px; text-align: center">
              Actions
            </th>
            <td mat-cell *matCellDef="let row" style="text-align: center">
              @if (actionsTemplate()) {
                <ng-container
                  *ngTemplateOutlet="actionsTemplate()!; context: { $implicit: row }"
                ></ng-container>
              } @else {
                <button
                  mat-icon-button
                  color="primary"
                  matTooltip="Edit"
                  (click)="edit.emit(row)"
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button
                  mat-icon-button
                  color="warn"
                  matTooltip="Delete"
                  (click)="delete.emit(row)"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              }
            </td>
          </ng-container>
        }

        <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns()"></tr>

        @if (data().length === 0) {
          <tr class="mat-row no-data-row">
            <td class="mat-cell" [attr.colspan]="displayedColumns().length">
              {{ emptyMessage() }}
            </td>
          </tr>
        }
      </table>
    </div>
  `,
  styles: [
    `
      .table-container {
        overflow-x: auto;
        width: 100%;
      }

      table {
        width: 100%;
        min-width: 600px;
      }

      .no-data-row td {
        text-align: center;
        padding: 48px 16px;
        color: #666;
        font-style: italic;
      }

      tr.mat-mdc-row:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }

      th.mat-mdc-header-cell {
        font-weight: 600;
        color: rgba(0, 0, 0, 0.87);
      }
    `,
  ],
})
export class DataTableComponent<T extends { id: number | string }> {
  // Inputs
  data = input.required<T[]>();
  columns = input.required<ColumnDef<T>[]>();
  showActions = input<boolean>(true);
  sortState = input<SortState | null>(null);
  emptyMessage = input<string>('No data available');
  cellTemplates = input<Record<string, TemplateRef<CellTemplateContext<T>>>>({});

  // Content projection for custom actions template
  actionsTemplate = contentChild<TemplateRef<{ $implicit: T }>>('actions');

  // Outputs
  edit = output<T>();
  delete = output<T>();
  sortChange = output<SortState>();

  // Computed
  displayedColumns = computed(() => {
    const cols = this.columns().map((c) => c.key.toString());
    if (this.showActions()) {
      cols.push('actions');
    }
    return cols;
  });

  getCellValue(row: T, column: ColumnDef<T>): string {
    if (column.render) {
      return column.render(row);
    }

    const value = row[column.key as keyof T];
    if (value == null) {
      return '—';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    return String(value);
  }

  onSortChange(sort: Sort): void {
    this.sortChange.emit({
      active: sort.active,
      direction: sort.direction,
    });
  }
}
