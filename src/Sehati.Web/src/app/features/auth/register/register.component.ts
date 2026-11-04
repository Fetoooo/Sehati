import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequestDto, UserRole } from '../../../core/models/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="medic-card register-card">
      <div class="card-header">
        <h1 class="register-title">Create Sehati Account</h1>
        <p class="register-subtitle">Connect your health passport across hospitals, clinics, and labs.</p>
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
          <span>Patient</span>
        </button>

        <button
          type="button"
          class="role-pill-btn"
          [class.active]="selectedRole === 'Doctor'"
          (click)="selectRole('Doctor')"
        >
          <span class="material-symbols-outlined">stethoscope</span>
          <span>Doctor</span>
        </button>

        <button
          type="button"
          class="role-pill-btn"
          [class.active]="selectedRole === 'Receptionist'"
          (click)="selectRole('Receptionist')"
        >
          <span class="material-symbols-outlined">support_agent</span>
          <span>Staff</span>
        </button>
      </div>

      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
        <!-- Full Name -->
        <div class="medic-form-group">
          <label class="medic-label" for="fullName">
            <span>Full Name</span>
            <span class="req">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            formControlName="fullName"
            class="medic-input"
            [class.is-invalid]="isFieldInvalid('fullName')"
            placeholder="e.g. Dr. Ahmed Mohamed or Sarah Ali"
          />
          <div class="error-text" *ngIf="isFieldInvalid('fullName')">
            Full name is required (min 2 characters).
          </div>
        </div>

        <!-- Email & Phone Grid -->
        <div class="form-row">
          <div class="medic-form-group">
            <label class="medic-label" for="email">
              <span>Email</span>
              <span class="req">*</span>
            </label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="medic-input"
              [class.is-invalid]="isFieldInvalid('email')"
              placeholder="name@example.com"
            />
            <div class="error-text" *ngIf="isFieldInvalid('email')">
              Valid email is required.
            </div>
          </div>

          <div class="medic-form-group">
            <label class="medic-label" for="phone">
              <span>Phone (+20...)</span>
              <span class="req">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              formControlName="phone"
              class="medic-input"
              [class.is-invalid]="isFieldInvalid('phone')"
              placeholder="+201012345678"
            />
            <div class="error-text" *ngIf="isFieldInvalid('phone')">
              International format required.
            </div>
          </div>
        </div>

        <!-- Role Specific: Doctor -->
        <div class="form-row" *ngIf="selectedRole === 'Doctor'">
          <div class="medic-form-group">
            <label class="medic-label" for="specialty">
              <span>Specialty</span>
              <span class="req">*</span>
            </label>
            <input
              id="specialty"
              type="text"
              formControlName="specialty"
              class="medic-input"
              placeholder="e.g. Cardiology, Pediatrics"
            />
          </div>

          <div class="medic-form-group">
            <label class="medic-label" for="licenseNumber">
              <span>License Number</span>
              <span class="req">*</span>
            </label>
            <input
              id="licenseNumber"
              type="text"
              formControlName="licenseNumber"
              class="medic-input"
              placeholder="e.g. DOC-98765"
            />
          </div>
        </div>

        <!-- Role Specific: Patient -->
        <div class="form-row" *ngIf="selectedRole === 'Patient'">
          <div class="medic-form-group">
            <label class="medic-label" for="dateOfBirth">
              <span>Date of Birth</span>
            </label>
            <input
              id="dateOfBirth"
              type="date"
              formControlName="dateOfBirth"
              class="medic-input"
            />
          </div>

          <div class="medic-form-group">
            <label class="medic-label" for="emergencyContact">
              <span>Emergency Contact</span>
            </label>
            <input
              id="emergencyContact"
              type="tel"
              formControlName="emergencyContact"
              class="medic-input"
              placeholder="+201099998888"
            />
          </div>
        </div>

        <!-- Password -->
        <div class="medic-form-group">
          <label class="medic-label" for="password">
            <span>Password (min 8 chars, 1 uppercase, 1 digit, 1 special)</span>
            <span class="req">*</span>
          </label>
          <input
            id="password"
            type="password"
            formControlName="password"
            class="medic-input"
            [class.is-invalid]="isFieldInvalid('password')"
            placeholder="••••••••"
          />
          <div class="error-text" *ngIf="isFieldInvalid('password')">
            Must contain 8+ chars with uppercase, lowercase, number, and special character.
          </div>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="medic-btn btn-primary submit-btn" [disabled]="registerForm.invalid || isLoading">
          <span class="medic-spinner" *ngIf="isLoading"></span>
          <span *ngIf="!isLoading">Register as {{ selectedRole }}</span>
          <span class="material-symbols-outlined" *ngIf="!isLoading">check_circle</span>
        </button>
      </form>

      <!-- Footer navigation -->
      <div class="card-footer">
        <p class="login-prompt">
          Already have an account?
          <a routerLink="/auth/login" class="link-highlight">Sign In</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .register-card {
      padding: 2.25rem 2rem;
    }

    .card-header {
      margin-bottom: 1.25rem;
      text-align: center;

      .register-title {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-main);
        letter-spacing: -0.02em;
        margin-bottom: 0.35rem;
      }

      .register-subtitle {
        font-size: 0.85rem;
        color: var(--text-secondary);
      }
    }

    .role-selector {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      background: rgba(15, 23, 42, 0.6);
      padding: 0.35rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      border: 1px solid var(--border-subtle);
    }

    .role-pill-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      padding: 0.55rem;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      .material-symbols-outlined {
        font-size: 1.1rem;
      }

      &.active {
        background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%);
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(20, 184, 166, 0.3);
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;

      @media (max-width: 480px) {
        grid-template-columns: 1fr;
      }
    }

    .submit-btn {
      width: 100%;
      padding: 0.8rem;
      font-size: 1rem;
      margin-top: 0.5rem;
    }

    .card-footer {
      margin-top: 1.5rem;
      text-align: center;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border-subtle);

      .login-prompt {
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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  selectedRole: UserRole = 'Patient';
  isLoading = false;
  errorMessage: string | null = null;

  registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^(\+?[0-9]{8,15})$/)]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/)
    ]],
    specialty: [''],
    licenseNumber: [''],
    dateOfBirth: [''],
    emergencyContact: ['']
  });

  selectRole(role: UserRole): void {
    this.selectedRole = role;
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
      phone: val.phone!.trim(),
      password: val.password!,
      roleName: this.selectedRole,
      specialty: this.selectedRole === 'Doctor' ? val.specialty?.trim() : undefined,
      licenseNumber: this.selectedRole === 'Doctor' ? val.licenseNumber?.trim() : undefined,
      dateOfBirth: this.selectedRole === 'Patient' && val.dateOfBirth ? val.dateOfBirth : undefined,
      emergencyContact: this.selectedRole === 'Patient' ? val.emergencyContact?.trim() : undefined
    };

    this.authService.register(dto).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Registration failed. Please check your data and try again.';
      }
    });
  }
}
