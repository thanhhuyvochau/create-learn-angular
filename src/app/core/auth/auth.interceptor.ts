import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthApiService } from './auth-api.service';
import { getStoredToken } from '../utils/auth.utils';

let isRefreshing = false;

/**
 * HTTP Interceptor that:
 * 1. Adds JWT Bearer token to all requests
 * 2. Handles 401 errors by attempting token refresh
 * 3. Redirects to login on refresh failure
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authApi = inject(AuthApiService);
  const router = inject(Router);

  // Skip auth header for refresh endpoint to avoid circular dependency
  const isRefreshRequest = req.url.includes('/api/auth/refresh');

  // Clone request with auth header if we have a token
  const authReq = addAuthHeader(req, isRefreshRequest);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only handle 401 errors, and not for refresh requests
      if (error.status === 401 && !isRefreshRequest && !isRefreshing) {
        isRefreshing = true;

        return authApi.refresh$().pipe(
          switchMap(() => {
            isRefreshing = false;
            // Retry the original request with new token
            const retryReq = addAuthHeader(req, false);
            return next(retryReq);
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            // Refresh failed - clear tokens and redirect to login
            authApi.removeTokens();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};

function addAuthHeader(req: HttpRequest<unknown>, skipAuth: boolean): HttpRequest<unknown> {
  if (skipAuth) {
    return req;
  }

  const token = getStoredToken();
  if (!token) {
    return req;
  }

  // Don't override if Authorization header already exists
  if (req.headers.has('Authorization')) {
    return req;
  }

  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}
