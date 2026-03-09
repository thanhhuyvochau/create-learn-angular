import { Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="loading-container" [class.overlay]="overlay()" [class.fullscreen]="fullscreen()">
      <mat-spinner [diameter]="diameter()" [color]="color()"></mat-spinner>
      @if (message()) {
        <p class="loading-message">{{ message() }}</p>
      }
    </div>
  `,
  styles: [
    `
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
        gap: 16px;
      }

      .loading-container.overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.8);
        z-index: 100;
      }

      .loading-container.fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.9);
        z-index: 1000;
      }

      .loading-message {
        margin: 0;
        color: #666;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class LoadingSpinnerComponent {
  diameter = input<number>(40);
  color = input<'primary' | 'accent' | 'warn'>('primary');
  message = input<string>('');
  overlay = input<boolean>(false);
  fullscreen = input<boolean>(false);
}
