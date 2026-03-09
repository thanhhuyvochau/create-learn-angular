import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { API_BASE_URL } from '../tokens';
import type { LoginRequest, LoginResponse } from '../../models';
import {
  getStoredToken,
  setStoredToken,
  getRefreshToken,
  setRefreshToken,
  removeTokens,
} from '../utils/auth.utils';

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  /**
   * Login with credentials (Promise-based)
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const url = `${this.baseUrl}/api/auth/login`;
    return new Promise((resolve, reject) => {
      this.http.post<LoginResponse>(url, credentials).subscribe({
        next: (response) => {
          if (response.status === 200 && response.data) {
            setStoredToken(response.data.accessToken);
            setRefreshToken(response.data.refreshToken);
          }
          resolve(response);
        },
        error: (err) => reject(err),
      });
    });
  }

  /**
   * Logout (Promise-based)
   */
  async logout(): Promise<void> {
    const url = `${this.baseUrl}/api/auth/logout`;
    try {
      await new Promise<void>((resolve, reject) => {
        this.http.post<void>(url, {}).subscribe({
          next: () => resolve(),
          error: (err) => reject(err),
        });
      });
    } catch {
      // Ignore API failure during logout
    } finally {
      removeTokens();
    }
  }

  /**
   * Refresh token (Promise-based)
   */
  async refresh(): Promise<RefreshResponse> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const url = `${this.baseUrl}/api/auth/refresh`;
    return new Promise((resolve, reject) => {
      this.http
        .post<RefreshResponse>(url, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        })
        .subscribe({
          next: (response) => {
            setStoredToken(response.accessToken);
            setRefreshToken(response.refreshToken);
            resolve(response);
          },
          error: (err) => {
            removeTokens();
            reject(err);
          },
        });
    });
  }

  /**
   * Refresh token (Observable-based for interceptor use)
   */
  refresh$(): Observable<RefreshResponse> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const url = `${this.baseUrl}/api/auth/refresh`;
    return this.http
      .post<RefreshResponse>(url, {}, {
        headers: { Authorization: `Bearer ${refreshToken}` },
      })
      .pipe(
        tap((response) => {
          setStoredToken(response.accessToken);
          setRefreshToken(response.refreshToken);
        }),
        catchError((err) => {
          removeTokens();
          return throwError(() => err);
        })
      );
  }

  /**
   * Get the currently stored access token
   */
  getStoredToken(): string | null {
    return getStoredToken();
  }

  /**
   * Get the currently stored refresh token
   */
  getRefreshToken(): string | null {
    return getRefreshToken();
  }

  /**
   * Remove all tokens
   */
  removeTokens(): void {
    removeTokens();
  }
}
