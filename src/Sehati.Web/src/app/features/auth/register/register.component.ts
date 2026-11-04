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
    <div class="medic-card register-card">
      <div class="card-header">
        <h1 class="register-title">{{ langService.t('registerTitle') }}</h1>
        <p class="register-subtitle">{{ langService.t('registerSubtitle') }}</p>
      </div>

      <!-- Error Alert -->
      <div class="medic-alert alert-error" *ngIf="errorMessage">
        <span class="material-symbols-outlined">error</span>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Role Selector Tabs -->
      <div class="role-selector">
        <button
          type="button"
          class="role-pill-btn"
          [class.active]="selectedRole === 'Patient'"
          (click)="selectRole('Patient')"
        >
          <span class="material-symbols-outlined">person</span>
          <span>{{ langService.t('rolePatient') }}</span>
        </button>

        <button
          type="button"
          class="role-pill-btn"
          [class.active]="selectedRole === 'Doctor'"
          (click)="selectRole('Doctor')"
        >
          <span class="material-symbols-outlined">stethoscope</span>
          <span>{{ langService.t('roleDoctor') }}</span>
        </button>

        <button
          type="button"
          class="role-pill-btn"
          [class.active]="selectedRole === 'Receptionist'"
          (click)="selectRole('Receptionist')"
        >
          <span class="material-symbols-outlined">support_agent</span>
          <span>{{ langService.t('roleReceptionist') }}</span>
        </button>
      </div>

      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
        <!-- Full Name -->
        <div class="medic-form-group">
          <label class="medic-label" for="fullName">
            <span>{{ langService.t('fullNameLabel') }}</span>
            <span class="req">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            formControlName="fullName"
            class="medic-input"
            [class.is-invalid]="isFieldInvalid('fullName')"
            [placeholder]="langService.isRtl() ? 'مثال: أحمد محمد علي' : 'e.g. Ahmed Mohamed Ali'"
            autocomplete="name"
          />
        </div>

        <!-- National ID -->
        <div class="medic-form-group">
          <label class="medic-label" for="nationalId">
            <span>{{ langService.t('nationalIdLabel') }}</span>
            <span class="req">*</span>
          </label>
          <input
            id="nationalId"
            type="text"
            formControlName="nationalId"
            class="medic-input"
            [class.is-invalid]="isFieldInvalid('nationalId')"
            placeholder="29901011234567"
            maxlength="14"
          />
        </div>

        <div class="form-row">
          <!-- Email -->
          <div class="medic-form-group">
            <label class="medic-label" for="email">
              <span>{{ langService.t('emailLabel') }}</span>
              <span class="req">*</span>
            </label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="medic-input"
              [class.is-invalid]="isFieldInvalid('email')"
              placeholder="user@example.com"
              autocomplete="email"
            />
          </div>

          <!-- Phone Number -->
          <div class="medic-form-group">
            <label class="medic-label" for="phoneNumber">
              <span>{{ langService.t('phoneNumberLabel') }}</span>
              <span class="req">*</span>
            </label>
            <input
              id="phoneNumber"
              type="tel"
              formControlName="phoneNumber"
              class="medic-input"
              [class.is-invalid]="isFieldInvalid('phoneNumber')"
              placeholder="01012345678"
              autocomplete="tel"
            />
          </div>
        </div>

        <!-- Password -->
        <div class="medic-form-group">
          <label class="medic-label" for="password">
            <span>{{ langService.t('passwordLabel') }}</span>
            <span class="req">*</span>
          </label>
          <input
            id="password"
            type="password"
            formControlName="password"
            class="medic-input"
            [class.is-invalid]="isFieldInvalid('password')"
            [placeholder]="langService.t('passwordPlaceholder')"
            autocomplete="new-password"
          />
        </div>

        <!-- Patient Extra Fields -->
        <ng-container *ngIf="selectedRole === 'Patient'">
          <div class="form-row">
            <div class="medic-form-group">
              <label class="medic-label" for="dateOfBirth">
                <span>{{ langService.t('dateOfBirthLabel') }}</span>
                <span class="req">*</span>
              </label>
              <input
                id="dateOfBirth"
                type="date"
                formControlName="dateOfBirth"
                class="medic-input"
              />
            </div>

            <div class="medic-form-group">
              <label class="medic-label" for="gender">
                <span>{{ langService.t('genderLabel') }}</span>
                <span class="req">*</span>
              </label>
              <select id="gender" formControlName="gender" class="medic-select">
                <option value="Male">{{ langService.t('genderMale') }}</option>
                <option value="Female">{{ langService.t('genderFemale') }}</option>
              </select>
            </div>
          </div>

          <div class="medic-form-group">
            <label class="medic-label" for="bloodType">
              <span>{{ langService.t('bloodTypeLabel') }}</span>
            </label>
            <select id="bloodType" formControlName="bloodType" class="medic-select">
              <option value="">{{ langService.isRtl() ? 'اختر فصيلة الدم' : 'Select Blood Type' }}</option>
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
        </ng-container>

        <!-- Doctor Extra Fields -->
        <ng-container *ngIf="selectedRole === 'Doctor'">
          <div class="form-row">
            <div class="medic-form-group">
              <label class="medic-label" for="licenseNumber">
                <span>{{ langService.t('licenseNumberLabel') }}</span>
                <span class="req">*</span>
              </label>
              <input
                id="licenseNumber"
                type="text"
                formControlName="licenseNumber"
                class="medic-input"
                placeholder="SYN-89412"
              />
            </div>

            <div class="medic-form-group">
              <label class="medic-label" for="specialty">
                <span>{{ langService.t('specialtyLabel') }}</span>
                <span class="req">*</span>
              </label>
              <input
                id="specialty"
                type="text"
                formControlName="specialty"
                class="medic-input"
                [placeholder]="langService.isRtl() ? 'مثال: باطنة، أطفال، عظام' : 'e.g. Cardiology, Pediatrics'"
              />
            </div>
          </div>
        </ng-container>

        <!-- Receptionist Extra Fields -->
        <ng-container *ngIf="selectedRole === 'Receptionist'">
          <div class="medic-form-group">
            <label class="medic-label" for="clinicId">
              <span>{{ langService.t('clinicIdLabel') }}</span>
              <span class="req">*</span>
            </label>
            <input
              id="clinicId"
              type="text"
              formControlName="clinicId"
              class="medic-input"
              placeholder="e.g. 1"
            />
          </div>
        </ng-container>

        <!-- Submit Button -->
        <button type="submit" class="medic-btn btn-primary submit-btn" [disabled]="registerForm.invalid || isLoading">
          <span class="medic-spinner" *ngIf="isLoading"></span>
          <span *ngIf="!isLoading">{{ langService.t('createAccountBtn') }}</span>
          <span class="material-symbols-outlined flip-rtl" *ngIf="!isLoading">arrow_forward</span>
        </button>
      </form>

      <!-- Footer navigation -->
      <div class="card-footer">
        <p class="login-prompt">
          {{ langService.t('alreadyHaveAccount') }}
          <a routerLink="/auth/login" class="link-highlight">{{ langService.t('signInBtn') }}</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .register-card {
      padding: 2.5rem 2.25rem;
    }

    .card-header {
      margin-bottom: 1.5rem;
      text-align: center;

      .register-title {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--color-text-brand);
        letter-spacing: -0.02em;
        margin-bottom: 0.45rem;
      }

      .register-subtitle {
        font-size: 0.9rem;
        color: var(--color-text-muted);
        line-height: 1.5;
      }
    }

    .role-selector {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      background: var(--color-surface-tint);
      padding: 0.35rem;
      border-radius: var(--radius-md);
      margin-bottom: 1.75rem;
      border: 1px solid var(--color-border-subtle);
    }

    .role-pill-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.65rem 0.5rem;
      border: none;
      background: transparent;
      color: var(--color-text-muted);
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      .material-symbols-outlined {
        font-size: 1.15rem;
      }

      &.active {
        background: linear-gradient(135deg, var(--color-primary-base) 0%, var(--color-primary-dark) 100%);
        color: #ffffff;
        box-shadow: 0 4px 10px rgba(8, 131, 149, 0.3);
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;

      @media (max-width: 580px) {
        grid-template-columns: 1fr;
      }
    }

    .submit-btn {
      width: 100%;
      padding: 0.85rem;
      font-size: 1.05rem;
      margin-top: 0.75rem;
    }

    .flip-rtl {
      transition: transform 0.2s ease;
    }

    :host-context([dir="rtl"]) .flip-rtl,
    :host-context(.rtl) .flip-rtl {
      transform: rotate(180deg);
    }

    .card-footer {
      margin-top: 1.75rem;
      text-align: center;
      padding-top: 1.25rem;
      border-top: 1px solid var(--color-border-subtle);

      .login-prompt {
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
      .register-card {
        padding: 1.75rem 1.25rem;
      }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  public langService = inject(LanguageService);

  isLoading = false;
  errorMessage: string | null = null;
  selectedRole: 'Patient' | 'Doctor' | 'Receptionist' = 'Patient';

  registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    nationalId: ['', [Validators.required, Validators.pattern(/^[0-9]{14}$/)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+]{10,15}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    // Patient Fields
    dateOfBirth: ['2000-01-01', [Validators.required]],
    gender: ['Male', [Validators.required]],
    bloodType: ['O+'],
    // Doctor Fields
    licenseNumber: [''],
    specialty: [''],
    // Receptionist Fields
    clinicId: ['']
  });

  selectRole(role: 'Patient' | 'Doctor' | 'Receptionist'): void {
    this.selectedRole = role;
    if (role === 'Doctor') {
      this.registerForm.get('licenseNumber')?.setValidators([Validators.required]);
      this.registerForm.get('specialty')?.setValidators([Validators.required]);
    } else {
      this.registerForm.get('licenseNumber')?.clearValidators();
      this.registerForm.get('specialty')?.clearValidators();
    }

    if (role === 'Receptionist') {
      this.registerForm.get('clinicId')?.setValidators([Validators.required]);
    } else {
      this.registerForm.get('clinicId')?.clearValidators();
    }

    this.registerForm.get('licenseNumber')?.updateValueAndValidity();
    this.registerForm.get('specialty')?.updateValueAndValidity();
    this.registerForm.get('clinicId')?.updateValueAndValidity();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const val = this.registerForm.value;
    const dto: RegisterRequestDto = {
      fullName: val.fullName!.trim(),
      email: val.email!.trim(),
      phone: val.phoneNumber!.trim(),
      password: val.password!,
      roleName: this.selectedRole as UserRole,
      dateOfBirth: this.selectedRole === 'Patient' ? val.dateOfBirth! : undefined,
      gender: this.selectedRole === 'Patient' ? (val.gender === 'Female' ? 2 : 1) : undefined,
      specialty: this.selectedRole === 'Doctor' ? val.specialty! : undefined,
      licenseNumber: this.selectedRole === 'Doctor' ? val.licenseNumber! : undefined
    };

    this.authService.register(dto).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message ||
          (this.langService.isRtl()
            ? 'فشل تسجيل الحساب. يرجى التحقق من صحة البيانات المدخلة.'
            : 'Registration failed. Please check the provided information.');
      }
    });
  }
}
