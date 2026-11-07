import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { RegisterRequestDto, UserRole } from '../../../core/models/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-card-container register-container">
      <!-- Top Navigation Switcher Tabs (Buttons to Navigate Between Login & Register) -->
      <div class="auth-navigation-tabs">
        <a routerLink="/auth/login" class="nav-tab-pill">
          <span class="material-symbols-outlined tab-icon">login</span>
          <span>{{ langService.t('signInBtn') }}</span>
        </a>
        <a routerLink="/auth/register" class="nav-tab-pill active">
          <span class="material-symbols-outlined tab-icon">person_add</span>
          <span>{{ langService.t('createAccountLink') }}</span>
        </a>
      </div>

      <!-- Main Register Card -->
      <div class="auth-glass-card">
        <!-- Card Titles -->
        <div class="card-header-block">
          <span class="header-mini-badge">
            <span class="badge-dot"></span>
            <span>{{ langService.isRtl() ? 'إصدار الجواز الصحي الموحد' : 'Claim Your Unified Health Passport' }}</span>
          </span>
          <h1 class="card-main-title">{{ langService.t('registerTitle') }}</h1>
          <p class="card-subtitle">{{ langService.t('registerSubtitle') }}</p>
        </div>

        <!-- Role Selector Cards -->
        <div class="role-selector-block">
          <label class="role-selection-prompt">
            {{ langService.isRtl() ? 'اختر فئة الحساب في المنظومة:' : 'Select Account Persona:' }}
          </label>
          <div class="roles-cards-row">
            <button
              type="button"
              class="role-badge-btn"
              [class.active]="selectedRole === 'Patient'"
              (click)="selectRole('Patient')"
            >
              <div class="role-icon-box teal">
                <span class="material-symbols-outlined">person</span>
              </div>
              <div class="role-meta">
                <span class="role-name">{{ langService.t('rolePatient') }}</span>
                <span class="role-caption">{{ langService.isRtl() ? 'جواز صحي موحد' : 'Health Passport' }}</span>
              </div>
            </button>

            <button
              type="button"
              class="role-badge-btn"
              [class.active]="selectedRole === 'Doctor'"
              (click)="selectRole('Doctor')"
            >
              <div class="role-icon-box emerald">
                <span class="material-symbols-outlined">stethoscope</span>
              </div>
              <div class="role-meta">
                <span class="role-name">{{ langService.t('roleDoctor') }}</span>
                <span class="role-caption">{{ langService.isRtl() ? 'عيادة وروشتات' : 'Clinical Practice' }}</span>
              </div>
            </button>

            <button
              type="button"
              class="role-badge-btn"
              [class.active]="selectedRole === 'Receptionist'"
              (click)="selectRole('Receptionist')"
            >
              <div class="role-icon-box indigo">
                <span class="material-symbols-outlined">desk</span>
              </div>
              <div class="role-meta">
                <span class="role-name">{{ langService.t('roleReceptionist') }}</span>
                <span class="role-caption">{{ langService.isRtl() ? 'إدارة الدخول' : 'Desk & Queue' }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Error Alert -->
        <div class="auth-error-banner" *ngIf="errorMessage">
          <span class="material-symbols-outlined">error</span>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Register Form -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
          <!-- Row 1: Full Name & National ID -->
          <div class="form-grid-2">
            <!-- Full Name -->
            <div class="form-field-group">
              <label class="field-label" for="fullName">
                <span>{{ langService.t('fullNameLabel') }}</span>
                <span class="required-star">*</span>
              </label>
              <div class="field-input-box">
                <span class="material-symbols-outlined field-icon">badge</span>
                <input
                  id="fullName"
                  type="text"
                  formControlName="fullName"
                  class="form-input"
                  [class.invalid]="isFieldInvalid('fullName')"
                  [placeholder]="langService.isRtl() ? 'مثال: أحمد محمود حسن' : 'e.g. Ahmed Mahmoud Hassan'"
                  autocomplete="name"
                />
              </div>
              <div class="field-error-text" *ngIf="isFieldInvalid('fullName')">
                {{ langService.isRtl() ? 'الاسم بالكامل مطلوب (3 أحرف على الأقل).' : 'Full name is required (min 3 chars).' }}
              </div>
            </div>

            <!-- National ID -->
            <div class="form-field-group">
              <label class="field-label" for="nationalId">
                <span>{{ langService.t('nationalIdLabel') }}</span>
                <span class="required-star">*</span>
              </label>
              <div class="field-input-box">
                <span class="material-symbols-outlined field-icon">pin</span>
                <input
                  id="nationalId"
                  type="text"
                  formControlName="nationalId"
                  class="form-input font-mono"
                  [class.invalid]="isFieldInvalid('nationalId')"
                  placeholder="29805121601234"
                  maxlength="14"
                />
              </div>
              <div class="field-error-text" *ngIf="isFieldInvalid('nationalId')">
                {{ langService.isRtl() ? 'الرقم القومي يجب أن يتكون من 14 رقماً بالضبط.' : 'National ID must be exactly 14 digits.' }}
              </div>
            </div>
          </div>

          <!-- Row 2: Email & Phone Number -->
          <div class="form-grid-2">
            <!-- Email -->
            <div class="form-field-group">
              <label class="field-label" for="email">
                <span>{{ langService.t('emailLabel') }}</span>
                <span class="required-star">*</span>
              </label>
              <div class="field-input-box">
                <span class="material-symbols-outlined field-icon">mail</span>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="form-input"
                  [class.invalid]="isFieldInvalid('email')"
                  placeholder="user@sehati.com"
                  autocomplete="email"
                />
              </div>
              <div class="field-error-text" *ngIf="isFieldInvalid('email')">
                {{ langService.isRtl() ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'Please enter a valid email address.' }}
              </div>
            </div>

            <!-- Phone Number -->
            <div class="form-field-group">
              <label class="field-label" for="phoneNumber">
                <span>{{ langService.t('phoneNumberLabel') }}</span>
                <span class="required-star">*</span>
              </label>
              <div class="field-input-box">
                <span class="material-symbols-outlined field-icon">call</span>
                <input
                  id="phoneNumber"
                  type="tel"
                  formControlName="phoneNumber"
                  class="form-input font-mono"
                  [class.invalid]="isFieldInvalid('phoneNumber')"
                  placeholder="01012345678"
                  autocomplete="tel"
                />
              </div>
              <div class="field-error-text" *ngIf="isFieldInvalid('phoneNumber')">
                {{ langService.isRtl() ? 'رقم هاتف مصري صحيح (مثال: 01012345678).' : 'Valid Egyptian phone (e.g., 01012345678).' }}
              </div>
            </div>
          </div>

          <!-- Row 3: Medical Essentials (Date of Birth, Gender, Blood Type) -->
          <div class="form-grid-3">
            <!-- Date of Birth -->
            <div class="form-field-group">
              <label class="field-label" for="dateOfBirth">
                <span>{{ langService.t('dateOfBirthLabel') }}</span>
                <span class="required-star">*</span>
              </label>
              <div class="field-input-box">
                <input
                  id="dateOfBirth"
                  type="date"
                  formControlName="dateOfBirth"
                  class="form-input plain-input"
                  [class.invalid]="isFieldInvalid('dateOfBirth')"
                />
              </div>
            </div>

            <!-- Gender -->
            <div class="form-field-group">
              <label class="field-label" for="gender">
                <span>{{ langService.t('genderLabel') }}</span>
                <span class="required-star">*</span>
              </label>
              <div class="field-input-box">
                <select id="gender" formControlName="gender" class="form-input plain-input">
                  <option value="Male">{{ langService.t('genderMale') }}</option>
                  <option value="Female">{{ langService.t('genderFemale') }}</option>
                </select>
              </div>
            </div>

            <!-- Blood Type -->
            <div class="form-field-group">
              <label class="field-label" for="bloodType">
                <span>{{ langService.t('bloodTypeLabel') }}</span>
              </label>
              <div class="field-input-box">
                <select id="bloodType" formControlName="bloodType" class="form-input plain-input">
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Doctor Specific Fields -->
          <div class="form-grid-2 doctor-extra-box" *ngIf="selectedRole === 'Doctor'">
            <div class="form-field-group">
              <label class="field-label" for="specialty">
                <span>{{ langService.t('specialtyLabel') }}</span>
                <span class="required-star">*</span>
              </label>
              <div class="field-input-box">
                <span class="material-symbols-outlined field-icon">medical_services</span>
                <input
                  id="specialty"
                  type="text"
                  formControlName="specialty"
                  class="form-input"
                  [placeholder]="langService.isRtl() ? 'مثال: باطنة وقلب' : 'e.g. Cardiology'"
                />
              </div>
            </div>

            <div class="form-field-group">
              <label class="field-label" for="licenseNumber">
                <span>{{ langService.t('licenseNumberLabel') }}</span>
                <span class="required-star">*</span>
              </label>
              <div class="field-input-box">
                <span class="material-symbols-outlined field-icon">verified_user</span>
                <input
                  id="licenseNumber"
                  type="text"
                  formControlName="licenseNumber"
                  class="form-input font-mono"
                  placeholder="MD-89102-EG"
                />
              </div>
            </div>
          </div>

          <!-- Row 4: Password & Confirm Password -->
          <div class="form-grid-2">
            <!-- Password -->
            <div class="form-field-group">
              <label class="field-label" for="password">
                <span>{{ langService.t('passwordLabel') }}</span>
                <span class="required-star">*</span>
              </label>
              <div class="field-input-box">
                <span class="material-symbols-outlined field-icon">lock</span>
                <input
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  class="form-input"
                  [class.invalid]="isFieldInvalid('password')"
                  placeholder="••••••••"
                  autocomplete="new-password"
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
                {{ langService.isRtl() ? 'كلمة المرور يجب ألا تقل عن 8 أحرف.' : 'Password must be at least 8 characters.' }}
              </div>
            </div>

            <!-- Confirm Password -->
            <div class="form-field-group">
              <label class="field-label" for="confirmPassword">
                <span>{{ langService.isRtl() ? 'تأكيد كلمة المرور' : 'Confirm Password' }}</span>
                <span class="required-star">*</span>
              </label>
              <div class="field-input-box">
                <span class="material-symbols-outlined field-icon">lock_reset</span>
                <input
                  id="confirmPassword"
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="confirmPassword"
                  class="form-input"
                  [class.invalid]="isFieldInvalid('confirmPassword') || isPasswordMismatch()"
                  placeholder="••••••••"
                  autocomplete="new-password"
                />
              </div>
              <div class="field-error-text" *ngIf="isPasswordMismatch()">
                {{ langService.isRtl() ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.' }}
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn-submit-register"
            [disabled]="registerForm.invalid || isLoading || isPasswordMismatch()"
          >
            <span class="spinner-dot" *ngIf="isLoading"></span>
            <span *ngIf="!isLoading">{{ langService.t('createAccountBtn') }}</span>
            <span class="material-symbols-outlined flip-rtl" *ngIf="!isLoading">arrow_forward</span>
          </button>
        </form>

        <!-- Reciprocal Navigation Helper to Login Page -->
        <div class="card-bottom-navigation">
          <div class="login-prompt">
            <span>{{ langService.t('alreadyHaveAccount') }}</span>
            <a routerLink="/auth/login" class="btn-goto-login">
              <span>{{ langService.t('signInBtn') }}</span>
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
      max-width: 660px;
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

    /* Role Selector Cards */
    .role-selector-block {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .role-selection-prompt {
      font-size: 0.85rem;
      font-weight: 800;
      color: var(--color-text-main, #0F172A);
    }

    .roles-cards-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }

    .role-badge-btn {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.75rem 0.85rem;
      border-radius: 16px;
      border: 1.5px solid var(--color-border-subtle, #E2E8F0);
      background: var(--color-bg-app, #FAFCFB);
      cursor: pointer;
      text-align: right;
      transition: all 0.25s ease;
    }

    :host-context(:not(.rtl)) .role-badge-btn {
      text-align: left;
    }

    :host-context([data-theme="dark"]) .role-badge-btn,
    :host-context(.dark-theme) .role-badge-btn {
      background: #031B26;
      border-color: rgba(5, 191, 219, 0.18);
    }

    .role-badge-btn:hover {
      border-color: var(--color-primary-base, #088395);
      transform: translateY(-2px);
    }

    .role-badge-btn.active {
      border-color: var(--color-primary-base, #088395);
      background: rgba(8, 131, 149, 0.08);
      box-shadow: 0 4px 14px rgba(8, 131, 149, 0.15);
    }

    .role-icon-box {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .role-icon-box.teal { background: rgba(8, 131, 149, 0.12); color: #088395; }
    .role-icon-box.emerald { background: rgba(16, 185, 129, 0.12); color: #10B981; }
    .role-icon-box.indigo { background: rgba(139, 92, 246, 0.12); color: #8B5CF6; }

    .role-meta {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .role-name {
      font-size: 0.88rem;
      font-weight: 800;
      color: var(--color-text-main, #0F172A);
    }

    .role-caption {
      font-size: 0.72rem;
      color: var(--color-text-muted, #64748B);
    }

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
    .register-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;
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
      font-size: 0.88rem;
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
      padding: 0.8rem 1rem 0.8rem 2.85rem;
      border-radius: 14px;
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      background: var(--color-bg-app, #FAFCFB);
      color: var(--color-text-main, #0F172A);
      font-size: 0.92rem;
      transition: all 0.2s ease;
    }

    .form-input.plain-input {
      padding: 0.8rem 1rem;
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

    .font-mono {
      font-family: monospace;
      letter-spacing: 0.5px;
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
      font-size: 0.78rem;
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
      .form-input:not(.plain-input) {
        padding: 0.8rem 2.85rem 0.8rem 1rem;
      }
      .eye-toggle-btn {
        right: auto;
        left: 0.85rem;
      }
    }

    .doctor-extra-box {
      background: rgba(16, 185, 129, 0.05);
      border: 1px dashed rgba(16, 185, 129, 0.3);
      padding: 1rem;
      border-radius: 16px;
    }

    /* Submit Button */
    .btn-submit-register {
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
      margin-top: 0.5rem;
    }

    .btn-submit-register:hover:not(:disabled) {
      background: var(--color-primary-dark, #0A4D68);
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(8, 131, 149, 0.4);
    }

    .btn-submit-register:disabled {
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

    /* Bottom Navigation to Login */
    .card-bottom-navigation {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
      border-top: 1px solid var(--color-border-subtle, #E2E8F0);
      padding-top: 1.5rem;
    }

    .login-prompt {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.92rem;
      color: var(--color-text-muted, #64748B);
      flex-wrap: wrap;
      justify-content: center;
    }

    .btn-goto-login {
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

    .btn-goto-login:hover {
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

    /* Responsive */
    @media (max-width: 768px) {
      .roles-cards-row {
        grid-template-columns: 1fr;
      }

      .form-grid-2,
      .form-grid-3 {
        grid-template-columns: 1fr;
      }

      .auth-glass-card {
        padding: 1.5rem 1.25rem;
      }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  public langService = inject(LanguageService);

  public selectedRole: UserRole = 'Patient';
  public isLoading = false;
  public errorMessage: string | null = null;
  public showPassword = false;

  public registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    nationalId: ['', [Validators.required, Validators.pattern(/^[0-9]{14}$/)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
    dateOfBirth: ['1992-04-18', [Validators.required]],
    gender: ['Male', [Validators.required]],
    bloodType: ['A+'],
    specialty: [''],
    licenseNumber: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  });

  selectRole(role: UserRole): void {
    this.selectedRole = role;
    if (role === 'Doctor') {
      this.registerForm.get('specialty')?.setValidators([Validators.required]);
      this.registerForm.get('licenseNumber')?.setValidators([Validators.required]);
    } else {
      this.registerForm.get('specialty')?.clearValidators();
      this.registerForm.get('licenseNumber')?.clearValidators();
    }
    this.registerForm.get('specialty')?.updateValueAndValidity();
    this.registerForm.get('licenseNumber')?.updateValueAndValidity();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isPasswordMismatch(): boolean {
    const pass = this.registerForm.get('password')?.value;
    const confirm = this.registerForm.get('confirmPassword')?.value;
    return !!(confirm && pass !== confirm);
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.isPasswordMismatch()) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const val = this.registerForm.value;

    const dto: RegisterRequestDto = {
      fullName: val.fullName!,
      email: val.email!,
      phone: val.phoneNumber!,
      password: val.password!,
      roleName: this.selectedRole,
      dateOfBirth: val.dateOfBirth,
      gender: val.gender === 'Female' ? 2 : 1,
      specialty: this.selectedRole === 'Doctor' ? val.specialty : undefined,
      licenseNumber: this.selectedRole === 'Doctor' ? val.licenseNumber : undefined
    };

    this.authService.register(dto).subscribe({
      next: () => {
        this.isLoading = false;
        alert(
          this.langService.isRtl()
            ? 'تم إنشاء حسابك بنجاح! جاري تحويلك إلى لوحة التحكم...'
            : 'Account registered successfully! Redirecting to dashboard...'
        );
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message ||
          (this.langService.isRtl() ? 'تعذر إنشاء الحساب، يرجى التحقق من البيانات والمحاولة مجدداً.' : 'Registration failed. Please verify your details.');
      }
    });
  }
}
