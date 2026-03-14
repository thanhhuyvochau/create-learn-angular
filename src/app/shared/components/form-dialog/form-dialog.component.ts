import { Component, input, output } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-form-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>{{ title() }}</h2>
        <button mat-icon-button (click)="closeClick.emit()" aria-label="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <div class="dialog-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-container {
        min-width: 400px;
        max-width: 600px;
      }

      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid #e0e0e0;
      }

      .dialog-header h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }

      .dialog-content {
        padding: 24px;
      }
    `,
  ],
})
export class FormDialogComponent {
  title = input.required<string>();
  closeClick = output<void>();
}
