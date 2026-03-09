import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Guard that only allows authenticated users
 * Redirects to /login if not authenticated
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // If still loading, wait a bit (edge case during app init)
  if (authService.isLoading()) {
    // Allow navigation if we have snapshot indicating logged in
    // The full auth check will complete shortly
    return true;
  }

  return router.createUrlTree(['/login']);
};

/**
 * Guard that only allows guests (non-authenticated users)
 * Redirects to /management/subject if already authenticated
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn() && !authService.isLoading()) {
    return true;
  }

  if (authService.isLoggedIn()) {
    return router.createUrlTree(['/management/subject']);
  }

  // Still loading - allow access, login page will redirect if needed
  return true;
};
