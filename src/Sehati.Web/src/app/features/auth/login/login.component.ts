import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="medic-card login-card">
      <div class="card-header">
        <h1 class="login-title">{{ langService.t('loginTitle') }}</h1>
        <p class="login-subtitle">{{ langService.t('loginSubtitle') }}</p>
      </div>

      <!-- Error Alert -->
      <div class="medic-alert alert-error" *ngIf="errorMessage">
        <span class="material-symbols-outlined">error</span>
        <span>{{ errorMessage }}</span>
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
        <!-- Identifier Input (Email or Phone) -->
        <div class="medic-form-group">
          <label class="medic-label" for="identifier">
            <span>{{ langService.t('identifierLabel') }}</span>
            <span class="req">*</span>
          </label>
          <input
            id="identifier"
            type="text"
            formControlName="identifier"
            class="medic-input"
            [class.is-invalid]="isFieldInvalid('identifier')"
            [placeholder]="langService.t('identifierPlaceholder')"
            autocomplete="username"
          />
          <div class="error-text" *ngIf="isFieldInvalid('identifier')">
            {{ langService.isRtl() ? 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف المسجل.' : 'Please enter your registered email or phone number.' }}
          </div>
        </div>

        <!-- Password Input -->
        <div class="medic-form-group">
          <div class="medic-label">
            <label for="password">{{ langService.t('passwordLabel') }}</label>
            <span class="req">*</span>
          </div>
          <input
            id="password"
            type="password"
            formControlName="password"
            class="medic-input"
            [class.is-invalid]="isFieldInvalid('password')"
            [placeholder]="langService.t('passwordPlaceholder')"
            autocomplete="current-password"
          />
          <div class="error-text" *ngIf="isFieldInvalid('password')">
            {{ langService.isRtl() ? 'كلمة المرور مطلوبة (8 أحرف على الأقل).' : 'Password is required (min 8 characters).' }}
          </div>
        </div>

        <!-- Remember Me Checkbox -->
        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" formControlName="rememberMe" />
            <span>{{ langService.t('rememberMe') }}</span>
          </label>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="medic-btn btn-primary submit-btn" [disabled]="loginForm.invalid || isLoading">
          <span class="medic-spinner" *ngIf="isLoading"></span>
          <span *ngIf="!isLoading">{{ langService.t('signInBtn') }}</span>
          <span class="material-symbols-outlined flip-rtl" *ngIf="!isLoading">arrow_forward</span>
        </button>
      </form>

      <!-- Footer navigation -->
      <div class="card-footer">
        <p class="signup-prompt">
          {{ langService.t('dontHaveAccount') }}
          <a routerLink="/auth/register" class="link-highlight">{{ langService.t('createAccountLink') }}</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-card {
      padding: 2.5rem 2.25rem;
    }

    .card-header {
      margin-bottom: 1.75rem;
      text-align: center;

      .login-title {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--color-text-brand);
        letter-spacing: -0.02em;
        margin-bottom: 0.45rem;
      }

      .login-subtitle {
        font-size: 0.9rem;
        color: var(--color-text-muted);
        line-height: 1.5;
      }
    }

    .form-options {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;

      .remember-me {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        color: var(--color-text-muted);

        input[type="checkbox"] {
          accent-color: var(--color-primary-base);
          width: 16px;
          height: 16px;
        }
      }
    }

    .submit-btn {
      width: 100%;
      padding: 0.85rem;
      font-size: 1.05rem;
      border-radius: var(--radius-md);
    }

    .flip-rtl {
      transition: transform 0.2s ease;
    }

    :host-context([dir="rtl"]) .flip-rtl,
    :host-context(.rtl) .flip-rtl {
      transform: rotate(180deg);
    }

    .card-footer {
      margin-top: 2rem;
      text-align: center;
      padding-top: 1.5rem;
      border-top: 1px solid var(--color-border-subtle);

      .signup-prompt {
        font-size: 0.9rem;
        color: var(--color-text-muted);

        .link-highlight {
          color: var(--color-primary-base);
          text-decoration: none;
          font-weight: 700;
          margin: 0 0.35rem;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    @media (max-width: 640px) {
      .login-card {
        padding: 1.75rem 1.25rem;
      }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  public langService = inject(LanguageService);

  isLoading = false;
  errorMessage: string | null = null;

  loginForm = this.fb.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [true]
  });

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const { identifier, password } = this.loginForm.value;

    this.authService.login({ identifier: identifier!.trim(), password: password! }).subscribe({
      next: () => {
        this.isLoading = false;
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message ||
          (this.langService.isRtl()
            ? 'بيانات الدخول غير صحيحة. يرجى التحقق من البريد أو رقم الهاتف وكلمة المرور.'
            : 'Invalid credentials. Please verify your email/phone and password.');
      }
    });
  }
}
