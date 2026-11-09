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
    <div class="auth-card-wrapper register-wrapper">
      <div class="auth-luxury-card register-card">
        <!-- Integrated Segmented Control Switcher -->
        <div class="auth-segmented-switcher">
          <a routerLink="/auth/login" class="switcher-tab">
            <span class="material-symbols-outlined tab-icon">login</span>
            <span>{{ langService.t('signInBtn') }}</span>
          </a>
          <a routerLink="/auth/register" class="switcher-tab active">
            <span class="material-symbols-outlined tab-icon">person_add</span>
            <span>{{ langService.t('createAccountLink') }}</span>
          </a>
        </div>

        <!-- Card Header -->
        <div class="card-header">
          <div class="header-badge">
            <span class="badge-pulse"></span>
            <span>{{ langService.isRtl() ? 'إصدار الجواز الصحي الموحد' : 'Claim Your Lifetime Unified ID' }}</span>
          </div>
          <h1 class="card-title">{{ langService.t('registerTitle') }}</h1>
          <p class="card-caption">{{ langService.t('registerSubtitle') }}</p>
        </div>

        <!-- Two-Step Stepper Progress Header -->
        <div class="stepper-track">
          <button
            type="button"
            class="step-node"
            [class.active]="currentStep === 1"
            [class.completed]="currentStep > 1"
            (click)="goToStep(1)"
          >
            <div class="node-circle">
              <span class="material-symbols-outlined node-icon" *ngIf="currentStep > 1">check</span>
              <span *ngIf="currentStep <= 1">1</span>
            </div>
            <span class="node-label">{{ langService.t('stepIdentity') }}</span>
          </button>

          <div class="track-divider" [class.filled]="currentStep > 1"></div>

          <button
            type="button"
            class="step-node"
            [class.active]="currentStep === 2"
            (click)="goToStep(2)"
          >
            <div class="node-circle">2</div>
            <span class="node-label">{{ langService.t('stepContactSecurity') }}</span>
          </button>
        </div>

        <!-- Error Alert Banner -->
        <div class="alert-banner error" *ngIf="errorMessage">
          <span class="material-symbols-outlined">error</span>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Unified Form with Step Panels -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
          <!-- ==================== STEP 1: ROLE & BASIC IDENTITY ==================== -->
          <div class="step-panel" *ngIf="currentStep === 1">
            <!-- Persona Selection Section -->
            <div class="section-block">
              <label class="section-prompt">
                {{ langService.isRtl() ? 'اختر فئة الحساب لتهيئة بيئة العمل:' : 'Select Account Persona:' }}
              </label>

              <div class="persona-cards-grid">
                <!-- Patient Card -->
                <button
                  type="button"
                  class="persona-card"
                  [class.selected]="selectedRole === 'Patient'"
                  (click)="selectRole('Patient')"
                >
                  <div class="persona-icon-frame teal">
                    <span class="material-symbols-outlined">person</span>
                  </div>
                  <div class="persona-text">
                    <div class="persona-title-row">
                      <span class="persona-name">{{ langService.t('rolePatient') }}</span>
                      <span class="persona-chip">{{ langService.isRtl() ? 'مواطن' : 'Citizen' }}</span>
                    </div>
                    <p class="persona-desc">
                      {{ langService.isRtl()
                        ? 'جواز صحي موحد مدى الحياة، كارت طوارئ ذكي QR، وتحكم بمشاركة بياناتك.'
                        : 'Lifelong health passport, instant emergency QR, and zero-trust data consent.' }}
                    </p>
                  </div>
                  <div class="check-aura" *ngIf="selectedRole === 'Patient'">
                    <span class="material-symbols-outlined">check_circle</span>
                  </div>
                </button>

                <!-- Doctor Card -->
                <button
                  type="button"
                  class="persona-card"
                  [class.selected]="selectedRole === 'Doctor'"
                  (click)="selectRole('Doctor')"
                >
                  <div class="persona-icon-frame emerald">
                    <span class="material-symbols-outlined">stethoscope</span>
                  </div>
                  <div class="persona-text">
                    <div class="persona-title-row">
                      <span class="persona-name">{{ langService.t('roleDoctor') }}</span>
                      <span class="persona-chip emerald">{{ langService.isRtl() ? 'استشاري' : 'Physician' }}</span>
                    </div>
                    <p class="persona-desc">
                      {{ langService.isRtl()
                        ? 'إدارة العيادة الخاصة، تحرير الروشتات الرقمية، والاطلاع على السجلات بإذن المريض.'
                        : 'Private clinic practice, verified e-prescriptions, and consent-gated records.' }}
                    </p>
                  </div>
                  <div class="check-aura" *ngIf="selectedRole === 'Doctor'">
                    <span class="material-symbols-outlined">check_circle</span>
                  </div>
                </button>

                <!-- Receptionist Card -->
                <button
                  type="button"
                  class="persona-card"
                  [class.selected]="selectedRole === 'Receptionist'"
                  (click)="selectRole('Receptionist')"
                >
                  <div class="persona-icon-frame indigo">
                    <span class="material-symbols-outlined">desk</span>
                  </div>
                  <div class="persona-text">
                    <div class="persona-title-row">
                      <span class="persona-name">{{ langService.t('roleReceptionist') }}</span>
                      <span class="persona-chip indigo">{{ langService.isRtl() ? 'استقبال' : 'Reception' }}</span>
                    </div>
                    <p class="persona-desc">
                      {{ langService.isRtl()
                        ? 'تنظيم طوابير الانتظار، تسجيل المرضى، وتنسيق حجوزات العيادات اليومية.'
                        : 'Patient queue management, clinic check-in, and appointment scheduling.' }}
                    </p>
                  </div>
                  <div class="check-aura" *ngIf="selectedRole === 'Receptionist'">
                    <span class="material-symbols-outlined">check_circle</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Identity Inputs -->
            <div class="fields-grid-2">
              <!-- Full Name -->
              <div class="form-group">
                <label class="form-label" for="fullName">
                  <span>{{ langService.t('fullNameLabel') }}</span>
                  <span class="req">*</span>
                </label>
                <div class="input-shell" [class.has-error]="isFieldInvalid('fullName')">
                  <span class="material-symbols-outlined input-icon">badge</span>
                  <input
                    id="fullName"
                    type="text"
                    formControlName="fullName"
                    class="native-input"
                    [placeholder]="langService.isRtl() ? 'مثال: أحمد محمود حسن' : 'e.g. Ahmed Mahmoud Hassan'"
                    autocomplete="name"
                  />
                </div>
                <div class="field-error-hint" *ngIf="isFieldInvalid('fullName')">
                  {{ langService.isRtl() ? 'الاسم بالكامل مطلوب (3 أحرف على الأقل).' : 'Full name is required (min 3 chars).' }}
                </div>
              </div>

              <!-- National ID -->
              <div class="form-group">
                <label class="form-label" for="nationalId">
                  <span>{{ langService.t('nationalIdLabel') }}</span>
                  <span class="req">*</span>
                </label>
                <div class="input-shell" [class.has-error]="isFieldInvalid('nationalId')">
                  <span class="material-symbols-outlined input-icon">pin</span>
                  <input
                    id="nationalId"
                    type="text"
                    formControlName="nationalId"
                    class="native-input font-mono"
                    placeholder="29805121601234"
                    maxlength="14"
                  />
                </div>
                <div class="field-error-hint" *ngIf="isFieldInvalid('nationalId')">
                  {{ langService.isRtl() ? 'الرقم القومي يجب أن يتكون من 14 رقماً بالضبط.' : 'National ID must be exactly 14 digits.' }}
                </div>
              </div>
            </div>

            <!-- Doctor Specific Fields -->
            <div class="fields-grid-2 doctor-extra-box" *ngIf="selectedRole === 'Doctor'">
              <div class="form-group">
                <label class="form-label" for="medicalLicenseNumber">
                  <span>{{ langService.t('licenseNumberLabel') }}</span>
                  <span class="req">*</span>
                </label>
                <div class="input-shell" [class.has-error]="isFieldInvalid('medicalLicenseNumber')">
                  <span class="material-symbols-outlined input-icon">verified</span>
                  <input
                    id="medicalLicenseNumber"
                    type="text"
                    formControlName="medicalLicenseNumber"
                    class="native-input font-mono"
                    placeholder="EGY-DOC-2026-99"
                  />
                </div>
                <div class="field-error-hint" *ngIf="isFieldInvalid('medicalLicenseNumber')">
                  {{ langService.isRtl() ? 'رقم ترخيص النقابة مطلوب لتأكيد الهوية المهنية.' : 'License number is required for medical practitioners.' }}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="specialty">
                  <span>{{ langService.t('specialtyLabel') }}</span>
                  <span class="req">*</span>
                </label>
                <div class="input-shell" [class.has-error]="isFieldInvalid('specialty')">
                  <span class="material-symbols-outlined input-icon">medical_information</span>
                  <input
                    id="specialty"
                    type="text"
                    formControlName="specialty"
                    class="native-input"
                    [placeholder]="langService.isRtl() ? 'مثال: باطنة، أطفال، قلب' : 'e.g. Cardiology, Pediatrics'"
                  />
                </div>
                <div class="field-error-hint" *ngIf="isFieldInvalid('specialty')">
                  {{ langService.isRtl() ? 'التخصص الطبي مطلوب.' : 'Specialty is required.' }}
                </div>
              </div>
            </div>

            <!-- Step 1 Next Button -->
            <button
              type="button"
              class="btn-primary-auth"
              (click)="nextStep()"
            >
              <span>{{ langService.t('nextStepBtn') }}</span>
              <span class="material-symbols-outlined flip-rtl">arrow_forward</span>
            </button>
          </div>

          <!-- ==================== STEP 2: CONTACT, HEALTH & SECURITY ==================== -->
          <div class="step-panel" *ngIf="currentStep === 2">
            <!-- Row: Email & Phone -->
            <div class="fields-grid-2">
              <div class="form-group">
                <label class="form-label" for="email">
                  <span>{{ langService.t('emailLabel') }}</span>
                  <span class="req">*</span>
                </label>
                <div class="input-shell" [class.has-error]="isFieldInvalid('email')">
                  <span class="material-symbols-outlined input-icon">mail</span>
                  <input
                    id="email"
                    type="email"
                    formControlName="email"
                    class="native-input"
                    placeholder="patient@sehati.gov.eg"
                    autocomplete="email"
                  />
                </div>
                <div class="field-error-hint" *ngIf="isFieldInvalid('email')">
                  {{ langService.isRtl() ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'Please enter a valid email address.' }}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="phoneNumber">
                  <span>{{ langService.t('phoneNumberLabel') }}</span>
                  <span class="req">*</span>
                </label>
                <div class="input-shell" [class.has-error]="isFieldInvalid('phoneNumber')">
                  <span class="material-symbols-outlined input-icon">call</span>
                  <input
                    id="phoneNumber"
                    type="tel"
                    formControlName="phoneNumber"
                    class="native-input font-mono"
                    placeholder="01012345678"
                    autocomplete="tel"
                  />
                </div>
                <div class="field-error-hint" *ngIf="isFieldInvalid('phoneNumber')">
                  {{ langService.isRtl() ? 'رقم هاتف مصري صحيح (مثال: 01012345678).' : 'Valid Egyptian phone (e.g., 01012345678).' }}
                </div>
              </div>
            </div>

            <!-- Row: Date of Birth, Gender, Blood Type -->
            <div class="fields-grid-3">
              <div class="form-group">
                <label class="form-label" for="dateOfBirth">
                  <span>{{ langService.t('dateOfBirthLabel') }}</span>
                  <span class="req">*</span>
                </label>
                <div class="input-shell" [class.has-error]="isFieldInvalid('dateOfBirth')">
                  <input
                    id="dateOfBirth"
                    type="date"
                    formControlName="dateOfBirth"
                    class="native-input select-clean"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="gender">
                  <span>{{ langService.t('genderLabel') }}</span>
                  <span class="req">*</span>
                </label>
                <div class="input-shell">
                  <select id="gender" formControlName="gender" class="native-input select-clean">
                    <option value="Male">{{ langService.t('genderMale') }}</option>
                    <option value="Female">{{ langService.t('genderFemale') }}</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="bloodType">
                  <span>{{ langService.t('bloodTypeLabel') }}</span>
                </label>
                <div class="input-shell">
                  <select id="bloodType" formControlName="bloodType" class="native-input select-clean font-mono">
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

            <!-- Password Fields -->
            <div class="fields-grid-2">
              <div class="form-group">
                <label class="form-label" for="password">
                  <span>{{ langService.t('passwordLabel') }}</span>
                  <span class="req">*</span>
                </label>
                <div class="input-shell" [class.has-error]="isFieldInvalid('password')">
                  <span class="material-symbols-outlined input-icon">lock</span>
                  <input
                    id="password"
                    [type]="showPassword ? 'text' : 'password'"
                    formControlName="password"
                    class="native-input"
                    [placeholder]="langService.t('passwordPlaceholder')"
                    autocomplete="new-password"
                  />
                  <button
                    type="button"
                    class="eye-btn"
                    (click)="showPassword = !showPassword"
                  >
                    <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="confirmPassword">
                  <span>{{ langService.t('confirmPasswordLabel') }}</span>
                  <span class="req">*</span>
                </label>
                <div class="input-shell" [class.has-error]="isConfirmPasswordInvalid()">
                  <span class="material-symbols-outlined input-icon">lock_clock</span>
                  <input
                    id="confirmPassword"
                    [type]="showPassword ? 'text' : 'password'"
                    formControlName="confirmPassword"
                    class="native-input"
                    [placeholder]="langService.t('confirmPasswordPlaceholder')"
                    autocomplete="new-password"
                  />
                </div>
                <div class="field-error-hint" *ngIf="isConfirmPasswordInvalid()">
                  {{ langService.isRtl() ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.' }}
                </div>
              </div>
            </div>

            <!-- Live Password Strength Meter -->
            <div class="password-meter-box" *ngIf="registerForm.get('password')?.value">
              <div class="meter-bars">
                <div class="meter-bar" [class.active]="passwordStrength >= 1" [class.weak]="passwordStrength === 1" [class.medium]="passwordStrength === 2" [class.strong]="passwordStrength >= 3"></div>
                <div class="meter-bar" [class.active]="passwordStrength >= 2" [class.medium]="passwordStrength === 2" [class.strong]="passwordStrength >= 3"></div>
                <div class="meter-bar" [class.active]="passwordStrength >= 3" [class.strong]="passwordStrength >= 3"></div>
                <div class="meter-bar" [class.active]="passwordStrength >= 4" [class.strong]="passwordStrength >= 4"></div>
              </div>
              <span class="meter-caption">{{ getStrengthCaption() }}</span>
            </div>

            <!-- Terms & Consent Agreement -->
            <div class="terms-group">
              <div class="terms-label-row">
                <label class="terms-label" for="termsAccepted">
                  <input id="termsAccepted" type="checkbox" formControlName="termsAccepted" class="styled-checkbox" />
                  <span class="terms-text-inline">
                    {{ langService.isRtl() ? 'أوافق على ' : 'I agree to the ' }}
                    <strong>{{ langService.isRtl() ? 'شروط الخدمة والسياسة الوطنية الموحدة لحماية البيانات الصحية' : 'Terms of Service & National Health Data Protection Policy' }}</strong>.
                  </span>
                </label>
                <button
                  type="button"
                  class="terms-reader-btn"
                  (click)="openTermsModal()"
                  [title]="langService.isRtl() ? 'قراءة بنود الخدمة وسياسة حماية البيانات' : 'Read Terms & Policy'"
                >
                  <span class="material-symbols-outlined">menu_book</span>
                  <span>{{ langService.isRtl() ? 'قراءة البنود والسياسة' : 'Read Terms & Policy' }}</span>
                </button>
              </div>
            </div>

            <!-- Dual Action Row -->
            <div class="dual-actions-row">
              <button
                type="button"
                class="btn-secondary-back"
                (click)="prevStep()"
              >
                <span class="material-symbols-outlined flip-rtl">arrow_back</span>
                <span>{{ langService.t('prevStepBtn') }}</span>
              </button>

              <button
                type="submit"
                class="btn-primary-auth flex-1"
                [disabled]="registerForm.invalid || isConfirmPasswordInvalid() || isLoading"
              >
                <span class="spinner" *ngIf="isLoading"></span>
                <span *ngIf="!isLoading">{{ langService.t('claimPassportBtn') }}</span>
                <span class="material-symbols-outlined flip-rtl" *ngIf="!isLoading">verified</span>
              </button>
            </div>
          </div>
        </form>

        <!-- Bottom Switch Prompt -->
        <div class="card-footer-switch">
          <span>{{ langService.t('alreadyHaveAccount') }}</span>
          <a routerLink="/auth/login" class="switch-link">
            <span>{{ langService.t('signInBtn') }}</span>
            <span class="material-symbols-outlined flip-rtl">arrow_forward</span>
          </a>
        </div>
      </div>

      <!-- TERMS & HEALTH DATA PROTECTION MODAL -->
      <div class="terms-modal-overlay" *ngIf="showTermsModal" (click)="closeTermsModal()">
        <div class="terms-modal-card" (click)="$event.stopPropagation()">
          <div class="terms-modal-header">
            <div class="modal-badge">
              <span class="material-symbols-outlined">verified_user</span>
              <span>{{ langService.isRtl() ? 'السياسة الوطنية الموحدة لحماية البيانات الصحية 2026' : 'Unified National Health Data Protection Policy 2026' }}</span>
            </div>
            <button type="button" class="modal-close-btn" (click)="closeTermsModal()">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="terms-modal-body">
            <h2 class="policy-heading">
              {{ langService.isRtl() ? 'ميثاق سيادة البيانات وحماية السجلات الطبية (صِحّتي)' : 'Data Sovereignty & Health Data Governance Charter (Sehati)' }}
            </h2>
            <p class="policy-intro">
              {{ langService.isRtl()
                ? 'بموجب قانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020 ومعايير التحول الرقمي للتأمين الصحي، تلتزم منظومة صِحّتي بتوفير أعلى درجات السيادة والأمان لبياناتك الصحية:'
                : 'Under Egyptian Personal Data Protection Law No. 151/2020 and sovereign digital health standards, Sehati guarantees absolute citizen privacy and security:' }}
            </p>

            <div class="policy-grid">
              <div class="policy-card">
                <div class="policy-icon-wrap teal">
                  <span class="material-symbols-outlined">shield</span>
                </div>
                <div class="policy-card-content">
                  <h4>{{ langService.isRtl() ? '1. سيادة المريض ومبدأ عدم الثقة (Zero-Trust)' : '1. Patient Sovereignty & Zero-Trust Consent' }}</h4>
                  <p>{{ langService.isRtl()
                    ? 'أنت المالك الوحيد لسجلك الطبي. لا يمكن لأي عيادة، مستشفى، أو ممارس صحي الاطلاع على فحوصاتك أو تاريخك الطبي إلا بعد موافقتك اللحظية عبر كود التحقق OTP أو مسح تصريح الاستشارة.'
                    : 'You own your medical data. No clinic, hospital, or clinician can view your consultation records or diagnostic labs without your explicit OTP verification or active QR consent.' }}</p>
                </div>
              </div>

              <div class="policy-card">
                <div class="policy-icon-wrap emerald">
                  <span class="material-symbols-outlined">lock</span>
                </div>
                <div class="policy-card-content">
                  <h4>{{ langService.isRtl() ? '2. تشفير سيبراني عسكري (AES-256)' : '2. End-to-End Cryptographic Encryption' }}</h4>
                  <p>{{ langService.isRtl()
                    ? 'كافة السجلات الطبية، الروشتات، والتحاليل مشفرة بالكامل أثناء الحفظ (At-Rest) وأثناء النقل (In-Transit) عبر بنية تحتية سحابية حكومية مؤمنة 100%.'
                    : 'All electronic medical records, e-prescriptions, and telemetry are encrypted with AES-256 at rest and TLS 1.3 in transit, hosted securely on sovereign infrastructure.' }}</p>
                </div>
              </div>

              <div class="policy-card">
                <div class="policy-icon-wrap amber">
                  <span class="material-symbols-outlined">emergency</span>
                </div>
                <div class="policy-card-content">
                  <h4>{{ langService.isRtl() ? '3. بروتوكول طوارئ الإنقاذ السريع (Rescue QR)' : '3. Emergency Rescue QR Protocol' }}</h4>
                  <p>{{ langService.isRtl()
                    ? 'في حالات الحوادث الطارئة أو الغيبوبة، يُتاح للمسعفين المعتمدين حصراً قراءة المؤشرات الحيوية المنقذة للحياة فقط (فصيلة الدم، الحساسيات الحرجة، الأمراض المزمنة، جهة اتصال الطوارئ).'
                    : 'In acute medical emergencies, accredited EMTs and paramedics access ONLY life-saving vitals (blood group, critical allergies, chronic illnesses, and emergency contacts).' }}</p>
                </div>
              </div>

              <div class="policy-card">
                <div class="policy-icon-wrap indigo">
                  <span class="material-symbols-outlined">history</span>
                </div>
                <div class="policy-card-content">
                  <h4>{{ langService.isRtl() ? '4. سجل تدقيق غير قابل للتلاعب وحق الإلغاء الفوري' : '4. Immutable Audit Trail & Immediate Revocation' }}</h4>
                  <p>{{ langService.isRtl()
                    ? 'يتم تسجيل كل محاولة وصول لملفك الطبي بتوقيت دقيق وهوية الطبيب في سجل التدقيق الأمني. ويحق لك إلغاء تصريح أي عيادة أو طبيب بنقرة واحدة وفي أي لحظة.'
                    : 'Every single view of your passport is permanently recorded in your tamper-proof security audit log. You hold the legal right to revoke any provider’s consent in real time.' }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="terms-modal-footer">
            <button type="button" class="btn-modal-close" (click)="closeTermsModal()">
              <span>{{ langService.isRtl() ? 'إغلاق' : 'Close' }}</span>
            </button>
            <button type="button" class="btn-modal-agree" (click)="acceptTermsAndClose()">
              <span class="material-symbols-outlined">check_circle</span>
              <span>{{ langService.isRtl() ? 'أوافق على الشروط والسياسة' : 'I Accept & Agree' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-card-wrapper.register-wrapper {
      width: 100%;
      max-width: 720px;
      margin: 0 auto;
    }

    .auth-luxury-card.register-card {
      background: var(--color-surface-card, #FFFFFF);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      border-radius: 28px;
      padding: 2.5rem 2.5rem;
      box-shadow: 0 20px 50px -15px rgba(10, 77, 104, 0.12), 0 0 0 1px rgba(8, 131, 149, 0.04);
      display: flex;
      flex-direction: column;
      gap: 1.65rem;
      transition: all 0.3s ease;
    }

    :host-context([data-theme="dark"]) .auth-luxury-card.register-card,
    :host-context(.dark-theme) .auth-luxury-card.register-card {
      background: #082635;
      border-color: rgba(5, 191, 219, 0.22);
      box-shadow: 0 25px 55px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(5, 191, 219, 0.1);
    }

    /* Switcher Tabs */
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

    .card-title {
      font-size: 1.85rem;
      font-weight: 900;
      color: var(--color-text-main, #0F172A);
      letter-spacing: -0.5px;
      line-height: 1.25;
      margin: 0;
    }

    .card-caption {
      font-size: 0.94rem;
      line-height: 1.55;
      color: var(--color-text-muted, #64748B);
      margin: 0;
    }

    /* Stepper Track */
    .stepper-track {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.5rem 0.25rem 0.75rem 0.25rem;
    }

    .step-node {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      background: transparent;
      border: none;
      cursor: pointer;
      color: var(--color-text-muted, #64748B);
      font-size: 0.88rem;
      font-weight: 700;
      transition: all 0.2s ease;
      padding: 0;
    }

    .node-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--color-bg-app, #F8FAFC);
      border: 2px solid var(--color-border-subtle, #E2E8F0);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.88rem;
      transition: all 0.25s ease;
    }

    .step-node.active .node-circle {
      border-color: var(--color-primary-base, #088395);
      background: var(--color-primary-base, #088395);
      color: #FFFFFF;
      box-shadow: 0 4px 10px rgba(8, 131, 149, 0.3);
    }

    .step-node.active .node-label {
      color: var(--color-primary-dark, #0A4D68);
      font-weight: 800;
    }

    :host-context([data-theme="dark"]) .step-node.active .node-label,
    :host-context(.dark-theme) .step-node.active .node-label {
      color: #05BFDB;
    }

    .step-node.completed .node-circle {
      border-color: #10B981;
      background: #10B981;
      color: #FFFFFF;
    }

    .node-icon {
      font-size: 1.1rem;
    }

    .track-divider {
      flex: 1;
      height: 2px;
      background: var(--color-border-subtle, #E2E8F0);
      transition: background 0.3s ease;
    }

    .track-divider.filled {
      background: #10B981;
    }

    /* Alerts */
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

    /* Form & Steps */
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .step-panel {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Persona Cards */
    .section-block {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .section-prompt {
      font-size: 0.9rem;
      font-weight: 800;
      color: var(--color-text-main, #0F172A);
    }

    .persona-cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.85rem;
    }

    .persona-card {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1.25rem 1rem;
      border-radius: 20px;
      border: 1.5px solid var(--color-border-subtle, #E2E8F0);
      background: var(--color-bg-app, #F8FAFC);
      cursor: pointer;
      text-align: start;
      transition: all 0.25s ease;
    }

    :host-context([data-theme="dark"]) .persona-card,
    :host-context(.dark-theme) .persona-card {
      background: #0B3347;
      border-color: rgba(5, 191, 219, 0.18);
    }

    .persona-card:hover {
      border-color: var(--color-primary-base, #088395);
      transform: translateY(-2px);
      box-shadow: 0 8px 18px rgba(8, 131, 149, 0.1);
    }

    .persona-card.selected {
      border-color: var(--color-primary-base, #088395);
      background: var(--color-surface-card, #FFFFFF);
      box-shadow: 0 10px 24px -5px rgba(8, 131, 149, 0.2), 0 0 0 2px var(--color-primary-base, #088395);
    }

    :host-context([data-theme="dark"]) .persona-card.selected,
    :host-context(.dark-theme) .persona-card.selected {
      background: #0E3E56;
      border-color: #05BFDB;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 0 2px #05BFDB;
    }

    .persona-icon-frame {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .persona-icon-frame.teal {
      background: rgba(8, 131, 149, 0.12);
      color: #088395;
    }

    .persona-icon-frame.emerald {
      background: rgba(16, 185, 129, 0.14);
      color: #059669;
    }

    .persona-icon-frame.indigo {
      background: rgba(99, 102, 241, 0.14);
      color: #4F46E5;
    }

    .persona-icon-frame .material-symbols-outlined {
      font-size: 1.4rem;
    }

    .persona-text {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .persona-title-row {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      flex-wrap: wrap;
    }

    .persona-name {
      font-size: 0.98rem;
      font-weight: 800;
      color: var(--color-text-main, #0F172A);
    }

    .persona-chip {
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.15rem 0.45rem;
      border-radius: 6px;
      background: rgba(8, 131, 149, 0.12);
      color: #088395;
    }

    .persona-chip.emerald {
      background: rgba(16, 185, 129, 0.14);
      color: #059669;
    }

    .persona-chip.indigo {
      background: rgba(99, 102, 241, 0.14);
      color: #4F46E5;
    }

    .persona-desc {
      font-size: 0.78rem;
      line-height: 1.5;
      color: var(--color-text-muted, #64748B);
      margin: 0;
    }

    .check-aura {
      position: absolute;
      top: 10px;
      inset-inline-end: 10px;
      color: var(--color-primary-base, #088395);
    }

    :host-context([data-theme="dark"]) .check-aura,
    :host-context(.dark-theme) .check-aura {
      color: #05BFDB;
    }

    .check-aura .material-symbols-outlined {
      font-size: 1.25rem;
    }

    /* Grids */
    .fields-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .fields-grid-3 {
      display: grid;
      grid-template-columns: 1.3fr 1fr 1fr;
      gap: 1rem;
    }

    .doctor-extra-box {
      padding: 1.15rem;
      border-radius: 18px;
      background: rgba(16, 185, 129, 0.05);
      border: 1px dashed rgba(16, 185, 129, 0.3);
    }

    /* Form Fields */
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
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

    .native-input.select-clean {
      cursor: pointer;
    }

    .native-input::placeholder {
      color: var(--color-text-muted, #64748B);
      opacity: 0.7;
    }

    .font-mono {
      font-family: monospace;
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

    /* Password Strength Meter */
    .password-meter-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.45rem 0.25rem;
    }

    .meter-bars {
      display: flex;
      gap: 4px;
      flex: 1;
    }

    .meter-bar {
      flex: 1;
      height: 4px;
      border-radius: 9999px;
      background: var(--color-border-subtle, #E2E8F0);
      transition: background 0.3s ease;
    }

    .meter-bar.active.weak { background: #EF4444; }
    .meter-bar.active.medium { background: #F59E0B; }
    .meter-bar.active.strong { background: #10B981; }

    .meter-caption {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--color-text-muted, #64748B);
    }

    /* Terms & Policy Reader */
    .terms-group {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      padding: 0.25rem 0;
    }

    .terms-label-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .terms-label {
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      font-size: 0.86rem;
      line-height: 1.5;
      color: var(--color-text-muted, #64748B);
      cursor: pointer;
      flex: 1;
      min-width: 260px;
    }

    .terms-text-inline strong {
      color: var(--color-primary-dark, #0A4D68);
    }

    :host-context([data-theme="dark"]) .terms-text-inline strong,
    :host-context(.dark-theme) .terms-text-inline strong {
      color: #05BFDB;
    }

    .terms-reader-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 0.95rem;
      border-radius: 9999px;
      border: 1px solid rgba(8, 131, 149, 0.25);
      background: rgba(8, 131, 149, 0.08);
      color: var(--color-primary-base, #088395);
      font-size: 0.82rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .terms-reader-btn:hover {
      background: var(--color-primary-base, #088395);
      color: #FFFFFF;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(8, 131, 149, 0.2);
    }

    :host-context([data-theme="dark"]) .terms-reader-btn,
    :host-context(.dark-theme) .terms-reader-btn {
      background: rgba(5, 191, 219, 0.12);
      border-color: rgba(5, 191, 219, 0.35);
      color: #05BFDB;
    }

    .styled-checkbox {
      width: 18px;
      height: 18px;
      accent-color: var(--color-primary-base, #088395);
      border-radius: 4px;
      margin-top: 0.15rem;
      cursor: pointer;
    }

    /* Modal Overlay & Card */
    .terms-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(5, 22, 34, 0.75);
      backdrop-filter: blur(8px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.25rem;
      animation: modalFadeIn 0.25s ease;
    }

    @keyframes modalFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .terms-modal-card {
      width: 100%;
      max-width: 680px;
      max-height: 88vh;
      display: flex;
      flex-direction: column;
      background: var(--color-surface-card, #FFFFFF);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      border-radius: 24px;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.35);
      overflow: hidden;
      animation: modalScaleUp 0.25s ease;
    }

    :host-context([data-theme="dark"]) .terms-modal-card,
    :host-context(.dark-theme) .terms-modal-card {
      background: #082635;
      border-color: rgba(5, 191, 219, 0.25);
    }

    @keyframes modalScaleUp {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .terms-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--color-border-subtle, #E2E8F0);
      background: rgba(8, 131, 149, 0.04);
    }

    :host-context([data-theme="dark"]) .terms-modal-header,
    :host-context(.dark-theme) .terms-modal-header {
      border-bottom-color: rgba(5, 191, 219, 0.15);
      background: rgba(5, 191, 219, 0.06);
    }

    .modal-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      font-weight: 800;
      color: var(--color-primary-base, #088395);
    }

    :host-context([data-theme="dark"]) .modal-badge,
    :host-context(.dark-theme) .modal-badge {
      color: #05BFDB;
    }

    .modal-close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      background: var(--color-surface-card, #FFFFFF);
      color: var(--color-text-muted, #64748B);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .modal-close-btn:hover {
      background: #EF4444;
      border-color: #EF4444;
      color: #FFFFFF;
    }

    .terms-modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }

    .policy-heading {
      font-size: 1.25rem;
      font-weight: 900;
      color: var(--color-text-main, #0F172A);
      margin: 0;
    }

    .policy-intro {
      font-size: 0.88rem;
      line-height: 1.6;
      color: var(--color-text-muted, #64748B);
      margin: 0;
    }

    .policy-grid {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .policy-card {
      display: flex;
      align-items: flex-start;
      gap: 0.9rem;
      padding: 1rem 1.15rem;
      border-radius: 16px;
      background: var(--color-bg-app, #F8FAFC);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
    }

    :host-context([data-theme="dark"]) .policy-card,
    :host-context(.dark-theme) .policy-card {
      background: #0B3347;
      border-color: rgba(5, 191, 219, 0.16);
    }

    .policy-icon-wrap {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .policy-icon-wrap.teal { background: rgba(8, 131, 149, 0.15); color: #088395; }
    .policy-icon-wrap.emerald { background: rgba(16, 185, 129, 0.15); color: #10B981; }
    .policy-icon-wrap.amber { background: rgba(245, 158, 11, 0.15); color: #F59E0B; }
    .policy-icon-wrap.indigo { background: rgba(99, 102, 241, 0.15); color: #6366F1; }

    .policy-card-content h4 {
      margin: 0 0 0.3rem 0;
      font-size: 0.92rem;
      font-weight: 800;
      color: var(--color-text-main, #0F172A);
    }

    .policy-card-content p {
      margin: 0;
      font-size: 0.84rem;
      line-height: 1.55;
      color: var(--color-text-muted, #64748B);
    }

    .terms-modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1.15rem 1.5rem;
      border-top: 1px solid var(--color-border-subtle, #E2E8F0);
      background: rgba(8, 131, 149, 0.03);
    }

    :host-context([data-theme="dark"]) .terms-modal-footer,
    :host-context(.dark-theme) .terms-modal-footer {
      border-top-color: rgba(5, 191, 219, 0.15);
      background: rgba(5, 191, 219, 0.05);
    }

    .btn-modal-agree {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.65rem 1.4rem;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #0A4D68 0%, #088395 100%);
      color: #FFFFFF;
      font-size: 0.9rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-modal-agree:hover {
      box-shadow: 0 6px 18px rgba(8, 131, 149, 0.35);
      transform: translateY(-1px);
    }

    .btn-modal-close {
      display: inline-flex;
      align-items: center;
      padding: 0.65rem 1.15rem;
      border-radius: 12px;
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      background: transparent;
      color: var(--color-text-muted, #64748B);
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-modal-close:hover {
      color: var(--color-text-main, #0F172A);
      border-color: var(--color-text-muted, #64748B);
    }

    /* Buttons */
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

    .dual-actions-row {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      margin-top: 0.5rem;
    }

    .flex-1 {
      flex: 1;
    }

    .btn-secondary-back {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      height: 52px;
      padding: 0 1.25rem;
      border-radius: 14px;
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      background: var(--color-surface-card, #FFFFFF);
      color: var(--color-text-main, #0F172A);
      font-size: 0.92rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    :host-context([data-theme="dark"]) .btn-secondary-back,
    :host-context(.dark-theme) .btn-secondary-back {
      background: #0B3347;
      border-color: rgba(5, 191, 219, 0.22);
    }

    .btn-secondary-back:hover {
      border-color: var(--color-primary-base, #088395);
      color: var(--color-primary-base, #088395);
      transform: translateY(-1px);
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

    /* Card Footer Switch */
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

    @media (max-width: 768px) {
      .auth-luxury-card.register-card {
        padding: 1.75rem 1.25rem;
        border-radius: 22px;
      }

      .persona-cards-grid {
        grid-template-columns: 1fr;
      }

      .fields-grid-2,
      .fields-grid-3 {
        grid-template-columns: 1fr;
      }

      .dual-actions-row {
        flex-direction: column-reverse;
      }

      .btn-secondary-back,
      .btn-primary-auth {
        width: 100%;
      }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  langService = inject(LanguageService);

  currentStep = 1;
  selectedRole: 'Patient' | 'Doctor' | 'Receptionist' = 'Patient';
  showPassword = false;
  showTermsModal = false;
  isLoading = false;
  errorMessage = '';

  openTermsModal(): void {
    this.showTermsModal = true;
  }

  closeTermsModal(): void {
    this.showTermsModal = false;
  }

  acceptTermsAndClose(): void {
    this.registerForm.get('termsAccepted')?.setValue(true);
    this.showTermsModal = false;
  }

  registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    nationalId: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^(010|011|012|015)\d{8}$/)]],
    dateOfBirth: ['1995-01-01', [Validators.required]],
    gender: ['Male', [Validators.required]],
    bloodType: ['A+'],
    medicalLicenseNumber: [''],
    specialty: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    termsAccepted: [true, [Validators.requiredTrue]]
  });

  selectRole(role: 'Patient' | 'Doctor' | 'Receptionist'): void {
    this.selectedRole = role;
    const licenseCtrl = this.registerForm.get('medicalLicenseNumber');
    const specialtyCtrl = this.registerForm.get('specialty');

    if (role === 'Doctor') {
      licenseCtrl?.setValidators([Validators.required]);
      specialtyCtrl?.setValidators([Validators.required]);
    } else {
      licenseCtrl?.clearValidators();
      specialtyCtrl?.clearValidators();
    }
    licenseCtrl?.updateValueAndValidity();
    specialtyCtrl?.updateValueAndValidity();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isConfirmPasswordInvalid(): boolean {
    const pass = this.registerForm.get('password')?.value;
    const confirm = this.registerForm.get('confirmPassword');
    return !!(confirm && confirm.dirty && confirm.value !== pass);
  }

  get passwordStrength(): number {
    const pass = this.registerForm.get('password')?.value || '';
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  }

  getStrengthCaption(): string {
    const score = this.passwordStrength;
    if (score <= 1) return this.langService.t('passwordStrengthWeak');
    if (score === 2) return this.langService.t('passwordStrengthMedium');
    return this.langService.t('passwordStrengthStrong');
  }

  nextStep(): void {
    const fullNameValid = !this.registerForm.get('fullName')?.invalid;
    const nationalIdValid = !this.registerForm.get('nationalId')?.invalid;
    const doctorValid = this.selectedRole !== 'Doctor' ||
      (!this.registerForm.get('medicalLicenseNumber')?.invalid && !this.registerForm.get('specialty')?.invalid);

    if (fullNameValid && nationalIdValid && doctorValid) {
      this.currentStep = 2;
      this.errorMessage = '';
    } else {
      this.registerForm.get('fullName')?.markAsTouched();
      this.registerForm.get('nationalId')?.markAsTouched();
      if (this.selectedRole === 'Doctor') {
        this.registerForm.get('medicalLicenseNumber')?.markAsTouched();
        this.registerForm.get('specialty')?.markAsTouched();
      }
    }
  }

  prevStep(): void {
    this.currentStep = 1;
    this.errorMessage = '';
  }

  goToStep(step: number): void {
    if (step === 2) {
      this.nextStep();
    } else {
      this.currentStep = 1;
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.isConfirmPasswordInvalid()) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formVal = this.registerForm.value;

    const roleEnumMap: Record<string, UserRole> = {
      Patient: UserRole.Patient,
      Doctor: UserRole.Doctor,
      Receptionist: UserRole.Receptionist
    };

    const genderNumber = formVal.gender === 'Female' ? 2 : 1;

    const registerDto: RegisterRequestDto = {
      fullName: formVal.fullName!.trim(),
      email: formVal.email!.trim(),
      phone: formVal.phoneNumber!.trim(),
      password: formVal.password!,
      roleName: roleEnumMap[this.selectedRole] || UserRole.Patient,
      dateOfBirth: formVal.dateOfBirth || null,
      gender: genderNumber,
      specialty: this.selectedRole === 'Doctor' ? formVal.specialty?.trim() : null,
      licenseNumber: this.selectedRole === 'Doctor' ? formVal.medicalLicenseNumber?.trim() : null
    };

    this.authService.register(registerDto).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.router.navigate(['/auth/login'], {
          queryParams: {
            registered: 'true',
            role: this.selectedRole,
            email: formVal.email?.trim() || ''
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 409) {
          this.errorMessage = this.langService.isRtl()
            ? 'الرقم القومي أو البريد الإلكتروني مسجل بالفعل في المنظومة.'
            : 'National ID or Email is already registered in Sehati.';
        } else {
          this.errorMessage = err.error?.message || (this.langService.isRtl()
            ? 'حدث خطأ أثناء إنشاء الحساب. يرجى التحقق من صحة البيانات.'
            : 'An error occurred during account creation. Please verify your data.');
        }
      }
    });
  }
}
