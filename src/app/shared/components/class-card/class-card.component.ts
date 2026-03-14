import { Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-class-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  template: `
    <mat-card class="class-card" (click)="onCardClick()">
      <div class="card-image-container">
        <img
          [src]="imageUrl() || 'assets/images/placeholder-class.jpg'"
          [alt]="title()"
          class="card-image"
        />
      </div>
      <mat-card-content>
        <h3 class="card-title">{{ title() }}</h3>
        <p class="card-description">{{ description() }}</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-raised-button color="primary" class="card-button">
          {{ buttonText() }}
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .class-card {
      cursor: pointer;
      height: 100%;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s;
      border-radius: 12px;
      overflow: hidden;
    }

    .class-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }

    .card-image-container {
      position: relative;
      width: 100%;
      padding-top: 56.25%; /* 16:9 aspect ratio */
      overflow: hidden;
    }

    .card-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }

    .class-card:hover .card-image {
      transform: scale(1.05);
    }

    mat-card-content {
      flex: 1;
      padding: 16px;
    }

    .card-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1a365d;
      margin: 0 0 8px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-description {
      font-size: 0.875rem;
      color: #64748b;
      line-height: 1.5;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    mat-card-actions {
      padding: 0 16px 16px;
    }

    .card-button {
      width: 100%;
    }
  `],
})
export class ClassCardComponent {
  imageUrl = input<string>('');
  title = input.required<string>();
  description = input<string>('');
  buttonText = input<string>('Xem chi tiet');

  cardClick = output<void>();

  onCardClick(): void {
    this.cardClick.emit();
  }
}
