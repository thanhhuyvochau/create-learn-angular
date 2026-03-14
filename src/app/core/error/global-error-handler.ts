import { ErrorHandler, Injectable, inject, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { NotificationService } from '../notifications/notification.service';

/**
 * Global error handler that catches all unhandled exceptions
 * and displays user-friendly error notifications.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly notification = inject(NotificationService);
  private readonly zone = inject(NgZone);

  handleError(error: unknown): void {
    // Log error to console for debugging
    console.error('Global error handler caught:', error);

    // Run notification in Angular zone to ensure change detection
    this.zone.run(() => {
      const message = this.getErrorMessage(error);
      this.notification.showError(message);
    });
  }

  private getErrorMessage(error: unknown): string {
    // Handle HTTP errors
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Unable to connect to server. Please check your internet connection.';
      }
      if (error.status === 401) {
        return 'Your session has expired. Please log in again.';
      }
      if (error.status === 403) {
        return 'You do not have permission to perform this action.';
      }
      if (error.status === 404) {
        return 'The requested resource was not found.';
      }
      if (error.status >= 500) {
        return 'A server error occurred. Please try again later.';
      }
      // Use server message if available
      if (error.error?.message) {
        return error.error.message;
      }
      return `Error: ${error.statusText || 'Unknown error'}`;
    }

    // Handle standard JavaScript errors
    if (error instanceof Error) {
      // Don't show certain internal errors to users
      if (error.message.includes('ExpressionChangedAfterItHasBeenCheckedError')) {
        // Development-only error, ignore in production notification
        return '';
      }
      if (error.message.includes('NG0')) {
        // Angular internal errors
        return 'An application error occurred. Please refresh the page.';
      }
      return error.message;
    }

    // Handle string errors
    if (typeof error === 'string') {
      return error;
    }

    // Default message
    return 'An unexpected error occurred. Please try again.';
  }
}
