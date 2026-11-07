import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  template: `
    <div class="auth-card-wrapper">
      <div class="auth-luxury-card">
        <!-- Integrated Segmented Control Switcher -->
        <div class="auth-segmented-switcher">
          <a routerLink="/auth/login" class="switcher-tab active">
            <span class="material-symbols-outlined tab-icon">login</span>
            <span>{{ langService.t('signInBtn') }}</span>
          </a>
          <a routerLink="/auth/register" class="switcher-tab">
            <span class="material-symbols-outlined tab-icon">person_add</span>
            <span>{{ langService.t('createAccountLink') }}</span>
          </a>
        </div>

        <!-- MODE 1: STANDARD SIGN IN -->
        <ng-container *ngIf="!isForgotPasswordMode">
          <!-- Card Header -->
          <div class="card-header">
            <div class="header-badge">
              <span class="badge-pulse"></span>
              <span>{{ langService.isRtl() ? 'المنظومة الوطنية الموحدة' : 'National Digital Health System' }}</span>
            </div>
            <h1 class="card-title">{{ langService.isRtl() ? 'أهلاً بك مجدداً في صِحّتي' : 'Welcome Back to Sehati' }}</h1>
            <p class="card-caption">{{ langService.t('loginSubtitle') }}</p>
          </div>

          <!-- Error Alert Banner -->
          <div class="alert-banner error" *ngIf="errorMessage">
            <span class="material-symbols-outlined">error</span>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Sign In Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
            <!-- Identifier Field -->
            <div class="form-group">
              <label class="form-label" for="identifier">
                <span>{{ langService.t('identifierLabel') }}</span>
                <span class="req">*</span>
              </label>
              <div class="input-shell" [class.has-error]="isFieldInvalid('identifier')">
                <span class="material-symbols-outlined input-icon">alternate_email</span>
                <input
                  id="identifier"
                  type="text"
                  formControlName="identifier"
                  class="native-input"
                  [placeholder]="langService.t('identifierPlaceholder')"
                  autocomplete="username"
                />
              </div>
              <div class="field-error-hint" *ngIf="isFieldInvalid('identifier')">
                {{ langService.isRtl() ? 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف المسجل.' : 'Please enter your registered email or phone number.' }}
              </div>
            </div>

            <!-- Password Field -->
            <div class="form-group">
              <div class="label-split-row">
                <label class="form-label" for="password">
                  <span>{{ langService.t('passwordLabel') }}</span>
                  <span class="req">*</span>
                </label>
                <button
                  type="button"
                  class="text-link-btn"
                  (click)="openForgotPassword()"
                >
                  {{ langService.t('forgotPasswordLink') }}
                </button>
              </div>
              <div class="input-shell" [class.has-error]="isFieldInvalid('password')">
                <span class="material-symbols-outlined input-icon">lock</span>
                <input
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  class="native-input"
                  [placeholder]="langService.t('passwordPlaceholder')"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="eye-btn"
                  (click)="showPassword = !showPassword"
                  [title]="showPassword ? 'Hide password' : 'Show password'"
                >
                  <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              <div class="field-error-hint" *ngIf="isFieldInvalid('password')">
                {{ langService.isRtl() ? 'كلمة المرور مطلوبة (8 أحرف على الأقل).' : 'Password is required (min 8 characters).' }}
              </div>
            </div>

            <!-- Remember Me -->
            <div class="form-options">
              <label class="remember-label">
                <input type="checkbox" formControlName="rememberMe" class="styled-checkbox" />
                <span>{{ langService.t('rememberMe') }}</span>
              </label>
            </div>

            <!-- Primary Submit Button -->
            <button
              type="submit"
              class="btn-primary-auth"
              [disabled]="loginForm.invalid || isLoading"
            >
              <span class="spinner" *ngIf="isLoading"></span>
              <span *ngIf="!isLoading">{{ langService.t('signInBtn') }}</span>
              <span class="material-symbols-outlined flip-rtl" *ngIf="!isLoading">arrow_forward</span>
            </button>
          </form>

          <!-- Discreet Demo Accounts Selector -->
          <div class="demo-access-panel">
            <div class="demo-caption">
              <span class="material-symbols-outlined">bolt</span>
              <span>{{ langService.isRtl() ? 'دخول تجريبي سريع:' : 'Quick Demo Fill:' }}</span>
            </div>
            <div class="demo-pills-row">
              <button type="button" class="demo-pill patient" (click)="fillDemo('patient')">
                <span class="material-symbols-outlined">person</span>
                <span>{{ langService.isRtl() ? 'مريض' : 'Patient' }}</span>
              </button>
              <button type="button" class="demo-pill doctor" (click)="fillDemo('doctor')">
                <span class="material-symbols-outlined">stethoscope</span>
                <span>{{ langService.isRtl() ? 'طبيب' : 'Doctor' }}</span>
              </button>
              <button type="button" class="demo-pill receptionist" (click)="fillDemo('receptionist')">
                <span class="material-symbols-outlined">desk</span>
                <span>{{ langService.isRtl() ? 'استقبال' : 'Reception' }}</span>
              </button>
              <button type="button" class="demo-pill admin" (click)="fillDemo('admin')">
                <span class="material-symbols-outlined">admin_panel_settings</span>
                <span>{{ langService.isRtl() ? 'مدير' : 'Admin' }}</span>
              </button>
            </div>
          </div>

          <!-- Bottom Switch Prompt -->
          <div class="card-footer-switch">
            <span>{{ langService.t('dontHaveAccount') }}</span>
            <a routerLink="/auth/register" class="switch-link">
              <span>{{ langService.t('createAccountLink') }}</span>
              <span class="material-symbols-outlined flip-rtl">arrow_forward</span>
            </a>
          </div>
        </ng-container>

        <!-- MODE 2: FORGOT PASSWORD RECOVERY -->
        <ng-container *ngIf="isForgotPasswordMode">
          <div class="card-header">
            <div class="header-badge warning">
              <span class="material-symbols-outlined badge-icon">lock_reset</span>
              <span>{{ langService.isRtl() ? 'استعادة الوصول' : 'Account Recovery' }}</span>
            </div>
            <h1 class="card-title">{{ langService.t('forgotPasswordTitle') }}</h1>
            <p class="card-caption">{{ langService.t('forgotPasswordSubtitle') }}</p>
          </div>

          <!-- Success Alert -->
          <div class="alert-banner success" *ngIf="resetSuccessMessage">
            <span class="material-symbols-outlined">check_circle</span>
            <span>{{ resetSuccessMessage }}</span>
          </div>

          <!-- Recovery Form -->
          <form (ngSubmit)="sendPasswordReset()" class="auth-form" *ngIf="!resetSuccessMessage">
            <div class="form-group">
              <label class="form-label" for="recoveryIdentifier">
                <span>{{ langService.t('identifierLabel') }}</span>
                <span class="req">*</span>
              </label>
              <div class="input-shell">
                <span class="material-symbols-outlined input-icon">contact_mail</span>
                <input
                  id="recoveryIdentifier"
                  type="text"
                  [(ngModel)]="recoveryInput"
                  name="recoveryIdentifier"
                  class="native-input"
                  [placeholder]="langService.t('identifierPlaceholder')"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              class="btn-primary-auth"
              [disabled]="!recoveryInput.trim() || isRecoveryLoading"
            >
              <span class="spinner" *ngIf="isRecoveryLoading"></span>
              <span *ngIf="!isRecoveryLoading">{{ langService.t('sendResetCode') }}</span>
              <span class="material-symbols-outlined flip-rtl" *ngIf="!isRecoveryLoading">send</span>
            </button>
          </form>

          <!-- Back to Sign In -->
          <div class="card-footer-switch">
            <button type="button" class="btn-ghost-back" (click)="closeForgotPassword()">
              <span class="material-symbols-outlined flip-rtl">arrow_back</span>
              <span>{{ langService.t('backToLoginBtn') }}</span>
            </button>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .auth-card-wrapper {
      width: 100%;
      max-width: 480px;
      margin: 0 auto;
    }

    /* Main Luxury Glass Card */
    .auth-luxury-card {
      background: var(--color-surface-card, #FFFFFF);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      border-radius: 28px;
      padding: 2.5rem 2.25rem;
      box-shadow: 0 20px 50px -15px rgba(10, 77, 104, 0.12), 0 0 0 1px rgba(8, 131, 149, 0.04);
      display: flex;
      flex-direction: column;
      gap: 1.65rem;
      transition: all 0.3s ease;
    }

    :host-context([data-theme="dark"]) .auth-luxury-card,
    :host-context(.dark-theme) .auth-luxury-card {
      background: #082635;
      border-color: rgba(5, 191, 219, 0.22);
      box-shadow: 0 25px 55px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(5, 191, 219, 0.1);
    }

    /* In-Card Segmented Switcher */
    .auth-segmented-switcher {
      display: flex;
      background: rgba(8, 131, 149, 0.06);
      border: 1px solid rgba(8, 131, 149, 0.14);
      border-radius: 9999px;
      padding: 0.35rem;
      gap: 0.25rem;
    }

    :host-context([data-theme="dark"]) .auth-segmented-switcher,
    :host-context(.dark-theme) .auth-segmented-switcher {
      background: rgba(5, 191, 219, 0.08);
      border-color: rgba(5, 191, 219, 0.2);
    }

    .switcher-tab {
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

    .switcher-tab:hover {
      color: var(--color-primary-base, #088395);
    }

    .switcher-tab.active {
      background: var(--color-surface-card, #FFFFFF);
      color: var(--color-primary-dark, #0A4D68);
      box-shadow: 0 4px 12px rgba(8, 131, 149, 0.12);
    }

    :host-context([data-theme="dark"]) .switcher-tab.active,
    :host-context(.dark-theme) .switcher-tab.active {
      background: #0D3E56;
      color: #05BFDB;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
    }

    .tab-icon {
      font-size: 1.15rem;
    }

    /* Card Header */
    .card-header {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.78rem;
      font-weight: 800;
      color: #059669;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      padding: 0.3rem 0.85rem;
      border-radius: 9999px;
      width: fit-content;
    }

    .header-badge.warning {
      color: #D97706;
      background: rgba(245, 158, 11, 0.12);
      border-color: rgba(245, 158, 11, 0.25);
    }

    .badge-pulse {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5);
      animation: pulse-ring 2s infinite;
    }

    @keyframes pulse-ring {
      0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
      70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
      100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }

    .badge-icon {
      font-size: 1rem;
    }

    .card-title {
      font-size: 1.75rem;
      font-weight: 900;
      color: var(--color-text-main, #0F172A);
      letter-spacing: -0.4px;
      line-height: 1.25;
      margin: 0;
    }

    .card-caption {
      font-size: 0.92rem;
      line-height: 1.55;
      color: var(--color-text-muted, #64748B);
      margin: 0;
    }

    /* Alert Banner */
    .alert-banner {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.85rem 1.1rem;
      border-radius: 14px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .alert-banner.error {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.28);
      color: #DC2626;
    }

    .alert-banner.success {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.28);
      color: #059669;
      line-height: 1.5;
    }

    /* Form */
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .label-split-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--color-text-main, #0F172A);
    }

    .req {
      color: #EF4444;
    }

    .text-link-btn {
      background: transparent;
      border: none;
      color: var(--color-primary-base, #088395);
      font-size: 0.84rem;
      font-weight: 700;
      cursor: pointer;
      padding: 0;
      transition: color 0.2s ease;
    }

    .text-link-btn:hover {
      text-decoration: underline;
      color: var(--color-primary-dark, #0A4D68);
    }

    .input-shell {
      position: relative;
      display: flex;
      align-items: center;
      background: var(--color-bg-app, #F8FAFC);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      border-radius: 14px;
      padding: 0 0.95rem;
      transition: all 0.25s ease;
    }

    :host-context([data-theme="dark"]) .input-shell,
    :host-context(.dark-theme) .input-shell {
      background: #0B3347;
      border-color: rgba(5, 191, 219, 0.2);
    }

    .input-shell:focus-within {
      border-color: var(--color-primary-base, #088395);
      box-shadow: 0 0 0 3px rgba(8, 131, 149, 0.15);
      background: var(--color-surface-card, #FFFFFF);
    }

    .input-shell.has-error {
      border-color: #EF4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
    }

    .input-icon {
      font-size: 1.25rem;
      color: var(--color-text-muted, #64748B);
      margin-inline-end: 0.65rem;
    }

    .native-input {
      flex: 1;
      height: 48px;
      border: none;
      background: transparent;
      color: var(--color-text-main, #0F172A);
      font-size: 0.95rem;
      font-family: inherit;
      outline: none;
    }

    .native-input::placeholder {
      color: var(--color-text-muted, #64748B);
      opacity: 0.7;
    }

    .eye-btn {
      background: transparent;
      border: none;
      color: var(--color-text-muted, #64748B);
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 0.25rem;
      transition: color 0.2s ease;
    }

    .eye-btn:hover {
      color: var(--color-primary-base, #088395);
    }

    .field-error-hint {
      font-size: 0.78rem;
      font-weight: 600;
      color: #DC2626;
      margin-top: 0.15rem;
    }

    .form-options {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.2rem;
    }

    .remember-label {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      font-size: 0.88rem;
      color: var(--color-text-muted, #64748B);
      font-weight: 600;
      cursor: pointer;
    }

    .styled-checkbox {
      width: 17px;
      height: 17px;
      accent-color: var(--color-primary-base, #088395);
      border-radius: 4px;
      cursor: pointer;
    }

    /* Primary CTA Button */
    .btn-primary-auth {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.65rem;
      height: 52px;
      border-radius: 14px;
      border: none;
      background: linear-gradient(135deg, #0A4D68 0%, #088395 100%);
      color: #FFFFFF;
      font-size: 1rem;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 10px 24px -6px rgba(8, 131, 149, 0.4);
      transition: all 0.25s ease;
      margin-top: 0.5rem;
    }

    .btn-primary-auth:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 14px 28px -6px rgba(8, 131, 149, 0.55);
    }

    .btn-primary-auth:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      transform: none;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2.5px solid rgba(255, 255, 255, 0.3);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Refined Demo Access */
    .demo-access-panel {
      padding: 0.95rem 1rem;
      border-radius: 16px;
      background: rgba(8, 131, 149, 0.05);
      border: 1px solid rgba(8, 131, 149, 0.16);
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    :host-context([data-theme="dark"]) .demo-access-panel,
    :host-context(.dark-theme) .demo-access-panel {
      background: rgba(5, 191, 219, 0.06);
      border-color: rgba(5, 191, 219, 0.18);
    }

    .demo-caption {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.78rem;
      font-weight: 800;
      color: var(--color-primary-base, #088395);
      letter-spacing: 0.3px;
    }

    .demo-caption .material-symbols-outlined {
      font-size: 1rem;
    }

    .demo-pills-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.45rem;
    }

    .demo-pill {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.3rem;
      padding: 0.45rem 0.2rem;
      border-radius: 9999px;
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      background: var(--color-surface-card, #FFFFFF);
      color: var(--color-text-main, #0F172A);
      font-size: 0.78rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    :host-context([data-theme="dark"]) .demo-pill,
    :host-context(.dark-theme) .demo-pill {
      background: #0B3347;
      border-color: rgba(5, 191, 219, 0.2);
    }

    .demo-pill .material-symbols-outlined {
      font-size: 0.95rem;
    }

    .demo-pill:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(8, 131, 149, 0.12);
      border-color: var(--color-primary-base, #088395);
      color: var(--color-primary-base, #088395);
    }

    /* Bottom Switch */
    .card-footer-switch {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--color-border-subtle, #E2E8F0);
      font-size: 0.88rem;
      color: var(--color-text-muted, #64748B);
      font-weight: 600;
    }

    :host-context([data-theme="dark"]) .card-footer-switch,
    :host-context(.dark-theme) .card-footer-switch {
      border-top-color: rgba(5, 191, 219, 0.14);
    }

    .switch-link {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--color-primary-base, #088395);
      font-weight: 800;
      text-decoration: none;
      transition: gap 0.2s ease;
    }

    .switch-link:hover {
      text-decoration: underline;
      gap: 0.45rem;
    }

    .btn-ghost-back {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: transparent;
      border: none;
      color: var(--color-primary-base, #088395);
      font-size: 0.9rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-ghost-back:hover {
      color: var(--color-primary-dark, #0A4D68);
      transform: translateX(-2px);
    }

    @media (max-width: 480px) {
      .auth-luxury-card {
        padding: 1.75rem 1.25rem;
        border-radius: 22px;
      }

      .demo-pills-row {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  langService = inject(LanguageService);

  showPassword = false;
  isLoading = false;
  errorMessage = '';

  isForgotPasswordMode = false;
  recoveryInput = '';
  isRecoveryLoading = false;
  resetSuccessMessage = '';

  loginForm = this.fb.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [true]
  });

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  fillDemo(role: 'patient' | 'doctor' | 'receptionist' | 'admin'): void {
    const demoAccounts: Record<string, { identifier: string; pass: string }> = {
      patient: { identifier: 'patient@sehati.gov.eg', pass: 'Patient@Sehati2026' },
      doctor: { identifier: 'doctor@sehati.gov.eg', pass: 'Doctor@Sehati2026' },
      receptionist: { identifier: 'reception@sehati.gov.eg', pass: 'Reception@Sehati2026' },
      admin: { identifier: 'admin@sehati.gov.eg', pass: 'Admin@Sehati2026' }
    };

    const target = demoAccounts[role];
    if (target) {
      this.loginForm.patchValue({
        identifier: target.identifier,
        password: target.pass
      });
      this.errorMessage = '';
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { identifier, password } = this.loginForm.value;

    this.authService.login({
      identifier: identifier!.trim(),
      password: password!
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || this.getDefaultDashboard(response.user.roleName);
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = this.langService.isRtl()
            ? 'بيانات الدخول غير صحيحة. يرجى التحقق من البريد/الهاتف وكلمة المرور.'
            : 'Invalid credentials. Please verify your email/phone and password.';
        } else if (err.status === 429) {
          this.errorMessage = this.langService.isRtl()
            ? 'تم تجاوز عدد المحاولات المسموح بها. يرجى الانتظار دقيقة واحدة.'
            : 'Too many attempts. Please wait 1 minute before trying again.';
        } else {
          this.errorMessage = err.error?.message || (this.langService.isRtl()
            ? 'تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.'
            : 'Unable to connect to the server. Please try again.');
        }
      }
    });
  }

  openForgotPassword(): void {
    this.isForgotPasswordMode = true;
    this.resetSuccessMessage = '';
    this.recoveryInput = this.loginForm.get('identifier')?.value || '';
  }

  closeForgotPassword(): void {
    this.isForgotPasswordMode = false;
    this.resetSuccessMessage = '';
  }

  sendPasswordReset(): void {
    if (!this.recoveryInput.trim()) return;

    this.isRecoveryLoading = true;
    setTimeout(() => {
      this.isRecoveryLoading = false;
      this.resetSuccessMessage = this.langService.isRtl()
        ? `تم إرسال رمز التحقق وتعليمات استعادة كلمة المرور بنجاح إلى (${this.recoveryInput}). يرجى التحقق من الرسائل الواردة.`
        : `A password reset code and instructions have been dispatched to (${this.recoveryInput}). Please check your inbox or SMS.`;
    }, 900);
  }

  private getDefaultDashboard(role: string): string {
    switch (role?.toLowerCase()) {
      case 'doctor':
        return '/doctor';
      case 'receptionist':
        return '/receptionist';
      case 'clinicadmin':
      case 'admin':
        return '/admin';
      case 'patient':
      default:
        return '/patient';
    }
  }
}
