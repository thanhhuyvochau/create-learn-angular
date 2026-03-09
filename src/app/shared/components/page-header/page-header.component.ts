import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="page-subtitle">{{ subtitle() }}</p>
        }
      </div>
      <div class="header-actions">
        @if (showAddButton()) {
          <button
            mat-flat-button
            color="primary"
            (click)="addClick.emit()"
          >
            <mat-icon>add</mat-icon>
            {{ addButtonText() }}
          </button>
        }
        <ng-content select="[actions]"></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
        flex-wrap: wrap;
        gap: 16px;
      }

      .header-content {
        flex: 1;
        min-width: 200px;
      }

      .page-title {
        margin: 0;
        font-size: 1.75rem;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.87);
      }

      .page-subtitle {
        margin: 4px 0 0;
        font-size: 0.875rem;
        color: rgba(0, 0, 0, 0.6);
      }

      .header-actions {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
      }

      button mat-icon {
        margin-right: 4px;
      }
    `,
  ],
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  showAddButton = input<boolean>(true);
  addButtonText = input<string>('Add New');

  addClick = output<void>();
}
