import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="login-container">
      <div class="login-form-section">
        <div class="login-form-wrapper">
          <h1 class="login-title">Welcome back to Algocore</h1>

          @if (errorMessage()) {
            <div class="error-alert">
              <mat-icon>error_outline</mat-icon>
              <span>{{ errorMessage() }}</span>
              <button mat-icon-button (click)="clearError()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Tài khoản</mat-label>
              <input
                matInput
                formControlName="username"
                placeholder="Tài khoản"
                autocomplete="username"
              />
              @if (
                loginForm.get('username')?.hasError('required') &&
                loginForm.get('username')?.touched
              ) {
                <mat-error>Vui lòng nhập tài khoản</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mật khẩu</mat-label>
              <input
                matInput
                [type]="hidePassword() ? 'password' : 'text'"
                formControlName="password"
                placeholder="Mật khẩu"
                autocomplete="current-password"
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="togglePasswordVisibility()"
              >
                <mat-icon>{{
                  hidePassword() ? 'visibility_off' : 'visibility'
                }}</mat-icon>
              </button>
              @if (
                loginForm.get('password')?.hasError('required') &&
                loginForm.get('password')?.touched
              ) {
                <mat-error>Vui lòng nhập mật khẩu</mat-error>
              }
            </mat-form-field>

            <button
              mat-flat-button
              color="primary"
              type="submit"
              class="login-button"
              [disabled]="!canSubmit() || isSubmitting()"
            >
              @if (isSubmitting()) {
                <mat-icon class="spinning-icon">sync</mat-icon>
                <span>Đang đăng nhập...</span>
              } @else {
                <span>Đăng nhập</span>
              }
            </button>
          </form>
        </div>
      </div>

      <div class="login-image-section">
        <img src="/images/login-page.png" alt="Login background" class="login-bg-image" />
        <div class="image-overlay">
          <h2>Algocore Education</h2>
          <p>Your educational journey starts here</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        min-height: 100vh;
        width: 100%;
      }

      .login-form-section {
        flex: 0 0 40%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background-color: #fff;
      }

      .login-form-wrapper {
        width: 100%;
        max-width: 389px;
      }

      .login-title {
        font-size: 1.75rem;
        font-weight: 600;
        color: #1976d2;
        margin-bottom: 32px;
        text-align: center;
      }

      .error-alert {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background-color: #ffebee;
        border: 1px solid #f44336;
        border-radius: 4px;
        color: #c62828;
        margin-bottom: 24px;
      }

      .error-alert mat-icon:first-child {
        color: #f44336;
      }

      .error-alert span {
        flex: 1;
        font-size: 0.875rem;
      }

      .error-alert button {
        margin: -8px;
      }

      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }

      .login-button {
        width: 100%;
        height: 48px;
        font-size: 1rem;
        margin-top: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .login-image-section {
        flex: 1 1 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        box-shadow: -8px 0 24px rgba(0, 0, 0, 0.25);
      }

      .login-bg-image {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        z-index: 0;
      }

      .login-image-section::before {
        content: '';
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.40);
        animation: none;
        z-index: 1;
      }

      .spinning-icon {
        animation: spin 2s linear infinite;
        font-size: 20px;
        width: 20px;
        height: 20px;
        line-height: 20px;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .image-overlay {
        position: relative;
        z-index: 2;
        width: fit-content;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        color: white;
        padding: 32px 40px;
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(6px);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.15);
      }

      .image-overlay h2 {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 16px;
        color: #ffffff;
        text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
        letter-spacing: 0.01em;
      }

      .image-overlay h2::after {
        content: '';
        display: block;
        width: 48px;
        height: 3px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 2px;
        margin: 12px auto 0;
      }

      .image-overlay p {
        font-size: 1.25rem;
        color: rgba(255, 255, 255, 0.85);
        letter-spacing: 0.03em;
        margin-top: 4px;
        text-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
      }

      /* Responsive styles */
      @media (max-width: 960px) {
        .login-container {
          flex-direction: column;
        }

        .login-form-section {
          flex: 1;
          min-height: 100vh;
        }

        .login-image-section {
          display: none;
        }
      }
    `,
  ],
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  loginForm: FormGroup;
  hidePassword = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    // If already logged in, redirect to management
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/management']);
      return;
    }

    // Watch auth state for successful login
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        if (state.isLoggedIn) {
          this.router.navigate(['/management']);
        }
        if (state.error) {
          this.errorMessage.set(state.error);
          this.isSubmitting.set(false);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  canSubmit(): boolean {
    const { username, password } = this.loginForm.value;
    return username?.trim().length > 0 && password?.length > 0;
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((v) => !v);
  }

  clearError(): void {
    this.errorMessage.set(null);
    this.authService.clearError();
  }

  async onSubmit(): Promise<void> {
    if (!this.canSubmit() || this.isSubmitting()) {
      return;
    }

    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { username, password } = this.loginForm.value;

    try {
      await this.authService.login({ username: username.trim(), password });
      // Navigation is handled by authState$ subscription
    } catch (error) {
      const message = "Sai tài khoản hoặc mật khẩu. Vui lòng thử lại."
      this.errorMessage.set(message);
      this.isSubmitting.set(false);
    }
  }
}
