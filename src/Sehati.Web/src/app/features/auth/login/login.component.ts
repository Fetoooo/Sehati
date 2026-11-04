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
    <div class="auth-card-container">
      <!-- Switcher Tabs -->
      <div class="auth-switch-tabs">
        <a routerLink="/auth/login" class="tab-item active">
          <span class="material-symbols-outlined">login</span>
          <span>{{ langService.t('signInBtn') }}</span>
        </a>
        <a routerLink="/auth/register" class="tab-item">
          <span class="material-symbols-outlined">person_add</span>
          <span>{{ langService.t('createAccountLink') }}</span>
        </a>
      </div>

      <div class="auth-main-card">
        <div class="card-titles">
          <h1 class="main-title">{{ langService.t('loginTitle') }}</h1>
          <p class="subtitle">{{ langService.t('loginSubtitle') }}</p>
        </div>

        <!-- Quick Demo Accounts One-Click Fill -->
        <div class="demo-selector-box">
          <span class="demo-label">{{ langService.isRtl() ? 'تجربة سريعة بحساب تجريبي:' : 'Quick Demo Fill:' }}</span>
          <div class="demo-pills-row">
            <button type="button" class="demo-pill" (click)="fillDemo('patient')">
              <span class="material-symbols-outlined">person</span>
              <span>{{ langService.isRtl() ? 'مريض' : 'Patient' }}</span>
            </button>
            <button type="button" class="demo-pill" (click)="fillDemo('doctor')">
              <span class="material-symbols-outlined">stethoscope</span>
              <span>{{ langService.isRtl() ? 'طبيب' : 'Doctor' }}</span>
            </button>
            <button type="button" class="demo-pill" (click)="fillDemo('receptionist')">
              <span class="material-symbols-outlined">desk</span>
              <span>{{ langService.isRtl() ? 'استقبال' : 'Reception' }}</span>
            </button>
            <button type="button" class="demo-pill" (click)="fillDemo('admin')">
              <span class="material-symbols-outlined">admin_panel_settings</span>
              <span>{{ langService.isRtl() ? 'مدير' : 'Admin' }}</span>
            </button>
          </div>
        </div>

        <!-- Error Alert -->
        <div class="auth-alert alert-error" *ngIf="errorMessage">
          <span class="material-symbols-outlined">error</span>
          <span>{{ errorMessage }}</span>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="modern-auth-form">
          <!-- Identifier Input -->
          <div class="input-field-group">
            <label class="field-label" for="identifier">
              <span>{{ langService.t('identifierLabel') }}</span>
              <span class="req">*</span>
            </label>
            <div class="input-with-icon">
              <span class="material-symbols-outlined leading-icon">alternate_email</span>
              <input
                id="identifier"
                type="text"
                formControlName="identifier"
                class="field-input"
                [class.invalid]="isFieldInvalid('identifier')"
                [placeholder]="langService.t('identifierPlaceholder')"
                autocomplete="username"
              />
            </div>
            <div class="field-error-msg" *ngIf="isFieldInvalid('identifier')">
              {{ langService.isRtl() ? 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف المسجل.' : 'Please enter your registered email or phone number.' }}
            </div>
          </div>

          <!-- Password Input -->
          <div class="input-field-group">
            <div class="label-row">
              <label class="field-label" for="password">
                <span>{{ langService.t('passwordLabel') }}</span>
                <span class="req">*</span>
              </label>
            </div>
            <div class="input-with-icon">
              <span class="material-symbols-outlined leading-icon">lock</span>
              <input
                id="password"
                [type]="showPassword ? 'text' : 'password'"
                formControlName="password"
                class="field-input"
                [class.invalid]="isFieldInvalid('password')"
                [placeholder]="langService.t('passwordPlaceholder')"
                autocomplete="current-password"
              />
              <button type="button" class="trailing-toggle-btn" (click)="showPassword = !showPassword">
                <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
            <div class="field-error-msg" *ngIf="isFieldInvalid('password')">
              {{ langService.isRtl() ? 'كلمة المرور مطلوبة (8 أحرف على الأقل).' : 'Password is required (min 8 characters).' }}
            </div>
          </div>

          <!-- Form Options -->
          <div class="options-row">
            <label class="remember-label">
              <input type="checkbox" formControlName="rememberMe" />
              <span>{{ langService.t('rememberMe') }}</span>
            </label>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="submit-action-btn" [disabled]="loginForm.invalid || isLoading">
            <span class="loading-spinner" *ngIf="isLoading"></span>
            <span *ngIf="!isLoading">{{ langService.t('signInBtn') }}</span>
            <span class="material-symbols-outlined flip-rtl" *ngIf="!isLoading">arrow_forward</span>
          </button>
        </form>

        <!-- Bottom Links -->
        <div class="card-bottom-bar">
          <p class="create-account-text">
            {{ langService.t('dontHaveAccount') }}
            <a routerLink="/auth/register" class="action-link">{{ langService.t('createAccountLink') }}</a>
          </p>

          <div class="alternative-links">
            <a routerLink="/" class="home-link">
              <span class="material-symbols-outlined">home</span>
              <span>{{ langService.isRtl() ? 'الرئيسية' : 'Homepage' }}</span>
            </a>
            <span>•</span>
            <a routerLink="/preview" class="demo-link">
              <span class="material-symbols-outlined">architecture</span>
              <span>{{ langService.t('architectureShowcase') }}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-card-container {
      width: 100%;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .auth-switch-tabs {
      display: flex;
      background: var(--color-surface-card);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-full);
      padding: 0.3rem;
      box-shadow: var(--shadow-sm);

      .tab-item {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        padding: 0.55rem;
        border-radius: var(--radius-full);
        font-size: 0.88rem;
        font-weight: 700;
        text-decoration: none;
        color: var(--color-text-muted);
        transition: all 0.2s;

        span.material-symbols-outlined { font-size: 1.1rem; }

        &.active {
          background: linear-gradient(135deg, var(--color-primary-deep), var(--color-primary-ocean));
          color: #fff;
          box-shadow: 0 4px 12px rgba(8, 131, 149, 0.25);
        }
      }
    }

    .auth-main-card {
      background: var(--color-surface-card);
      border: 1px solid var(--color-border-subtle);
      border-radius: 24px;
      padding: 2.25rem;
      box-shadow: var(--shadow-md);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .card-titles {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;

      .main-title {
        font-size: 1.7rem;
        font-weight: 900;
        color: var(--color-text-main);
        margin: 0;
      }

      .subtitle {
        color: var(--color-text-muted);
        font-size: 0.95rem;
        line-height: 1.5;
        margin: 0;
      }
    }

    .demo-selector-box {
      background: var(--color-bg-app);
      border: 1px dashed var(--color-border-subtle);
      border-radius: var(--radius-md);
      padding: 0.75rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .demo-label {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--color-text-muted);
        text-transform: uppercase;
      }

      .demo-pills-row {
        display: flex;
        gap: 0.4rem;
        flex-wrap: wrap;

        .demo-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: var(--color-surface-card);
          border: 1px solid var(--color-border-subtle);
          padding: 0.3rem 0.65rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-text-main);
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            border-color: var(--color-primary-ocean);
            color: var(--color-primary-ocean);
          }

          span.material-symbols-outlined { font-size: 0.95rem; }
        }
      }
    }

    .auth-alert {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      font-weight: 600;

      &.alert-error {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.25);
        color: #b91c1c;
      }
    }

    .modern-auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .input-field-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;

      .field-label {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--color-text-main);
        display: flex;
        gap: 0.2rem;
        .req { color: #ef4444; }
      }

      .input-with-icon {
        position: relative;
        display: flex;
        align-items: center;

        .leading-icon {
          position: absolute;
          left: 1rem;
          color: var(--color-text-muted);
          font-size: 1.25rem;
          pointer-events: none;
        }

        .field-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.85rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border-subtle);
          background: var(--color-bg-app);
          color: var(--color-text-main);
          font-size: 0.95rem;
          transition: all 0.2s;

          &:focus {
            outline: none;
            border-color: var(--color-primary-ocean);
            background: var(--color-surface-card);
            box-shadow: 0 0 0 3px rgba(8, 131, 149, 0.12);
          }

          &.invalid {
            border-color: #ef4444;
          }
        }

        .trailing-toggle-btn {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .field-error-msg {
        font-size: 0.75rem;
        color: #ef4444;
        font-weight: 600;
      }
    }

    :host-context([dir="rtl"]) .input-with-icon {
      .leading-icon {
        left: auto;
        right: 1rem;
      }
      .field-input {
        padding: 0.75rem 2.85rem 0.75rem 1rem;
      }
      .trailing-toggle-btn {
        right: auto;
        left: 0.75rem;
      }
    }

    .options-row {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .remember-label {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.85rem;
        color: var(--color-text-muted);
        cursor: pointer;

        input[type="checkbox"] {
          accent-color: var(--color-primary-ocean);
        }
      }
    }

    .submit-action-btn {
      width: 100%;
      padding: 0.85rem 1.5rem;
      border-radius: var(--radius-full);
      border: none;
      background: linear-gradient(135deg, var(--color-primary-deep), var(--color-primary-ocean));
      color: #fff;
      font-size: 1rem;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(8, 131, 149, 0.3);
      transition: all 0.25s ease;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(8, 131, 149, 0.4);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .loading-spinner {
        width: 18px;
        height: 18px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .card-bottom-bar {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.85rem;
      border-top: 1px solid var(--color-border-subtle);
      padding-top: 1.25rem;

      .create-account-text {
        font-size: 0.88rem;
        color: var(--color-text-muted);
        margin: 0;

        .action-link {
          color: var(--color-primary-ocean);
          font-weight: 700;
          text-decoration: none;
          &:hover { text-decoration: underline; }
        }
      }

      .alternative-links {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.82rem;
        color: var(--color-text-muted);

        a {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--color-text-muted);
          text-decoration: none;
          font-weight: 600;

          &:hover { color: var(--color-primary-ocean); }
          span.material-symbols-outlined { font-size: 0.95rem; }
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
  public langService = inject(LanguageService);

  public isLoading = false;
  public errorMessage: string | null = null;
  public showPassword = false;

  public loginForm = this.fb.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [true]
  });

  fillDemo(role: 'patient' | 'doctor' | 'receptionist' | 'admin'): void {
    const demoPassword = 'Password123!';
    switch (role) {
      case 'patient':
        this.loginForm.patchValue({ identifier: 'patient@sehati.com', password: demoPassword });
        break;
      case 'doctor':
        this.loginForm.patchValue({ identifier: 'doctor@sehati.com', password: demoPassword });
        break;
      case 'receptionist':
        this.loginForm.patchValue({ identifier: 'receptionist@sehati.com', password: demoPassword });
        break;
      case 'admin':
        this.loginForm.patchValue({ identifier: 'admin@sehati.com', password: demoPassword });
        break;
    }
  }

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

    const val = this.loginForm.value;

    this.authService.login({
      identifier: val.identifier!,
      password: val.password!
    }).subscribe({
      next: () => {
        this.isLoading = false;
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message ||
          (this.langService.isRtl() ? 'بيانات تسجيل الدخول غير صحيحة، يرجى التحقق وإعادة المحاولة.' : 'Invalid credentials. Please verify your details.');
      }
    });
  }
}
