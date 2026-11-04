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
      <!-- Switcher Tabs -->
      <div class="auth-switch-tabs">
        <a routerLink="/auth/login" class="tab-item">
          <span class="material-symbols-outlined">login</span>
          <span>{{ langService.t('signInBtn') }}</span>
        </a>
        <a routerLink="/auth/register" class="tab-item active">
          <span class="material-symbols-outlined">person_add</span>
          <span>{{ langService.t('createAccountLink') }}</span>
        </a>
      </div>

      <div class="auth-main-card">
        <div class="card-titles">
          <h1 class="main-title">{{ langService.t('registerTitle') }}</h1>
          <p class="subtitle">{{ langService.t('registerSubtitle') }}</p>
        </div>

        <!-- Role Selector Chips -->
        <div class="role-selector-group">
          <label class="role-prompt">{{ langService.isRtl() ? 'اختر نوع الحساب في المنظومة:' : 'Select Account Persona:' }}</label>
          <div class="roles-grid">
            <button
              type="button"
              class="role-card-btn"
              [class.active]="selectedRole === 'Patient'"
              (click)="selectRole('Patient')"
            >
              <div class="role-icon-box">
                <span class="material-symbols-outlined">person</span>
              </div>
              <div class="role-info">
                <span class="role-name">{{ langService.t('rolePatient') }}</span>
                <span class="role-sub">{{ langService.isRtl() ? 'جواز صحي موحد' : 'Health Passport' }}</span>
              </div>
            </button>

            <button
              type="button"
              class="role-card-btn"
              [class.active]="selectedRole === 'Doctor'"
              (click)="selectRole('Doctor')"
            >
              <div class="role-icon-box">
                <span class="material-symbols-outlined">stethoscope</span>
              </div>
              <div class="role-info">
                <span class="role-name">{{ langService.t('roleDoctor') }}</span>
                <span class="role-sub">{{ langService.isRtl() ? 'عيادة وروشتات' : 'Clinical Practice' }}</span>
              </div>
            </button>

            <button
              type="button"
              class="role-card-btn"
              [class.active]="selectedRole === 'Receptionist'"
              (click)="selectRole('Receptionist')"
            >
              <div class="role-icon-box">
                <span class="material-symbols-outlined">support_agent</span>
              </div>
              <div class="role-info">
                <span class="role-name">{{ langService.t('roleReceptionist') }}</span>
                <span class="role-sub">{{ langService.isRtl() ? 'إدارة الدخول' : 'Desk & Queue' }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Error Alert -->
        <div class="auth-alert alert-error" *ngIf="errorMessage">
          <span class="material-symbols-outlined">error</span>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Form -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="modern-auth-form">
          <div class="form-row-2">
            <!-- Full Name -->
            <div class="input-field-group">
              <label class="field-label" for="fullName">
                <span>{{ langService.t('fullNameLabel') }}</span>
                <span class="req">*</span>
              </label>
              <div class="input-with-icon">
                <span class="material-symbols-outlined leading-icon">badge</span>
                <input
                  id="fullName"
                  type="text"
                  formControlName="fullName"
                  class="field-input"
                  [class.invalid]="isFieldInvalid('fullName')"
                  [placeholder]="langService.isRtl() ? 'مثال: أحمد محمود حسن' : 'e.g. Ahmed Mahmoud Hassan'"
                  autocomplete="name"
                />
              </div>
            </div>

            <!-- National ID -->
            <div class="input-field-group">
              <label class="field-label" for="nationalId">
                <span>{{ langService.t('nationalIdLabel') }}</span>
                <span class="req">*</span>
              </label>
              <div class="input-with-icon">
                <span class="material-symbols-outlined leading-icon">pin</span>
                <input
                  id="nationalId"
                  type="text"
                  formControlName="nationalId"
                  class="field-input"
                  [class.invalid]="isFieldInvalid('nationalId')"
                  placeholder="29805121601234"
                  maxlength="14"
                />
              </div>
            </div>
          </div>

          <div class="form-row-2">
            <!-- Email -->
            <div class="input-field-group">
              <label class="field-label" for="email">
                <span>{{ langService.t('emailLabel') }}</span>
                <span class="req">*</span>
              </label>
              <div class="input-with-icon">
                <span class="material-symbols-outlined leading-icon">mail</span>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="field-input"
                  [class.invalid]="isFieldInvalid('email')"
                  placeholder="user@sehati.com"
                  autocomplete="email"
                />
              </div>
            </div>

            <!-- Phone Number -->
            <div class="input-field-group">
              <label class="field-label" for="phoneNumber">
                <span>{{ langService.t('phoneNumberLabel') }}</span>
                <span class="req">*</span>
              </label>
              <div class="input-with-icon">
                <span class="material-symbols-outlined leading-icon">call</span>
                <input
                  id="phoneNumber"
                  type="tel"
                  formControlName="phoneNumber"
                  class="field-input"
                  [class.invalid]="isFieldInvalid('phoneNumber')"
                  placeholder="01012345678"
                  autocomplete="tel"
                />
              </div>
            </div>
          </div>

          <div class="form-row-3">
            <!-- Date of Birth -->
            <div class="input-field-group">
              <label class="field-label" for="dateOfBirth">
                <span>{{ langService.t('dateOfBirthLabel') }}</span>
                <span class="req">*</span>
              </label>
              <input
                id="dateOfBirth"
                type="date"
                formControlName="dateOfBirth"
                class="field-input no-icon"
                [class.invalid]="isFieldInvalid('dateOfBirth')"
              />
            </div>

            <!-- Gender -->
            <div class="input-field-group">
              <label class="field-label" for="gender">
                <span>{{ langService.t('genderLabel') }}</span>
                <span class="req">*</span>
              </label>
              <select id="gender" formControlName="gender" class="field-input no-icon">
                <option value="Male">{{ langService.t('genderMale') }}</option>
                <option value="Female">{{ langService.t('genderFemale') }}</option>
              </select>
            </div>

            <!-- Blood Type -->
            <div class="input-field-group">
              <label class="field-label" for="bloodType">
                <span>{{ langService.t('bloodTypeLabel') }}</span>
              </label>
              <select id="bloodType" formControlName="bloodType" class="field-input no-icon">
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

          <!-- Doctor Specific Fields -->
          <div class="form-row-2 doctor-extra-fields" *ngIf="selectedRole === 'Doctor'">
            <div class="input-field-group">
              <label class="field-label" for="specialty">
                <span>{{ langService.t('specialtyLabel') }}</span>
                <span class="req">*</span>
              </label>
              <div class="input-with-icon">
                <span class="material-symbols-outlined leading-icon">medical_services</span>
                <input
                  id="specialty"
                  type="text"
                  formControlName="specialty"
                  class="field-input"
                  [placeholder]="langService.isRtl() ? 'مثال: باطنة وقلب' : 'e.g. Cardiology'"
                />
              </div>
            </div>

            <div class="input-field-group">
              <label class="field-label" for="licenseNumber">
                <span>{{ langService.t('licenseNumberLabel') }}</span>
                <span class="req">*</span>
              </label>
              <div class="input-with-icon">
                <span class="material-symbols-outlined leading-icon">verified_user</span>
                <input
                  id="licenseNumber"
                  type="text"
                  formControlName="licenseNumber"
                  class="field-input"
                  placeholder="MD-89102-EG"
                />
              </div>
            </div>
          </div>

          <!-- Password Row -->
          <div class="form-row-2">
            <div class="input-field-group">
              <label class="field-label" for="password">
                <span>{{ langService.t('passwordLabel') }}</span>
                <span class="req">*</span>
              </label>
              <div class="input-with-icon">
                <span class="material-symbols-outlined leading-icon">lock</span>
                <input
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  class="field-input"
                  [class.invalid]="isFieldInvalid('password')"
                  placeholder="••••••••"
                  autocomplete="new-password"
                />
                <button type="button" class="trailing-toggle-btn" (click)="showPassword = !showPassword">
                  <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <div class="input-field-group">
              <label class="field-label" for="confirmPassword">
                <span>{{ langService.isRtl() ? 'تأكيد كلمة المرور' : 'Confirm Password' }}</span>
                <span class="req">*</span>
              </label>
              <div class="input-with-icon">
                <span class="material-symbols-outlined leading-icon">lock_reset</span>
                <input
                  id="confirmPassword"
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="confirmPassword"
                  class="field-input"
                  [class.invalid]="isFieldInvalid('confirmPassword') || isPasswordMismatch()"
                  placeholder="••••••••"
                  autocomplete="new-password"
                />
              </div>
              <div class="field-error-msg" *ngIf="isPasswordMismatch()">
                {{ langService.isRtl() ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.' }}
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="submit-action-btn" [disabled]="registerForm.invalid || isLoading || isPasswordMismatch()">
            <span class="loading-spinner" *ngIf="isLoading"></span>
            <span *ngIf="!isLoading">{{ langService.t('createAccountBtn') }}</span>
            <span class="material-symbols-outlined flip-rtl" *ngIf="!isLoading">arrow_forward</span>
          </button>
        </form>

        <!-- Bottom Links -->
        <div class="card-bottom-bar">
          <p class="create-account-text">
            {{ langService.t('alreadyHaveAccount') }}
            <a routerLink="/auth/login" class="action-link">{{ langService.t('signInBtn') }}</a>
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
    .auth-card-container.register-container {
      width: 100%;
      max-width: 640px;
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

    .role-selector-group {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;

      .role-prompt {
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--color-text-muted);
      }

      .roles-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;

        .role-card-btn {
          background: var(--color-bg-app);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-md);
          padding: 0.85rem 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;

          .role-icon-box {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: var(--color-surface-card);
            color: var(--color-text-muted);
            display: flex;
            align-items: center;
            justify-content: center;
            span { font-size: 1.3rem; }
          }

          .role-info {
            display: flex;
            flex-direction: column;
            align-items: center;

            .role-name {
              font-size: 0.85rem;
              font-weight: 800;
              color: var(--color-text-main);
            }

            .role-sub {
              font-size: 0.68rem;
              color: var(--color-text-muted);
            }
          }

          &:hover {
            border-color: var(--color-primary-ocean);
          }

          &.active {
            background: rgba(8, 131, 149, 0.08);
            border-color: var(--color-primary-ocean);

            .role-icon-box {
              background: var(--color-primary-ocean);
              color: #fff;
            }

            .role-info .role-name {
              color: var(--color-primary-deep);
            }
          }
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
      gap: 1rem;
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.85rem;
    }

    .form-row-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0.85rem;
    }

    .input-field-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;

      .field-label {
        font-size: 0.82rem;
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
          left: 0.85rem;
          color: var(--color-text-muted);
          font-size: 1.15rem;
          pointer-events: none;
        }

        .field-input {
          width: 100%;
          padding: 0.65rem 0.85rem 0.65rem 2.5rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border-subtle);
          background: var(--color-bg-app);
          color: var(--color-text-main);
          font-size: 0.9rem;
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
          right: 0.65rem;
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
        }
      }

      .field-input.no-icon {
        padding: 0.65rem 0.85rem;
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-subtle);
        background: var(--color-bg-app);
        color: var(--color-text-main);
        font-size: 0.9rem;

        &:focus {
          outline: none;
          border-color: var(--color-primary-ocean);
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
        right: 0.85rem;
      }
      .field-input {
        padding: 0.65rem 2.5rem 0.65rem 0.85rem;
      }
      .trailing-toggle-btn {
        right: auto;
        left: 0.65rem;
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
      margin-top: 0.5rem;

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

    @media (max-width: 600px) {
      .form-row-2, .form-row-3 {
        grid-template-columns: 1fr;
      }
      .role-selector-group .roles-grid {
        grid-template-columns: 1fr;
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
