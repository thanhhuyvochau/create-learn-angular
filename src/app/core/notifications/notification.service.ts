import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  private readonly defaultDuration = 4000;

  /**
   * Show a success notification
   */
  showSuccess(message: string, duration: number = this.defaultDuration): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['snackbar-success'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  /**
   * Show an error notification
   */
  showError(message: string, duration: number = this.defaultDuration): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['snackbar-error'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  /**
   * Show an info notification
   */
  showInfo(message: string, duration: number = this.defaultDuration): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['snackbar-info'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  /**
   * Show a warning notification
   */
  showWarning(message: string, duration: number = this.defaultDuration): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['snackbar-warning'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  /**
   * Dismiss current notification
   */
  dismiss(): void {
    this.snackBar.dismiss();
  }
}
