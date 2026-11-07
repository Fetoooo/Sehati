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
      <!-- Top Navigation Switcher Tabs (Buttons to Navigate Between Login & Register) -->
      <div class="auth-navigation-tabs">
        <a routerLink="/auth/login" class="nav-tab-pill active">
          <span class="material-symbols-outlined tab-icon">login</span>
          <span>{{ langService.t('signInBtn') }}</span>
        </a>
        <a routerLink="/auth/register" class="nav-tab-pill">
          <span class="material-symbols-outlined tab-icon">person_add</span>
          <span>{{ langService.t('createAccountLink') }}</span>
        </a>
      </div>

      <!-- Main Login Card -->
      <div class="auth-glass-card">
        <!-- Card Titles -->
        <div class="card-header-block">
          <span class="header-mini-badge">
            <span class="badge-dot"></span>
            <span>{{ langService.isRtl() ? 'المنظومة الوطنية الموحدة' : 'National Health Cloud' }}</span>
          </span>
          <h1 class="card-main-title">{{ langService.t('loginTitle') }}</h1>
          <p class="card-subtitle">{{ langService.t('loginSubtitle') }}</p>
        </div>

        <!-- Quick 1-Click Demo Accounts Selector -->
        <div class="demo-quick-box">
          <div class="demo-box-label">
            <span class="material-symbols-outlined label-icon">smart_toy</span>
            <span>{{ langService.isRtl() ? 'تجربة سريعة بضغطة زر واحدة:' : 'Quick 1-Click Demo Fill:' }}</span>
          </div>
          <div class="demo-pills-wrap">
            <button type="button" class="demo-chip chip-patient" (click)="fillDemo('patient')">
              <span class="material-symbols-outlined chip-icon">person</span>
              <span>{{ langService.isRtl() ? 'مريض تجريبي' : 'Patient' }}</span>
            </button>
            <button type="button" class="demo-chip chip-doctor" (click)="fillDemo('doctor')">
              <span class="material-symbols-outlined chip-icon">stethoscope</span>
              <span>{{ langService.isRtl() ? 'طبيب' : 'Doctor' }}</span>
            </button>
            <button type="button" class="demo-chip chip-reception" (click)="fillDemo('receptionist')">
              <span class="material-symbols-outlined chip-icon">desk</span>
              <span>{{ langService.isRtl() ? 'استقبال' : 'Reception' }}</span>
            </button>
            <button type="button" class="demo-chip chip-admin" (click)="fillDemo('admin')">
              <span class="material-symbols-outlined chip-icon">admin_panel_settings</span>
              <span>{{ langService.isRtl() ? 'مدير' : 'Admin' }}</span>
            </button>
          </div>
        </div>

        <!-- Error Alert -->
        <div class="auth-error-banner" *ngIf="errorMessage">
          <span class="material-symbols-outlined">error</span>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Login Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <!-- Identifier Input -->
          <div class="form-field-group">
            <label class="field-label" for="identifier">
              <span>{{ langService.t('identifierLabel') }}</span>
              <span class="required-star">*</span>
            </label>
            <div class="field-input-box">
              <span class="material-symbols-outlined field-icon">alternate_email</span>
              <input
                id="identifier"
                type="text"
                formControlName="identifier"
                class="form-input"
                [class.invalid]="isFieldInvalid('identifier')"
                [placeholder]="langService.t('identifierPlaceholder')"
                autocomplete="username"
              />
            </div>
            <div class="field-error-text" *ngIf="isFieldInvalid('identifier')">
              {{ langService.isRtl() ? 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف المسجل.' : 'Please enter your registered email or phone number.' }}
            </div>
          </div>

          <!-- Password Input -->
          <div class="form-field-group">
            <div class="label-with-link">
              <label class="field-label" for="password">
                <span>{{ langService.t('passwordLabel') }}</span>
                <span class="required-star">*</span>
              </label>
            </div>
            <div class="field-input-box">
              <span class="material-symbols-outlined field-icon">lock</span>
              <input
                id="password"
                [type]="showPassword ? 'text' : 'password'"
                formControlName="password"
                class="form-input"
                [class.invalid]="isFieldInvalid('password')"
                [placeholder]="langService.t('passwordPlaceholder')"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="eye-toggle-btn"
                (click)="showPassword = !showPassword"
                [title]="showPassword ? 'Hide password' : 'Show password'"
              >
                <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
            <div class="field-error-text" *ngIf="isFieldInvalid('password')">
              {{ langService.isRtl() ? 'كلمة المرور مطلوبة (8 أحرف على الأقل).' : 'Password is required (min 8 characters).' }}
            </div>
          </div>

          <!-- Options Row -->
          <div class="options-row">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="rememberMe" class="custom-checkbox" />
              <span>{{ langService.t('rememberMe') }}</span>
            </label>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="btn-submit-login" [disabled]="loginForm.invalid || isLoading">
            <span class="spinner-dot" *ngIf="isLoading"></span>
            <span *ngIf="!isLoading">{{ langService.t('signInBtn') }}</span>
            <span class="material-symbols-outlined flip-rtl" *ngIf="!isLoading">arrow_forward</span>
          </button>
        </form>

        <!-- Reciprocal Navigation Helper to Register Page -->
        <div class="card-bottom-navigation">
          <div class="register-prompt">
            <span>{{ langService.t('dontHaveAccount') }}</span>
            <a routerLink="/auth/register" class="btn-goto-register">
              <span>{{ langService.t('createAccountLink') }}</span>
              <span class="material-symbols-outlined flip-rtl">arrow_forward</span>
            </a>
          </div>

          <div class="quick-assist-links">
            <a routerLink="/" class="assist-link">
              <span class="material-symbols-outlined">home</span>
              <span>{{ langService.isRtl() ? 'الرئيسية' : 'Homepage' }}</span>
            </a>
            <span>•</span>
            <a routerLink="/preview" class="assist-link">
              <span class="material-symbols-outlined">architecture</span>
              <span>{{ langService.t('architectureShowcase') }}</span>
            </a>
            <span>•</span>
            <a routerLink="/emergency" class="assist-link text-red">
              <span class="material-symbols-outlined">emergency</span>
              <span>{{ langService.isRtl() ? 'طوارئ QR' : 'Emergency QR' }}</span>
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

    /* Top Navigation Tabs */
    .auth-navigation-tabs {
      display: flex;
      background: var(--color-surface-card, #FFFFFF);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      border-radius: 9999px;
      padding: 0.35rem;
      box-shadow: 0 4px 14px rgba(8, 131, 149, 0.05);
    }

    :host-context([data-theme="dark"]) .auth-navigation-tabs,
    :host-context(.dark-theme) .auth-navigation-tabs {
      background: #082635;
      border-color: rgba(5, 191, 219, 0.2);
    }

    .nav-tab-pill {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.65rem 1rem;
      border-radius: 9999px;
      font-size: 0.92rem;
      font-weight: 800;
      text-decoration: none;
      color: var(--color-text-muted, #64748B);
      transition: all 0.25s ease;
    }

    .nav-tab-pill:hover {
      color: var(--color-primary-base, #088395);
    }

    .nav-tab-pill.active {
      background: var(--color-primary-base, #088395);
      color: #FFFFFF;
      box-shadow: 0 4px 14px rgba(8, 131, 149, 0.3);
    }

    .tab-icon {
      font-size: 1.15rem;
    }

    /* Main Glass Card */
    .auth-glass-card {
      background: var(--color-surface-card, #FFFFFF);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      border-radius: 28px;
      padding: 2.25rem;
      box-shadow: 0 16px 36px -8px rgba(8, 131, 149, 0.1), 0 4px 12px rgba(0, 0, 0, 0.03);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      transition: all 0.3s ease;
    }

    :host-context([data-theme="dark"]) .auth-glass-card,
    :host-context(.dark-theme) .auth-glass-card {
      background: #082635;
      border-color: rgba(5, 191, 219, 0.22);
      box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.6);
    }

    .card-header-block {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .header-mini-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.78rem;
      font-weight: 800;
      color: #059669;
      background: rgba(16, 185, 129, 0.1);
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      width: fit-content;
      margin-bottom: 0.25rem;
    }

    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10B981;
    }

    .card-main-title {
      font-size: 1.85rem;
      font-weight: 900;
      color: var(--color-text-main, #0F172A);
      letter-spacing: -0.5px;
      margin: 0;
    }

    .card-subtitle {
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--color-text-muted, #64748B);
      margin: 0;
    }

    /* Demo Quick Box */
    .demo-quick-box {
      background: rgba(8, 131, 149, 0.04);
      border: 1px dashed rgba(8, 131, 149, 0.25);
      border-radius: 16px;
      padding: 0.85rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .demo-box-label {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.78rem;
      font-weight: 800;
      color: var(--color-primary-base, #088395);
      letter-spacing: 0.5px;
    }

    .label-icon {
      font-size: 1rem;
    }

    .demo-pills-wrap {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .demo-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: var(--color-surface-card, #FFFFFF);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      border-radius: 9999px;
      padding: 0.35rem 0.75rem;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      color: var(--color-text-main, #0F172A);
      transition: all 0.2s ease;
    }

    :host-context([data-theme="dark"]) .demo-chip,
    :host-context(.dark-theme) .demo-chip {
      background: #0B3347;
      border-color: rgba(5, 191, 219, 0.25);
    }

    .demo-chip:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
      border-color: var(--color-primary-base, #088395);
    }

    .chip-icon {
      font-size: 0.95rem;
    }

    .chip-patient:hover { color: #088395; border-color: #088395; }
    .chip-doctor:hover { color: #10B981; border-color: #10B981; }
    .chip-reception:hover { color: #8B5CF6; border-color: #8B5CF6; }
    .chip-admin:hover { color: #475569; border-color: #475569; }

    /* Error Alert */
    .auth-error-banner {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #DC2626;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      font-size: 0.88rem;
      font-weight: 600;
    }

    /* Form Fields */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-field-group {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .field-label {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--color-text-main, #0F172A);
    }

    .required-star {
      color: #EF4444;
    }

    .field-input-box {
      position: relative;
      display: flex;
      align-items: center;
    }

    .field-icon {
      position: absolute;
      left: 1rem;
      color: var(--color-text-muted, #64748B);
      font-size: 1.25rem;
      pointer-events: none;
    }

    .form-input {
      width: 100%;
      padding: 0.85rem 1rem 0.85rem 3rem;
      border-radius: 14px;
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      background: var(--color-bg-app, #FAFCFB);
      color: var(--color-text-main, #0F172A);
      font-size: 0.95rem;
      transition: all 0.2s ease;
    }

    :host-context([data-theme="dark"]) .form-input,
    :host-context(.dark-theme) .form-input {
      background: #031B26;
      border-color: rgba(5, 191, 219, 0.2);
    }

    .form-input:focus {
      outline: none;
      border-color: var(--color-primary-base, #088395);
      background: var(--color-surface-card, #FFFFFF);
      box-shadow: 0 0 0 3px rgba(8, 131, 149, 0.15);
    }

    .form-input.invalid {
      border-color: #EF4444;
    }

    .eye-toggle-btn {
      position: absolute;
      right: 0.85rem;
      background: transparent;
      border: none;
      color: var(--color-text-muted, #64748B);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
    }

    .eye-toggle-btn:hover {
      color: var(--color-primary-base, #088395);
    }

    .field-error-text {
      font-size: 0.8rem;
      color: #EF4444;
      font-weight: 600;
    }

    /* RTL specific input alignment */
    :host-context(.rtl) .field-input-box,
    :host-context([dir="rtl"]) .field-input-box {
      .field-icon {
        left: auto;
        right: 1rem;
      }
      .form-input {
        padding: 0.85rem 3rem 0.85rem 1rem;
      }
      .eye-toggle-btn {
        right: auto;
        left: 0.85rem;
      }
    }

    .options-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .checkbox-label {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.88rem;
      color: var(--color-text-muted, #64748B);
      cursor: pointer;
    }

    .custom-checkbox {
      accent-color: var(--color-primary-base, #088395);
      width: 16px;
      height: 16px;
    }

    /* Submit Button */
    .btn-submit-login {
      width: 100%;
      padding: 0.95rem 1.5rem;
      border-radius: 9999px;
      border: none;
      background: var(--color-primary-base, #088395);
      color: #FFFFFF;
      font-size: 1.05rem;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(8, 131, 149, 0.3);
      transition: all 0.25s ease;
      margin-top: 0.25rem;
    }

    .btn-submit-login:hover:not(:disabled) {
      background: var(--color-primary-dark, #0A4D68);
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(8, 131, 149, 0.4);
    }

    .btn-submit-login:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner-dot {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Bottom Navigation to Register */
    .card-bottom-navigation {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
      border-top: 1px solid var(--color-border-subtle, #E2E8F0);
      padding-top: 1.5rem;
    }

    .register-prompt {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.92rem;
      color: var(--color-text-muted, #64748B);
      flex-wrap: wrap;
      justify-content: center;
    }

    .btn-goto-register {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.45rem 1rem;
      border-radius: 9999px;
      background: rgba(8, 131, 149, 0.08);
      border: 1px solid rgba(8, 131, 149, 0.2);
      color: var(--color-primary-base, #088395);
      font-weight: 800;
      font-size: 0.88rem;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-goto-register:hover {
      background: rgba(8, 131, 149, 0.16);
      transform: translateY(-1px);
    }

    .quick-assist-links {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.82rem;
      color: var(--color-text-muted, #64748B);
      flex-wrap: wrap;
      justify-content: center;
    }

    .assist-link {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--color-text-muted, #64748B);
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s ease;
    }

    .assist-link:hover {
      color: var(--color-primary-base, #088395);
    }

    .assist-link.text-red {
      color: #EF4444;
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
          (this.langService.isRtl() ? 'بيانات تسجيل الدخول غير صحيحة، يرجى التحقق وإعادة المحاولة.' : 'Invalid credentials provided.');
      }
    });
  }
}
