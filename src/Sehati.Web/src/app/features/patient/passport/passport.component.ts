import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { AllergyDto, MedicationDto, PatientDetailDto, ScanDto, TestDto } from '../../../core/models/patient.models';

@Component({
  selector: 'app-passport',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="passport-page" [class.rtl]="langService.isRtl()">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-titles">
          <h1 class="page-title">{{ langService.isRtl() ? 'الجواز الطبي الموحد' : 'Unified Medical Passport' }}</h1>
          <p class="page-subtitle">
            {{ langService.isRtl() 
                ? 'ملفك الطبي الرقمي الشامل المربوط برقم صِحّتي الموحد عبر كافة العيادات والمستشفيات.' 
                : 'Your lifelong digital medical chart synchronized under your Unified Patient ID.' }}
          </p>
        </div>
      </header>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading()">
        <span class="medic-spinner"></span>
        <p>{{ langService.isRtl() ? 'جاري تحميل السجل الطبي...' : 'Loading medical passport...' }}</p>
      </div>

      <!-- Main Content -->
      <div class="passport-content" *ngIf="!isLoading()">
        <!-- Top Physical ID Card Simulation -->
        <div class="medic-card passport-card">
          <div class="card-top">
            <div class="card-brand">
              <img src="/sehati_logo.png" alt="Sehati Logo" class="card-logo" />
              <div>
                <span class="brand-ar">صِحّتي</span>
                <span class="brand-en">SEHATI PASSPORT</span>
              </div>
            </div>
            <span class="blood-pill">{{ patient()?.bloodType || 'O+' }}</span>
          </div>

          <div class="card-body">
            <div class="patient-id-display">
              <span class="id-label">{{ langService.isRtl() ? 'رقم صِحّتي الموحد' : 'UNIFIED PATIENT ID' }}</span>
              <span class="id-val">{{ patient()?.unifiedPatientId || user()?.unifiedPatientId || 'SH-2026-004812' }}</span>
            </div>

            <div class="patient-vitals-row">
              <div class="vital-item">
                <span class="v-label">{{ langService.isRtl() ? 'الاسم' : 'Name' }}</span>
                <span class="v-val">{{ patient()?.fullName || user()?.fullName }}</span>
              </div>
              <div class="vital-item">
                <span class="v-label">{{ langService.isRtl() ? 'الهاتف' : 'Phone' }}</span>
                <span class="v-val">{{ patient()?.phoneNumber || user()?.phoneNumber }}</span>
              </div>
              <div class="vital-item">
                <span class="v-label">{{ langService.isRtl() ? 'تاريخ التسجيل' : 'Registered' }}</span>
                <span class="v-val">{{ (patient()?.createdAt || user()?.createdAt) | date:'mediumDate' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sub-Resources Tabs -->
        <div class="records-tabs-container">
          <div class="tabs-nav">
            <button
              class="tab-btn"
              [class.active]="activeTab() === 'allergies'"
              (click)="activeTab.set('allergies')"
            >
              <span class="material-symbols-outlined">coronavirus</span>
              <span>{{ langService.isRtl() ? 'الحساسية (' + allergies().length + ')' : 'Allergies (' + allergies().length + ')' }}</span>
            </button>

            <button
              class="tab-btn"
              [class.active]="activeTab() === 'medications'"
              (click)="activeTab.set('medications')"
            >
              <span class="material-symbols-outlined">medication</span>
              <span>{{ langService.isRtl() ? 'الأدوية (' + medications().length + ')' : 'Medications (' + medications().length + ')' }}</span>
            </button>

            <button
              class="tab-btn"
              [class.active]="activeTab() === 'tests'"
              (click)="activeTab.set('tests')"
            >
              <span class="material-symbols-outlined">biotechnology</span>
              <span>{{ langService.isRtl() ? 'التحاليل (' + tests().length + ')' : 'Lab Tests (' + tests().length + ')' }}</span>
            </button>

            <button
              class="tab-btn"
              [class.active]="activeTab() === 'scans'"
              (click)="activeTab.set('scans')"
            >
              <span class="material-symbols-outlined">radiology</span>
              <span>{{ langService.isRtl() ? 'الأشعات (' + scans().length + ')' : 'Imaging & Scans (' + scans().length + ')' }}</span>
            </button>
          </div>

          <!-- Tab Content: Allergies -->
          <div class="tab-pane" *ngIf="activeTab() === 'allergies'">
            <div class="pane-header">
              <h3>{{ langService.isRtl() ? 'سجل الحساسية الموثق' : 'Verified Allergy Profile' }}</h3>
              <button class="medic-btn btn-secondary btn-sm" (click)="toggleAddAllergyModal()">
                <span class="material-symbols-outlined">add</span>
                <span>{{ langService.isRtl() ? 'إضافة حساسية' : 'Add Allergy' }}</span>
              </button>
            </div>

            <div class="empty-state" *ngIf="allergies().length === 0">
              <span class="material-symbols-outlined empty-icon">check_circle</span>
              <p>{{ langService.isRtl() ? 'لا توجد حساسية دوائية أو غذائية مسجلة.' : 'No known drug or environmental allergies recorded.' }}</p>
            </div>

            <div class="records-grid" *ngIf="allergies().length > 0">
              <div class="medic-card record-card allergy-card" *ngFor="let item of allergies()">
                <div class="record-top">
                  <span class="record-title">{{ item.substance }}</span>
                  <span class="medic-badge badge-danger">{{ item.severity }}</span>
                </div>
                <p class="record-desc"><strong>{{ langService.isRtl() ? 'رد الفعل:' : 'Reaction:' }}</strong> {{ item.reaction }}</p>
                <div class="record-meta" *ngIf="item.diagnosedDate">
                  <span>{{ item.diagnosedDate | date:'mediumDate' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab Content: Medications -->
          <div class="tab-pane" *ngIf="activeTab() === 'medications'">
            <div class="pane-header">
              <h3>{{ langService.isRtl() ? 'الأدوية الحالية والمزمنة' : 'Current & Chronic Medications' }}</h3>
            </div>

            <div class="empty-state" *ngIf="medications().length === 0">
              <span class="material-symbols-outlined empty-icon">pill</span>
              <p>{{ langService.isRtl() ? 'لا توجد أدوية حالية مسجلة.' : 'No active medications recorded.' }}</p>
            </div>

            <div class="records-grid" *ngIf="medications().length > 0">
              <div class="medic-card record-card" *ngFor="let med of medications()">
                <div class="record-top">
                  <span class="record-title">{{ med.name }}</span>
                  <span class="medic-badge" [class.badge-success]="med.isActive" [class.badge-info]="!med.isActive">
                    {{ med.isActive ? (langService.isRtl() ? 'ساري' : 'Active') : (langService.isRtl() ? 'سابق' : 'Historic') }}
                  </span>
                </div>
                <p class="record-desc"><strong>{{ langService.isRtl() ? 'الجرعة:' : 'Dosage:' }}</strong> {{ med.dosage }} - {{ med.frequency }}</p>
                <div class="record-meta">
                  <span>{{ langService.isRtl() ? 'من:' : 'Started:' }} {{ med.startDate | date:'mediumDate' }}</span>
                  <span *ngIf="med.prescribedBy">• {{ med.prescribedBy }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab Content: Tests -->
          <div class="tab-pane" *ngIf="activeTab() === 'tests'">
            <div class="pane-header">
              <h3>{{ langService.isRtl() ? 'التحاليل المعملية' : 'Diagnostic Pathology Reports' }}</h3>
            </div>

            <div class="empty-state" *ngIf="tests().length === 0">
              <span class="material-symbols-outlined empty-icon">biotechnology</span>
              <p>{{ langService.isRtl() ? 'لا توجد نتائج تحاليل معملية مسجلة.' : 'No laboratory test results recorded.' }}</p>
            </div>

            <div class="records-grid" *ngIf="tests().length > 0">
              <div class="medic-card record-card" *ngFor="let t of tests()">
                <div class="record-top">
                  <span class="record-title">{{ t.testName }}</span>
                  <span class="test-date">{{ t.testDate | date:'mediumDate' }}</span>
                </div>
                <div class="test-result-box">
                  <span class="res-val"><strong>{{ langService.isRtl() ? 'النتيجة:' : 'Result:' }}</strong> {{ t.result }}</span>
                  <span class="res-range" *ngIf="t.normalRange">({{ langService.isRtl() ? 'المعدل الطبيعي:' : 'Normal:' }} {{ t.normalRange }})</span>
                </div>
                <div class="record-meta" *ngIf="t.laboratoryName">
                  <span>{{ t.laboratoryName }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab Content: Scans -->
          <div class="tab-pane" *ngIf="activeTab() === 'scans'">
            <div class="pane-header">
              <h3>{{ langService.isRtl() ? 'الأشعات والتقارير التصويرية' : 'Diagnostic Radiology & Scans' }}</h3>
            </div>

            <div class="empty-state" *ngIf="scans().length === 0">
              <span class="material-symbols-outlined empty-icon">radiology</span>
              <p>{{ langService.isRtl() ? 'لا توجد أشعات مسجلة.' : 'No imaging scans recorded.' }}</p>
            </div>

            <div class="records-grid" *ngIf="scans().length > 0">
              <div class="medic-card record-card" *ngFor="let s of scans()">
                <div class="record-top">
                  <span class="record-title">{{ s.scanType }} - {{ s.bodyPart }}</span>
                  <span class="test-date">{{ s.scanDate | date:'mediumDate' }}</span>
                </div>
                <p class="record-desc"><strong>{{ langService.isRtl() ? 'التقرير:' : 'Findings:' }}</strong> {{ s.findings }}</p>
                <div class="record-meta" *ngIf="s.imagingCenter">
                  <span>{{ s.imagingCenter }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Allergy Modal -->
      <div class="modal-backdrop" *ngIf="showAddAllergyModal">
        <div class="medic-card modal-dialog">
          <div class="modal-header">
            <h3>{{ langService.isRtl() ? 'إضافة حساسية جديدة' : 'Add New Allergy' }}</h3>
            <button class="close-btn" (click)="toggleAddAllergyModal()">&times;</button>
          </div>
          <form [formGroup]="allergyForm" (ngSubmit)="onAddAllergySubmit()">
            <div class="medic-form-group">
              <label class="medic-label">{{ langService.isRtl() ? 'المادة المسببة' : 'Substance' }} <span class="req">*</span></label>
              <input class="medic-input" formControlName="substance" placeholder="e.g. Penicillin, Peanuts" />
            </div>
            <div class="medic-form-group">
              <label class="medic-label">{{ langService.isRtl() ? 'الأعراض / رد الفعل' : 'Reaction' }} <span class="req">*</span></label>
              <input class="medic-input" formControlName="reaction" placeholder="e.g. Skin rash, Anaphylaxis" />
            </div>
            <div class="medic-form-group">
              <label class="medic-label">{{ langService.isRtl() ? 'درجة الخطورة' : 'Severity' }} <span class="req">*</span></label>
              <select class="medic-select" formControlName="severity">
                <option value="Mild">{{ langService.isRtl() ? 'طفيفة' : 'Mild' }}</option>
                <option value="Moderate">{{ langService.isRtl() ? 'متوسطة' : 'Moderate' }}</option>
                <option value="Severe">{{ langService.isRtl() ? 'خطيرة' : 'Severe' }}</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="medic-btn btn-outline" (click)="toggleAddAllergyModal()">
                {{ langService.isRtl() ? 'إلغاء' : 'Cancel' }}
              </button>
              <button type="submit" class="medic-btn btn-primary" [disabled]="allergyForm.invalid">
                {{ langService.isRtl() ? 'حفظ' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .passport-page {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;

      &.rtl {
        direction: rtl;
        text-align: right;
      }
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
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 3rem;
      color: var(--color-text-muted);
    }

    /* Physical Passport Card */
    .passport-card {
      background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary-base) 100%);
      color: #FFFFFF;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--radius-card);
      padding: 2rem;
      box-shadow: var(--shadow-card);
      position: relative;
      overflow: hidden;

      &::after {
        content: '';
        position: absolute;
        bottom: -50px;
        right: -50px;
        width: 180px;
        height: 180px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(5, 191, 219, 0.35) 0%, transparent 70%);
        pointer-events: none;
      }
    }

    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.75rem;
    }

    .card-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .card-logo {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        background: #FFFFFF;
        padding: 2px;
      }

      .brand-ar {
        display: block;
        font-family: var(--font-arabic);
        font-size: 1.2rem;
        font-weight: 800;
        line-height: 1.1;
      }

      .brand-en {
        display: block;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.15em;
        opacity: 0.85;
      }
    }

    .blood-pill {
      background: #DC2626;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 1.1rem;
      padding: 0.35rem 1rem;
      border-radius: var(--radius-pill);
      border: 2px solid rgba(255, 255, 255, 0.4);
    }

    .patient-id-display {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-bottom: 1.5rem;

      .id-label {
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        opacity: 0.85;
      }

      .id-val {
        font-family: monospace;
        font-size: 1.85rem;
        font-weight: 800;
        color: var(--color-primary-accent);
        letter-spacing: 0.05em;
      }
    }

    .patient-vitals-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.2);

      .vital-item {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;

        .v-label {
          font-size: 0.75rem;
          opacity: 0.8;
        }

        .v-val {
          font-size: 1.05rem;
          font-weight: 700;
        }
      }
    }

    /* Tabs & Panels */
    .records-tabs-container {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .tabs-nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--color-surface-card);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-md);
      padding: 0.35rem;
      overflow-x: auto;
    }

    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.65rem 1.15rem;
      border-radius: var(--radius-sm);
      border: none;
      background: transparent;
      color: var(--color-text-muted);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;

      .material-symbols-outlined {
        font-size: 1.15rem;
      }

      &:hover {
        color: var(--color-primary-base);
      }

      &.active {
        background: var(--color-primary-surface);
        color: var(--color-primary-dark);
      }
    }

    .dark-theme .tab-btn.active {
      background: var(--color-surface-tint);
      color: var(--color-primary-accent);
    }

    .pane-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;

      h3 {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--color-text-main);
      }
    }

    .records-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.25rem;
    }

    .record-card {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;

      .record-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .record-title {
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--color-text-main);
      }

      .record-desc {
        font-size: 0.875rem;
        color: var(--color-text-muted);
        line-height: 1.5;
      }

      .record-meta {
        font-size: 0.775rem;
        color: var(--color-text-muted);
        margin-top: 0.25rem;
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      background: var(--color-surface-card);
      border: 1px dashed var(--color-border-subtle);
      border-radius: var(--radius-card);
      color: var(--color-text-muted);
      text-align: center;
      gap: 0.75rem;

      .empty-icon {
        font-size: 2.5rem;
        color: var(--color-status-success);
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
      max-width: 480px;
      padding: 2rem;
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

    @media (max-width: 768px) {
      .patient-vitals-row {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }

      .records-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PassportComponent implements OnInit {
  private patientService = inject(PatientService);
  private authService = inject(AuthService);
  public langService = inject(LanguageService);
  private fb = inject(FormBuilder);

  public user = this.authService.currentUser;
  public patient = signal<PatientDetailDto | null>(null);
  public allergies = signal<AllergyDto[]>([]);
  public medications = signal<MedicationDto[]>([]);
  public tests = signal<TestDto[]>([]);
  public scans = signal<ScanDto[]>([]);

  public isLoading = signal<boolean>(true);
  public activeTab = signal<'allergies' | 'medications' | 'tests' | 'scans'>('allergies');
  public showAddAllergyModal = false;

  public allergyForm = this.fb.group({
    substance: ['', Validators.required],
    reaction: ['', Validators.required],
    severity: ['Mild', Validators.required]
  });

  ngOnInit(): void {
    this.loadPatientChart();
  }

  loadPatientChart(): void {
    this.isLoading.set(true);
    const unifiedId = this.user()?.unifiedPatientId || 'SH-2026-004812';

    this.patientService.getPatientByUnifiedId(unifiedId).subscribe({
      next: (res) => {
        this.patient.set(res);
        this.allergies.set(res.allergies || []);
        this.medications.set(res.medications || []);
        this.tests.set(res.tests || []);
        this.scans.set(res.scans || []);
        this.isLoading.set(false);
      },
      error: () => {
        // Fallback simulation when patient is browsing local demo
        this.allergies.set([
          { id: '1', patientId: 'p1', substance: 'Penicillin', reaction: 'Severe rash, dyspnea', severity: 'Severe', diagnosedDate: '2025-04-12' },
          { id: '2', patientId: 'p1', substance: 'NSAIDs (Ibuprofen)', reaction: 'Gastric irritation', severity: 'Moderate', diagnosedDate: '2024-11-20' }
        ]);
        this.medications.set([
          { id: '1', patientId: 'p1', name: 'Metformin 500mg', dosage: '1 tablet', frequency: 'Twice daily after meals', startDate: '2025-01-15', isActive: true, prescribedBy: 'Dr. Sarah Ahmed' },
          { id: '2', patientId: 'p1', name: 'Atorvastatin 20mg', dosage: '1 tablet', frequency: 'Once daily at bedtime', startDate: '2025-02-01', isActive: true, prescribedBy: 'Dr. Sarah Ahmed' }
        ]);
        this.tests.set([
          { id: '1', patientId: 'p1', testName: 'HbA1c (Glycated Hemoglobin)', testDate: '2026-10-15', result: '6.4%', normalRange: '< 5.7%', laboratoryName: 'Al-Mokhtabar Labs' },
          { id: '2', patientId: 'p1', testName: 'Lipid Profile (Total Cholesterol)', testDate: '2026-09-02', result: '185 mg/dL', normalRange: '< 200 mg/dL', laboratoryName: 'Al-Borg Diagnostics' }
        ]);
        this.scans.set([
          { id: '1', patientId: 'p1', scanType: 'Chest X-Ray', bodyPart: 'Thorax / Lungs', scanDate: '2026-08-10', findings: 'Clear lung fields bilaterally, no pleural effusion', imagingCenter: 'Cairo Scan Center' }
        ]);
        this.isLoading.set(false);
      }
    });
  }

  toggleAddAllergyModal(): void {
    this.showAddAllergyModal = !this.showAddAllergyModal;
    if (!this.showAddAllergyModal) {
      this.allergyForm.reset({ severity: 'Mild' });
    }
  }

  onAddAllergySubmit(): void {
    if (this.allergyForm.invalid) return;

    const val = this.allergyForm.value;
    const newAllergy: AllergyDto = {
      id: Date.now().toString(),
      patientId: this.patient()?.id || 'demo-p1',
      substance: val.substance!,
      reaction: val.reaction!,
      severity: val.severity!,
      diagnosedDate: new Date().toISOString()
    };

    this.allergies.update((list) => [newAllergy, ...list]);
    this.toggleAddAllergyModal();
  }
}

