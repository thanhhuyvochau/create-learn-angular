import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { RecruitmentApiService } from '../../../../core/api/recruitment-api.service';

@Component({
  selector: 'app-recruitment-newsletter',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="newsletter-section">
      <div class="newsletter-wrapper">
        <div class="newsletter-card">
          <!-- Decorative background image -->
          <div class="newsletter-bg-art" aria-hidden="true">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMKtuIQTc3tEqLJ4ikEgsPM2Q6dKnaNdPLx6ljGrkO9UIp4o4A4zJUh8hOCOp1BovYSdAhnu2EcjwsV2Bai5P-ullmiCIK5Q_PBxERonqNdGuWp3clEbUxGKMtBYZpwgSFonPvZMoSdi2A90zR-4gKlZDmF02O1-vAvHRPjs85CNv4iBuYL6zorJS9p6lSLcNE2WCFlN86xj8UdT81hvl0hXe0ZTURMaoHH8i1UKguxEOf2wVpNkPkPapjR8tztoYqI71E-sgB1pk"
              alt=""
            />
          </div>

          <!-- Content -->
          <div class="newsletter-content">
            <h2 class="newsletter-title">Stay in the Loop</h2>
            <p class="newsletter-desc">
              Not ready to apply just yet? Join our talent network to receive
              updates on new openings and company news.
            </p>

            @if (submitSuccess()) {
              <div class="success-message" role="alert">
                <mat-icon class="success-icon">check_circle</mat-icon>
                <span>You're on the list! We'll be in touch.</span>
              </div>
            } @else {
              <form
                class="newsletter-form"
                (ngSubmit)="onSubmit()"
                novalidate
              >
                <div class="form-field-wrap">
                  <input
                    class="email-input"
                    [class.email-input--error]="showEmailError()"
                    type="email"
                    placeholder="Enter your email"
                    [formControl]="emailControl"
                    autocomplete="email"
                    aria-label="Email address"
                  />
                  @if (showEmailError()) {
                    <span class="field-error">Please enter a valid email address.</span>
                  }
                </div>

                <button
                  class="submit-btn"
                  type="submit"
                  [disabled]="isSubmitting()"
                >
                  @if (isSubmitting()) {
                    <span class="btn-spinner" aria-hidden="true"></span>
                    Joining...
                  } @else {
                    Join Network
                  }
                </button>
              </form>
            }
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .newsletter-section {
      padding: 80px 0;
    }

    .newsletter-wrapper {
      max-width: 1184px;
      margin: 0 auto;
      padding: 0 32px;
    }

    /* Card */
    .newsletter-card {
      position: relative;
      overflow: hidden;
      border-radius: 24px;
      background: var(--color-brand-navy-6);
      padding: 64px 80px;
    }

    /* Decorative art */
    .newsletter-bg-art {
      position: absolute;
      top: 0;
      right: 0;
      width: 50%;
      height: 100%;
      opacity: 0.18;
      pointer-events: none;
    }

    .newsletter-bg-art img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Content */
    .newsletter-content {
      position: relative;
      z-index: 1;
      max-width: 520px;
    }

    .newsletter-title {
      font-size: clamp(1.75rem, 3vw, 2.5rem);
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 16px 0;
      line-height: 1.2;
    }

    .newsletter-desc {
      color: #a9c7ff;
      font-size: 1.05rem;
      line-height: 1.65;
      margin: 0 0 36px 0;
    }

    /* Form */
    .newsletter-form {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: flex-start;
    }

    .form-field-wrap {
      flex: 1;
      min-width: 220px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .email-input {
      width: 100%;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 9999px;
      padding: 14px 24px;
      color: #ffffff;
      font-size: 0.95rem;
      outline: none;
      transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      box-sizing: border-box;
    }

    .email-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .email-input:focus {
      background: rgba(255, 255, 255, 0.18);
      border-color: var(--color-brand-teal-5, #59dbc7);
      box-shadow: 0 0 0 3px rgba(89, 219, 199, 0.25);
    }

    .email-input--error {
      border-color: #ff8a80;
    }

    .field-error {
      color: #ff8a80;
      font-size: 0.8rem;
      padding-left: 12px;
    }

    /* Submit button */
    .submit-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 32px;
      border-radius: 9999px;
      background: var(--color-brand-teal-6);
      color: #ffffff;
      font-weight: 700;
      font-size: 0.95rem;
      border: none;
      cursor: pointer;
      white-space: nowrap;
      transition: transform 0.15s ease, opacity 0.2s ease;
    }

    .submit-btn:hover:not(:disabled) {
      transform: scale(1.04);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Spinner inside button */
    .btn-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Success */
    .success-message {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(89, 219, 199, 0.15);
      border: 1px solid rgba(89, 219, 199, 0.4);
      border-radius: 12px;
      padding: 16px 20px;
      color: #79f7e3;
      font-size: 1rem;
      font-weight: 500;
    }

    .success-icon {
      font-size: 1.5rem !important;
      width: 1.5rem !important;
      height: 1.5rem !important;
      line-height: 1.5rem !important;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .newsletter-card {
        padding: 48px 32px;
      }

      .newsletter-form {
        flex-direction: column;
      }

      .form-field-wrap {
        width: 100%;
      }

      .submit-btn {
        width: 100%;
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .newsletter-section {
        padding: 48px 0;
      }

      .newsletter-card {
        padding: 40px 24px;
        border-radius: 16px;
      }
    }
  `],
})
export class RecruitmentNewsletterComponent {
  private readonly recruitmentApi = inject(RecruitmentApiService);

  readonly emailControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });

  readonly isSubmitting = signal(false);
  readonly submitSuccess = signal(false);

  readonly showEmailError = signal(false);

  onSubmit(): void {
    this.emailControl.markAsTouched();

    if (this.emailControl.invalid) {
      this.showEmailError.set(true);
      return;
    }

    this.showEmailError.set(false);
    this.isSubmitting.set(true);

    this.recruitmentApi
      .joinTalentNetwork({ email: this.emailControl.value })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.submitSuccess.set(true);
          this.emailControl.reset();
        },
        error: () => {
          this.isSubmitting.set(false);
          // TODO: show error notification when NotificationService is wired
        },
      });
  }
}
