import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClinicalService } from '../../../core/services/clinical.service';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { AccessPermissionDto, ConsentScope } from '../../../core/models/clinical.models';

@Component({
  selector: 'app-consent',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="consent-page" [class.rtl]="langService.isRtl()">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-titles">
          <h1 class="page-title">{{ langService.isRtl() ? 'محرك الأذونات والخصوصية' : 'Dynamic Consent & Access Governance' }}</h1>
          <p class="page-subtitle">
            {{ langService.isRtl() 
                ? 'تحكم كامل في الأطباء والمراكز الطبية المصرح لهم بالاطلاع على سجلك الطبي أو إضافة كشوفات جديدة.' 
                : 'Granular patient-controlled consent. Manage who can view or append to your lifelong medical record.' }}
          </p>
        </div>
        <button class="medic-btn btn-primary" (click)="openGrantModal()">
          <span class="material-symbols-outlined">add_moderator</span>
          <span>{{ langService.isRtl() ? 'منح إذن جديد' : 'Grant New Permission' }}</span>
        </button>
      </header>

      <!-- Permissions List Grid -->
      <div class="permissions-grid">
        <div class="medic-card permission-card" *ngFor="let perm of permissions()" [class.revoked]="perm.isRevoked || !perm.isActive">
          <div class="card-head">
            <div class="provider-info">
              <span class="material-symbols-outlined provider-icon">
                {{ perm.doctorId ? 'stethoscope' : 'local_hospital' }}
              </span>
              <div>
                <h3 class="provider-name">{{ perm.doctorName || perm.clinicName || 'Healthcare Provider' }}</h3>
                <span class="provider-sub">{{ perm.clinicName ? perm.clinicName : (langService.isRtl() ? 'طبيب معالج' : 'Licensed Physician') }}</span>
              </div>
            </div>

            <span class="medic-badge" [class.badge-success]="perm.isActive && !perm.isRevoked" [class.badge-danger]="perm.isRevoked || !perm.isActive">
              {{ perm.isActive && !perm.isRevoked ? (langService.isRtl() ? 'ساري ومفعل' : 'Active') : (langService.isRtl() ? 'ملغي / منتهي' : 'Revoked') }}
            </span>
          </div>

          <div class="card-body">
            <div class="permission-scope-badge">
              <span class="material-symbols-outlined">shield</span>
              <span>
                {{ perm.scope === 'ViewAndAddRecords' 
                    ? (langService.isRtl() ? 'صلاحية العرض والإضافة (View & Add)' : 'View & Add Records') 
                    : (langService.isRtl() ? 'صلاحية العرض فقط (View Only)' : 'View Only') }}
              </span>
            </div>

            <div class="dates-meta">
              <span><strong>{{ langService.isRtl() ? 'تاريخ المنح:' : 'Granted:' }}</strong> {{ perm.grantedAt | date:'mediumDate' }}</span>
              <span *ngIf="perm.expiresAt"><strong>{{ langService.isRtl() ? 'ينتهي في:' : 'Expires:' }}</strong> {{ perm.expiresAt | date:'mediumDate' }}</span>
              <span *ngIf="!perm.expiresAt"><strong>{{ langService.isRtl() ? 'المدة:' : 'Duration:' }}</strong> {{ langService.isRtl() ? 'دائم حتى الإلغاء' : 'Indefinite' }}</span>
            </div>
          </div>

          <div class="card-actions" *ngIf="perm.isActive && !perm.isRevoked">
            <button class="medic-btn btn-danger btn-sm" (click)="revokePermission(perm.id)">
              <span class="material-symbols-outlined">block</span>
              <span>{{ langService.isRtl() ? 'إلغاء الصلاحية فوراً' : 'Revoke Access' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Grant Permission Modal Drawer -->
      <div class="modal-backdrop" *ngIf="showGrantModal">
        <div class="medic-card modal-dialog">
          <div class="modal-header">
            <h3>{{ langService.isRtl() ? 'منح صلاحية وصول جديدة' : 'Authorize Healthcare Provider' }}</h3>
            <button class="close-btn" (click)="closeGrantModal()">&times;</button>
          </div>

          <form [formGroup]="grantForm" (ngSubmit)="onGrantSubmit()">
            <div class="medic-form-group">
              <label class="medic-label">{{ langService.isRtl() ? 'اسم الطبيب المعالج' : 'Doctor Name' }}</label>
              <input class="medic-input" formControlName="doctorName" placeholder="e.g. Dr. Tarek Mostafa" />
            </div>

            <div class="medic-form-group">
              <label class="medic-label">{{ langService.isRtl() ? 'العيادة / المستشفى' : 'Clinic / Hospital' }}</label>
              <input class="medic-input" formControlName="clinicName" placeholder="e.g. Sehati Specialized Heart Clinic" />
            </div>

            <div class="medic-form-group">
              <label class="medic-label">{{ langService.isRtl() ? 'مستوى الصلاحية' : 'Permission Scope' }} <span class="req">*</span></label>
              <select class="medic-select" formControlName="scope">
                <option value="ViewOnly">{{ langService.isRtl() ? 'الاطلاع فقط على السجل الطبي (View Only)' : 'View Only (Read clinical chart)' }}</option>
                <option value="ViewAndAddRecords">{{ langService.isRtl() ? 'الاطلاع وإضافة كشوفات وروشتات (View & Add)' : 'View & Add Records (Consultation & Prescriptions)' }}</option>
              </select>
            </div>

            <div class="medic-form-group">
              <label class="medic-label">{{ langService.isRtl() ? 'مدة الصلاحية' : 'Access Expiration' }} <span class="req">*</span></label>
              <select class="medic-select" formControlName="expiryDays">
                <option [value]="1">{{ langService.isRtl() ? '24 ساعة (كشف عاجل)' : '24 Hours (Urgent Visit)' }}</option>
                <option [value]="7">{{ langService.isRtl() ? 'أسبوع واحد (متابعة واستشارة)' : '1 Week (Standard Review)' }}</option>
                <option [value]="30">{{ langService.isRtl() ? 'شهر واحد' : '30 Days' }}</option>
                <option [value]="null">{{ langService.isRtl() ? 'دائم حتى الإلغاء اليدوي' : 'Indefinite (Until manually revoked)' }}</option>
              </select>
            </div>

            <div class="modal-actions">
              <button type="button" class="medic-btn btn-outline" (click)="closeGrantModal()">
                {{ langService.isRtl() ? 'إلغاء' : 'Cancel' }}
              </button>
              <button type="submit" class="medic-btn btn-primary" [disabled]="grantForm.invalid">
                {{ langService.isRtl() ? 'تأكيد ومنح الصلاحية' : 'Authorize Access' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .consent-page {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;

      &.rtl {
        direction: rtl;
        text-align: right;
      }
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--color-text-brand);
      letter-spacing: -0.02em;
    }

    .page-subtitle {
      font-size: 0.925rem;
      color: var(--color-text-muted);
      margin-top: 0.25rem;
      max-width: 700px;
    }

    .permissions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .permission-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1.25rem;
      border: 1.5px solid var(--color-border-subtle);

      &.revoked {
        opacity: 0.7;
        background: var(--color-surface-tint);
      }
    }

    .card-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .provider-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .provider-icon {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-md);
        background: var(--color-primary-surface);
        color: var(--color-primary-base);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4rem;
      }

      .provider-name {
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--color-text-main);
      }

      .provider-sub {
        font-size: 0.785rem;
        color: var(--color-text-muted);
      }
    }

    .card-body {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .permission-scope-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.85rem;
      border-radius: var(--radius-sm);
      background: var(--color-surface-tint);
      color: var(--color-primary-dark);
      font-size: 0.825rem;
      font-weight: 700;
      border: 1px solid rgba(8, 131, 149, 0.2);

      .material-symbols-outlined {
        font-size: 1.1rem;
        color: var(--color-primary-base);
      }
    }

    .dark-theme .permission-scope-badge {
      color: var(--color-primary-accent);
    }

    .dates-meta {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.825rem;
      color: var(--color-text-muted);
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 0.75rem;
      border-top: 1px solid var(--color-border-subtle);

      .btn-sm {
        padding: 0.45rem 0.85rem;
        font-size: 0.85rem;
      }
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(10, 77, 104, 0.45);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-dialog {
      width: 100%;
      max-width: 500px;
      padding: 2.25rem 2rem;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;

      .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--color-text-muted);
      }
    }

    .modal-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }
  `]
})
export class ConsentComponent implements OnInit {
  private clinicalService = inject(ClinicalService);
  private authService = inject(AuthService);
  public langService = inject(LanguageService);
  private fb = inject(FormBuilder);

  public user = this.authService.currentUser;
  public permissions = signal<AccessPermissionDto[]>([]);
  public showGrantModal = false;

  public grantForm = this.fb.group({
    doctorName: ['Dr. Mahmoud Hassan'],
    clinicName: ['Cairo Medical Center'],
    scope: ['ViewAndAddRecords' as ConsentScope, Validators.required],
    expiryDays: [7]
  });

  ngOnInit(): void {
    this.loadPermissions();
  }

  loadPermissions(): void {
    const patientId = String(this.user()?.id || this.user()?.userId || 'demo-patient');
    this.clinicalService.getConsentPermissions(patientId).subscribe({
      next: (res) => this.permissions.set(res),
      error: () => {
        // Fallback demo permissions
        this.permissions.set([
          {
            id: 'perm-1',
            patientId: patientId,
            patientName: this.user()?.fullName || 'Patient',
            doctorId: 'doc-1',
            doctorName: 'Dr. Sarah Ahmed',
            clinicName: 'Sehati Specialized Clinic',
            scope: 'ViewAndAddRecords',
            grantedAt: '2026-11-01T10:00:00Z',
            expiresAt: '2026-11-08T10:00:00Z',
            isRevoked: false,
            isActive: true
          },
          {
            id: 'perm-2',
            patientId: patientId,
            patientName: this.user()?.fullName || 'Patient',
            clinicId: 'clinic-1',
            clinicName: 'Nile Diagnostics Center',
            scope: 'ViewOnly',
            grantedAt: '2026-10-25T14:30:00Z',
            expiresAt: '2026-11-25T14:30:00Z',
            isRevoked: false,
            isActive: true
          }
        ]);
      }
    });
  }

  openGrantModal(): void {
    this.showGrantModal = true;
  }

  closeGrantModal(): void {
    this.showGrantModal = false;
  }

  onGrantSubmit(): void {
    if (this.grantForm.invalid) return;

    const val = this.grantForm.value;
    const newPerm: AccessPermissionDto = {
      id: 'perm-' + Date.now(),
      patientId: String(this.user()?.id || this.user()?.userId || 'demo-p1'),
      patientName: this.user()?.fullName || 'Patient',
      doctorName: val.doctorName || null,
      clinicName: val.clinicName || null,
      scope: val.scope!,
      grantedAt: new Date().toISOString(),
      expiresAt: val.expiryDays ? new Date(Date.now() + val.expiryDays * 86400000).toISOString() : null,
      isRevoked: false,
      isActive: true
    };

    this.permissions.update((list) => [newPerm, ...list]);
    this.closeGrantModal();
  }

  revokePermission(permissionId: string): void {
    this.permissions.update((list) =>
      list.map((p) => (p.id === permissionId ? { ...p, isRevoked: true, isActive: false } : p))
    );
  }
}

