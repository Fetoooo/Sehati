import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="medic-card login-card">
      <div class="card-header">
        <h1 class="login-title">Sign In to Sehati</h1>
        <p class="login-subtitle">Enter your email or registered phone number to access your medical records.</p>
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
            <span>Email or Phone Number</span>
            <span class="req">*</span>
          </label>
          <input
            id="identifier"
            type="text"
            formControlName="identifier"
            class="medic-input"
            [class.is-invalid]="isFieldInvalid('identifier')"
            placeholder="e.g. name@sehati.com or +201012345678"
            autocomplete="username"
          />
          <div class="error-text" *ngIf="isFieldInvalid('identifier')">
            Please enter your registered email or phone number.
          </div>
        </div>

        <!-- Password Input -->
        <div class="medic-form-group">
          <div class="medic-label">
            <label for="password">Password</label>
            <span class="req">*</span>
          </div>
          <input
            id="password"
            type="password"
            formControlName="password"
            class="medic-input"
            [class.is-invalid]="isFieldInvalid('password')"
            placeholder="••••••••"
            autocomplete="current-password"
          />
          <div class="error-text" *ngIf="isFieldInvalid('password')">
            Password is required (min 8 characters).
          </div>
        </div>

        <!-- Remember Me & Forgot Password -->
        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" formControlName="rememberMe" />
            <span>Remember this device</span>
          </label>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="medic-btn btn-primary submit-btn" [disabled]="loginForm.invalid || isLoading">
          <span class="medic-spinner" *ngIf="isLoading"></span>
          <span *ngIf="!isLoading">Sign In</span>
          <span class="material-symbols-outlined" *ngIf="!isLoading">arrow_forward</span>
        </button>
      </form>

      <!-- Footer navigation -->
      <div class="card-footer">
        <p class="signup-prompt">
          Don't have an account yet?
          <a routerLink="/auth/register" class="link-highlight">Create Account</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-card {
      padding: 2.25rem 2rem;
    }

    .card-header {
      margin-bottom: 1.5rem;
      text-align: center;

      .login-title {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-main);
        letter-spacing: -0.02em;
        margin-bottom: 0.4rem;
      }

      .login-subtitle {
        font-size: 0.875rem;
        color: var(--text-secondary);
        line-height: 1.5;
      }
    }

    .form-options {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      font-size: 0.85rem;

      .remember-me {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        color: var(--text-secondary);
      }
    }

    .submit-btn {
      width: 100%;
      padding: 0.8rem;
      font-size: 1rem;
    }

    .card-footer {
      margin-top: 1.75rem;
      text-align: center;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border-subtle);

      .signup-prompt {
        font-size: 0.875rem;
        color: var(--text-secondary);

        .link-highlight {
          color: var(--primary-400);
          text-decoration: none;
          font-weight: 600;
          margin-left: 0.35rem;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

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
        this.errorMessage = err?.error?.message || 'Invalid credentials. Please verify your email/phone and password.';
      }
    });
  }
}
