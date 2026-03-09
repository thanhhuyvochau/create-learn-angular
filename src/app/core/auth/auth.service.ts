import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

import { AuthApiService } from './auth-api.service';
import type { LoginRequest, AuthState, UserLogin } from '../../models';
import {
  decodeAccessTokenUser,
  isExpired,
  AUTH_SNAPSHOT_KEY,
} from '../utils/auth.utils';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);

  // Writable signals for internal state
  private readonly _isLoggedIn = signal<boolean>(false);
  private readonly _user = signal<UserLogin | null>(null);
  private readonly _isLoading = signal<boolean>(true);
  private readonly _error = signal<string | null>(null);

  // Public readonly computed signals
  readonly isLoggedIn = this._isLoggedIn.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed state object for convenience
  readonly state = computed<AuthState>(() => ({
    isLoggedIn: this._isLoggedIn(),
    user: this._user(),
    isLoading: this._isLoading(),
    error: this._error(),
  }));

  /**
   * Initialize auth state - called in APP_INITIALIZER
   */
  async initialize(): Promise<void> {
    // Read snapshot to reduce UI flicker
    const snapshot = this.readSnapshot();
    if (snapshot) {
      this._isLoggedIn.set(snapshot.isLoggedIn);
      this._user.set(snapshot.user);
    }

    await this.checkAuthStatus();
  }

  /**
   * Check current auth status based on stored token
   */
  async checkAuthStatus(): Promise<void> {
    const token = this.authApi.getStoredToken();

    // No token: not logged in
    if (!token) {
      this.setLoggedOut();
      return;
    }

    // Try to decode user from token
    const decoded = decodeAccessTokenUser(token);

    if (decoded) {
      // Token valid and not expired
      if (!isExpired(decoded.exp)) {
        this.setLoggedIn(decoded);
        return;
      }

      // Token expired: try refresh
      try {
        const refreshed = await this.authApi.refresh();
        const freshUser = decodeAccessTokenUser(refreshed.accessToken);
        if (freshUser) {
          this.setLoggedIn(freshUser);
          return;
        }
      } catch {
        // Refresh failed
      }
    }

    // Token invalid or refresh failed
    this.authApi.removeTokens();
    this.setLoggedOut();
  }

  /**
   * Login with credentials
   */
  async login(credentials: LoginRequest): Promise<{ success: boolean; user: UserLogin | null }> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const response = await this.authApi.login(credentials);

      if (response.status === 200 && response.data) {
        const serverUser = response.data.userLogin;
        const decodedUser = decodeAccessTokenUser(response.data.accessToken);
        const user = serverUser ?? decodedUser ?? null;

        this.setLoggedIn(user);
        return { success: true, user };
      }

      throw new Error(response.message ?? 'Login failed');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      this._error.set(errorMessage);
      this._isLoading.set(false);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    this._isLoading.set(true);

    try {
      await this.authApi.logout();
    } catch {
      // Ignore API failure
    }

    this.setLoggedOut();
    this.router.navigate(['/']);
  }

  /**
   * Clear current error
   */
  clearError(): void {
    this._error.set(null);
  }

  /**
   * Redirect if already logged in (for login page)
   */
  redirectIfLoggedIn(redirectTo: string = '/management/subject'): void {
    if (this._isLoggedIn() && !this._isLoading()) {
      this.router.navigate([redirectTo]);
    }
  }

  // Private helpers
  private setLoggedIn(user: UserLogin | null): void {
    this._isLoggedIn.set(!!user);
    this._user.set(user);
    this._isLoading.set(false);
    this._error.set(null);
    this.writeSnapshot({ isLoggedIn: !!user, user });
  }

  private setLoggedOut(): void {
    this._isLoggedIn.set(false);
    this._user.set(null);
    this._isLoading.set(false);
    this._error.set(null);
    this.writeSnapshot({ isLoggedIn: false, user: null });
  }

  private writeSnapshot(data: { isLoggedIn: boolean; user: UserLogin | null }): void {
    try {
      sessionStorage.setItem(AUTH_SNAPSHOT_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  }

  private readSnapshot(): { isLoggedIn: boolean; user: UserLogin | null } | null {
    try {
      const raw = sessionStorage.getItem(AUTH_SNAPSHOT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
