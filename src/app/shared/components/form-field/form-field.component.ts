import { Component, input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field [appearance]="appearance()" class="full-width">
      <mat-label>{{ label() }}</mat-label>
      <ng-content></ng-content>
      @if (hint()) {
        <mat-hint>{{ hint() }}</mat-hint>
      }
      @if (errorMessage()) {
        <mat-error>{{ errorMessage() }}</mat-error>
      }
    </mat-form-field>
  `,
  styles: [
    `
      .full-width {
        width: 100%;
      }
    `,
  ],
})
export class FormFieldComponent {
  label = input.required<string>();
  hint = input<string>('');
  errors = input<ValidationErrors | null>(null);
  appearance = input<'fill' | 'outline'>('outline');

  errorMessage(): string {
    const errors = this.errors();
    if (!errors) return '';

    if (errors['required']) {
      return `${this.label()} is required`;
    }
    if (errors['email']) {
      return 'Please enter a valid email address';
    }
    if (errors['minlength']) {
      const minLength = errors['minlength'].requiredLength;
      return `${this.label()} must be at least ${minLength} characters`;
    }
    if (errors['maxlength']) {
      const maxLength = errors['maxlength'].requiredLength;
      return `${this.label()} must be at most ${maxLength} characters`;
    }
    if (errors['min']) {
      return `${this.label()} must be at least ${errors['min'].min}`;
    }
    if (errors['max']) {
      return `${this.label()} must be at most ${errors['max'].max}`;
    }
    if (errors['pattern']) {
      return `${this.label()} format is invalid`;
    }
    if (errors['custom']) {
      return errors['custom'];
    }

    // Return first error key as fallback
    const firstKey = Object.keys(errors)[0];
    return `${this.label()} is invalid (${firstKey})`;
  }
}
