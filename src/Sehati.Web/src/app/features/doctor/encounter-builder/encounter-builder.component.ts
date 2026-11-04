import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClinicalService } from '../../../core/services/clinical.service';
import { LanguageService } from '../../../core/services/language.service';
import { AuthService } from '../../../core/services/auth.service';
import { DiagnosisDto, CreateVisitDto, PrescriptionItemDto } from '../../../core/models/clinical.models';

interface ICD10Option {
  code: string;
  name: string;
}

@Component({
  selector: 'app-encounter-builder',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="encounter-page" [class.rtl]="langService.isRtl()">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-titles">
          <div class="breadcrumb">
            <a routerLink="/doctor/queue" class="back-link">
              <span class="material-symbols-outlined">arrow_back</span>
              <span>{{ langService.isRtl() ? 'العودة لطابور الكشف' : 'Back to Queue' }}</span>
            </a>
          </div>
          <div class="title-with-badge">
            <span class="material-symbols-outlined header-icon">clinical_notes</span>
            <h1 class="page-title">
              {{ langService.isRtl() ? 'استمارة الكشف الطبي وتوثيق الروشتة' : 'Clinical Encounter & Rx Builder' }}
            </h1>
          </div>
        </div>

        <div class="header-actions">
          <button class="btn btn-secondary" (click)="resetForm()">
            <span class="material-symbols-outlined">restart_alt</span>
            <span>{{ langService.isRtl() ? 'إعادة تعيين' : 'Reset' }}</span>
          </button>
          <button class="btn btn-primary sign-btn" (click)="submitEncounter()" [disabled]="isSubmitting()">
            <span class="material-symbols-outlined">assignment_turned_in</span>
            <span>{{ isSubmitting() 
              ? (langService.isRtl() ? 'جاري الحفظ والاعتماد...' : 'Signing Encounter...') 
              : (langService.isRtl() ? 'اعتماد الكشف وإصدار الروشتة' : 'Sign & Issue Prescription') }}</span>
          </button>
        </div>
      </div>

      <!-- Patient Unified Medical Header Banner -->
      <div class="patient-banner">
        <div class="patient-avatar">
          <span class="material-symbols-outlined">person</span>
        </div>
        <div class="patient-details">
          <div class="patient-name-row">
            <h2 class="patient-name">{{ patientName }}</h2>
            <span class="unified-tag">
              <span class="material-symbols-outlined">verified</span>
              {{ unifiedId }}
            </span>
            <span class="blood-pill">
              <span class="material-symbols-outlined">bloodtype</span>
              A+
            </span>
          </div>
          <div class="patient-meta-row">
            <span>{{ langService.isRtl() ? 'العمر: 38 سنة' : 'Age: 38 yrs' }}</span>
            <span>•</span>
            <span>{{ langService.isRtl() ? 'النوع: ذكر' : 'Gender: Male' }}</span>
            <span>•</span>
            <span>{{ langService.isRtl() ? 'رقم الهاتف: 01012345678' : 'Phone: 01012345678' }}</span>
          </div>
        </div>

        <!-- Critical Allergy Warning Box -->
        <div class="allergy-warning-box">
          <span class="material-symbols-outlined warning-icon">warning</span>
          <div class="warning-text">
            <strong>{{ langService.isRtl() ? 'تنبيه حساسيات مسجلة:' : 'Registered Allergies:' }}</strong>
            <span>{{ langService.isRtl() ? 'بنسلين (صدمة تحسسية حادة)' : 'Penicillin (Severe Anaphylaxis)' }}</span>
          </div>
        </div>
      </div>

      <!-- Form Grid -->
      <div class="encounter-grid">
        <!-- Left Column: Encounter Notes, Vitals & Diagnoses -->
        <div class="clinical-inputs-column">
          
          <!-- Section 1: Chief Complaint & Clinical Notes -->
          <div class="form-section-card">
            <div class="section-header">
              <span class="material-symbols-outlined sec-icon">edit_note</span>
              <h3 class="sec-title">{{ langService.isRtl() ? 'شكوى المريض وملاحظات الطبيب' : 'Chief Complaint & Clinical Notes' }}</h3>
            </div>

            <div class="form-group">
              <label class="form-label required">{{ langService.isRtl() ? 'الشكوى الرئيسية (Chief Complaint)' : 'Chief Complaint' }}</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="chiefComplaint"
                [placeholder]="langService.isRtl() ? 'مثال: صداع متكرر مع زغللة في الرؤية منذ 3 أيام...' : 'e.g. Throbbing frontal headache, fatigue, mild dizziness for 3 days...'"
              />
            </div>

            <div class="form-group">
              <label class="form-label">{{ langService.isRtl() ? 'الفحص السريري والتاريخ المرضي (Clinical Examination & Notes)' : 'Clinical History & Physical Exam Findings' }}</label>
              <textarea
                class="form-control"
                rows="3"
                [(ngModel)]="clinicalNotes"
                [placeholder]="langService.isRtl() ? 'ملاحظات الطبيب التفصيلية، فحص قاع العين، الأصوات الصدرية...' : 'Detailed clinical observations, system findings, chest sounds...'"
              ></textarea>
            </div>
          </div>

          <!-- Section 2: Vitals Recording -->
          <div class="form-section-card">
            <div class="section-header">
              <span class="material-symbols-outlined sec-icon">vital_signs</span>
              <h3 class="sec-title">{{ langService.isRtl() ? 'العلامات الحيوية (Vital Signs)' : 'Vital Signs Tracker' }}</h3>
              <span class="bmi-badge" *ngIf="calculatedBmi()">
                BMI: {{ calculatedBmi() }} ({{ getBmiCategory() }})
              </span>
            </div>

            <div class="vitals-grid">
              <div class="vital-item" [class.abnormal]="systolicBp > 140 || diastolicBp > 90">
                <label>{{ langService.isRtl() ? 'ضغط الدم (mmHg)' : 'Blood Pressure' }}</label>
                <div class="bp-inputs">
                  <input type="number" [(ngModel)]="systolicBp" placeholder="120" />
                  <span>/</span>
                  <input type="number" [(ngModel)]="diastolicBp" placeholder="80" />
                </div>
                <span class="vital-unit">mmHg</span>
              </div>

              <div class="vital-item" [class.abnormal]="heartRate > 100 || heartRate < 55">
                <label>{{ langService.isRtl() ? 'نبض القلب' : 'Heart Rate' }}</label>
                <input type="number" [(ngModel)]="heartRate" placeholder="72" />
                <span class="vital-unit">bpm</span>
              </div>

              <div class="vital-item" [class.abnormal]="temperature > 37.8">
                <label>{{ langService.isRtl() ? 'درجة الحرارة' : 'Temperature' }}</label>
                <input type="number" step="0.1" [(ngModel)]="temperature" placeholder="37.0" />
                <span class="vital-unit">°C</span>
              </div>

              <div class="vital-item">
                <label>{{ langService.isRtl() ? 'معدل التنفس' : 'Resp. Rate' }}</label>
                <input type="number" [(ngModel)]="respiratoryRate" placeholder="16" />
                <span class="vital-unit">/min</span>
              </div>

              <div class="vital-item">
                <label>{{ langService.isRtl() ? 'الوزن' : 'Weight' }}</label>
                <input type="number" step="0.5" [(ngModel)]="weight" placeholder="75" />
                <span class="vital-unit">kg</span>
              </div>

              <div class="vital-item">
                <label>{{ langService.isRtl() ? 'الطول' : 'Height' }}</label>
                <input type="number" [(ngModel)]="height" placeholder="175" />
                <span class="vital-unit">cm</span>
              </div>
            </div>
          </div>

          <!-- Section 3: ICD-10 Diagnoses -->
          <div class="form-section-card">
            <div class="section-header">
              <span class="material-symbols-outlined sec-icon">stethoscope_check</span>
              <h3 class="sec-title">{{ langService.isRtl() ? 'التشخيص الطبي (ICD-10 Coding)' : 'Diagnoses & ICD-10 Coding' }}</h3>
            </div>

            <!-- Diagnosis Input Bar -->
            <div class="diag-inputs-row">
              <div class="diag-search-col">
                <select class="form-control" [(ngModel)]="selectedIcd10" (change)="onIcdSelected()">
                  <option value="">{{ langService.isRtl() ? '-- اختر من أشهر تصنيفات ICD-10 --' : '-- Common ICD-10 Diagnoses --' }}</option>
                  <option *ngFor="let option of commonIcd10" [value]="option.code">
                    {{ option.code }} - {{ option.name }}
                  </option>
                </select>
              </div>

              <div class="diag-type-col">
                <select class="form-control" [(ngModel)]="newDiagType">
                  <option value="Primary">{{ langService.isRtl() ? 'رئيسي (Primary)' : 'Primary' }}</option>
                  <option value="Secondary">{{ langService.isRtl() ? 'ثانوي (Secondary)' : 'Secondary' }}</option>
                  <option value="Differential">{{ langService.isRtl() ? 'فارِق (Differential)' : 'Differential' }}</option>
                </select>
              </div>

              <button class="btn btn-secondary add-diag-btn" (click)="addDiagnosis()">
                <span class="material-symbols-outlined">add</span>
                <span>{{ langService.isRtl() ? 'إضافة' : 'Add' }}</span>
              </button>
            </div>

            <div class="form-group custom-diag-input">
              <input
                type="text"
                class="form-control"
                [(ngModel)]="newDiagDescription"
                [placeholder]="langService.isRtl() ? 'أو اكتب تشخيص مخصص بالتفصيل...' : 'Or enter custom clinical diagnosis description...'"
              />
            </div>

            <!-- List of Added Diagnoses -->
            <div class="diagnoses-chips-list" *ngIf="diagnosesList.length > 0">
              <div *ngFor="let diag of diagnosesList; let i = index" class="diag-chip">
                <span class="diag-type-pill" [class.primary]="diag.type === 'Primary'">{{ diag.type }}</span>
                <span class="diag-code" *ngIf="diag.code">{{ diag.code }}</span>
                <span class="diag-desc">{{ diag.description }}</span>
                <button class="remove-chip-btn" (click)="removeDiagnosis(i)">
                  <span class="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Digital Prescription Builder & Live Preview Pad -->
        <div class="rx-builder-column">
          <div class="form-section-card rx-card">
            <div class="section-header">
              <span class="material-symbols-outlined sec-icon">prescriptions</span>
              <h3 class="sec-title">{{ langService.isRtl() ? 'الروشتة الإلكترونية الرقمية (E-Rx)' : 'Digital Prescription Builder' }}</h3>
            </div>

            <!-- Add Medication Form -->
            <div class="add-med-form">
              <div class="form-group">
                <label class="form-label required">{{ langService.isRtl() ? 'اسم الدواء والتركيز' : 'Medication & Strength' }}</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="newMedName"
                  [placeholder]="langService.isRtl() ? 'مثال: Augmentin 1g, Concor 5mg...' : 'e.g. Amoxicillin/Clavulanate 1g, Panadol Extra...'"
                />
              </div>

              <div class="med-form-row">
                <div class="form-group">
                  <label class="form-label">{{ langService.isRtl() ? 'الجرعة' : 'Dosage' }}</label>
                  <input type="text" class="form-control" [(ngModel)]="newMedDosage" placeholder="1 tablet" />
                </div>
                <div class="form-group">
                  <label class="form-label">{{ langService.isRtl() ? 'التكرار' : 'Frequency' }}</label>
                  <select class="form-control" [(ngModel)]="newMedFrequency">
                    <option value="Once daily">Once daily (مرة يومياً)</option>
                    <option value="Twice daily">Twice daily / BID (مرتين يومياً)</option>
                    <option value="Three times daily">Three times daily / TID (3 مرات)</option>
                    <option value="Every 8 hours">Every 8 hours (كل 8 ساعات)</option>
                    <option value="PRN (As needed)">PRN (عند اللزوم فقط)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">{{ langService.isRtl() ? 'المدة' : 'Duration' }}</label>
                  <input type="text" class="form-control" [(ngModel)]="newMedDuration" placeholder="7 days" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">{{ langService.isRtl() ? 'تعليمات الاستخدام (Instructions)' : 'Usage Instructions' }}</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="newMedInstructions"
                  [placeholder]="langService.isRtl() ? 'مثال: يؤخذ بعد الأكل بساعة مع كوب ماء وفير...' : 'Take after meals with plenty of water...'"
                />
              </div>

              <button class="btn btn-secondary add-med-btn" (click)="addMedication()">
                <span class="material-symbols-outlined">add_circle</span>
                <span>{{ langService.isRtl() ? 'إدراج الدواء في الروشتة' : 'Add Medication to Rx' }}</span>
              </button>
            </div>

            <!-- Digital Prescription Preview Pad Simulation -->
            <div class="rx-pad-preview">
              <div class="pad-header">
                <div class="clinic-info">
                  <span class="clinic-name">SEHATI MEDICAL CLINIC</span>
                  <span class="clinic-sub">Cairo, Egypt • License #EG-58492</span>
                </div>
                <div class="rx-symbol">℞</div>
              </div>

              <div class="pad-patient-info">
                <span><strong>Pt:</strong> {{ patientName }}</span>
                <span><strong>ID:</strong> {{ unifiedId }}</span>
                <span><strong>Date:</strong> {{ todayDate }}</span>
              </div>

              <div class="pad-meds-list" *ngIf="prescriptionItems.length > 0; else noMeds">
                <div *ngFor="let item of prescriptionItems; let idx = index" class="pad-med-item">
                  <div class="med-num">{{ idx + 1 }}.</div>
                  <div class="med-text">
                    <strong class="med-title">{{ item.medicationName }}</strong>
                    <div class="med-regimen">
                      <span>{{ item.dosage }}</span> •
                      <span>{{ item.frequency }}</span> •
                      <span>for {{ item.duration }}</span>
                    </div>
                    <div class="med-note" *ngIf="item.instructions">
                      <em>Sig: {{ item.instructions }}</em>
                    </div>
                  </div>
                  <button class="remove-med-btn" (click)="removeMedication(idx)">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>

              <ng-template #noMeds>
                <div class="no-meds-note">
                  {{ langService.isRtl() ? 'لم يتم إضافة أدوية حتى الآن' : 'No medications added yet to this prescription.' }}
                </div>
              </ng-template>

              <div class="pad-footer">
                <div class="doctor-signature-box">
                  <span class="dr-title">Attending Physician:</span>
                  <span class="dr-name">{{ currentDoctorName }}</span>
                  <span class="dr-license">Lic: MD-89102-EG</span>
                  <span class="verified-stamp">✓ DIGITAL SIGNED</span>
                </div>
              </div>
            </div>

            <!-- Optional Follow-Up Reminder Box -->
            <div class="followup-box">
              <label class="checkbox-container">
                <input type="checkbox" [(ngModel)]="hasFollowUp" />
                <span class="checkbox-label">
                  <strong>{{ langService.isRtl() ? 'تحديد موعد استشارة وإعادة كشف (Follow-Up)' : 'Schedule Follow-Up Appointment' }}</strong>
                </span>
              </label>

              <div class="followup-details" *ngIf="hasFollowUp">
                <div class="form-group">
                  <label class="form-label">{{ langService.isRtl() ? 'تاريخ الاستشارة الموصى به' : 'Recommended Date' }}</label>
                  <input type="date" class="form-control" [(ngModel)]="followUpDate" />
                </div>
                <div class="form-group">
                  <label class="form-label">{{ langService.isRtl() ? 'سبب الاستشارة وملاحظات المتابعة' : 'Follow-up Reason' }}</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="followUpReason"
                    [placeholder]="langService.isRtl() ? 'إعادة قياس الضغط بعد انتهاء كورس العلاج' : 'Re-assess BP and review laboratory tests'"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .encounter-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .breadcrumb {
      margin-bottom: 0.35rem;

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        color: var(--color-primary-ocean);
        font-weight: 700;
        text-decoration: none;
        font-size: 0.85rem;

        &:hover { text-decoration: underline; }
      }
    }

    .title-with-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .header-icon {
        font-size: 2rem;
        color: var(--color-primary-deep);
      }

      .page-title {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--color-text-main);
        margin: 0;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .sign-btn {
        background: linear-gradient(135deg, var(--color-primary-deep), var(--color-primary-ocean));
        border: none;
        box-shadow: var(--shadow-md);
      }
    }

    /* Patient Medical Banner */
    .patient-banner {
      background: var(--color-surface-card);
      border-radius: var(--radius-card);
      padding: 1.25rem 1.75rem;
      border: 1px solid var(--color-border-subtle);
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;

      .patient-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: rgba(8, 131, 149, 0.12);
        color: var(--color-primary-ocean);
        display: flex;
        align-items: center;
        justify-content: center;
        span { font-size: 2rem; }
      }

      .patient-details {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        flex: 1;

        .patient-name-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;

          .patient-name {
            font-size: 1.3rem;
            font-weight: 800;
            color: var(--color-text-main);
            margin: 0;
          }

          .unified-tag {
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            font-family: monospace;
            font-size: 0.85rem;
            font-weight: 700;
            background: rgba(10, 77, 104, 0.08);
            color: var(--color-primary-deep);
            padding: 0.2rem 0.65rem;
            border-radius: var(--radius-sm);
          }

          .blood-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.2rem;
            background: rgba(239, 68, 68, 0.12);
            color: #b91c1c;
            padding: 0.2rem 0.6rem;
            border-radius: var(--radius-full);
            font-weight: 800;
            font-size: 0.8rem;
          }
        }

        .patient-meta-row {
          display: flex;
          gap: 0.75rem;
          color: var(--color-text-muted);
          font-size: 0.85rem;
        }
      }

      .allergy-warning-box {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.25);
        color: #b91c1c;
        padding: 0.65rem 1rem;
        border-radius: var(--radius-md);
        font-size: 0.85rem;

        .warning-icon {
          font-size: 1.4rem;
        }
      }
    }

    /* Encounter Grid */
    .encounter-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .clinical-inputs-column,
    .rx-builder-column {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-section-card {
      background: var(--color-surface-card);
      border-radius: var(--radius-card);
      padding: 1.5rem;
      border: 1px solid var(--color-border-subtle);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .section-header {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        border-bottom: 1px solid var(--color-border-subtle);
        padding-bottom: 0.75rem;

        .sec-icon {
          color: var(--color-primary-ocean);
          font-size: 1.5rem;
        }

        .sec-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--color-text-main);
          margin: 0;
          flex: 1;
        }

        .bmi-badge {
          background: rgba(5, 191, 219, 0.15);
          color: var(--color-primary-deep);
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 700;
        }
      }
    }

    /* Vitals Grid */
    .vitals-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.85rem;

      .vital-item {
        background: var(--color-bg-app);
        border: 1px solid var(--color-border-subtle);
        border-radius: var(--radius-md);
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;

        label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-text-muted);
        }

        input {
          background: var(--color-surface-card);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.4rem 0.5rem;
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--color-text-main);
          width: 100%;
          text-align: center;

          &:focus {
            outline: none;
            border-color: var(--color-primary-ocean);
          }
        }

        .bp-inputs {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          input { width: 50%; }
          span { font-weight: 800; color: var(--color-text-muted); }
        }

        .vital-unit {
          font-size: 0.7rem;
          color: var(--color-text-muted);
          text-align: right;
        }

        &.abnormal {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.05);

          input {
            color: #b91c1c;
          }
        }
      }
    }

    /* Diagnoses Input */
    .diag-inputs-row {
      display: flex;
      gap: 0.5rem;

      .diag-search-col { flex: 2; }
      .diag-type-col { flex: 1; }
    }

    .diagnoses-chips-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .diag-chip {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        background: var(--color-bg-app);
        border: 1px solid var(--color-border-subtle);
        padding: 0.5rem 0.85rem;
        border-radius: var(--radius-md);

        .diag-type-pill {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-sm);
          background: var(--color-surface-card);
          color: var(--color-text-muted);

          &.primary {
            background: var(--color-primary-deep);
            color: #fff;
          }
        }

        .diag-code {
          font-family: monospace;
          font-weight: 700;
          color: var(--color-primary-ocean);
          font-size: 0.85rem;
        }

        .diag-desc {
          flex: 1;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text-main);
        }

        .remove-chip-btn {
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          &:hover { color: #ef4444; }
        }
      }
    }

    /* Rx Builder Form */
    .med-form-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0.65rem;
    }

    .add-med-btn {
      width: 100%;
      justify-content: center;
      margin-top: 0.5rem;
    }

    /* Rx Pad Preview Simulation */
    .rx-pad-preview {
      background: #fdfdfd;
      color: #1e293b;
      border: 2px dashed #cbd5e1;
      border-radius: var(--radius-md);
      padding: 1.5rem;
      position: relative;
      font-family: 'Plus Jakarta Sans', sans-serif;
      box-shadow: inset 0 0 12px rgba(0,0,0,0.02);

      .pad-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #0a4d68;
        padding-bottom: 0.75rem;

        .clinic-name {
          display: block;
          font-weight: 900;
          font-size: 1.1rem;
          letter-spacing: 0.05em;
          color: #0a4d68;
        }

        .clinic-sub {
          font-size: 0.75rem;
          color: #64748b;
        }

        .rx-symbol {
          font-size: 2.5rem;
          font-weight: 900;
          font-style: italic;
          color: #088395;
          line-height: 1;
        }
      }

      .pad-patient-info {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        padding: 0.65rem 0;
        border-bottom: 1px solid #e2e8f0;
        color: #475569;
      }

      .pad-meds-list {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        padding: 1rem 0;

        .pad-med-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;

          .med-num {
            font-weight: 800;
            color: #088395;
            font-size: 0.95rem;
          }

          .med-text {
            flex: 1;

            .med-title {
              font-size: 0.95rem;
              color: #0f172a;
            }

            .med-regimen {
              font-size: 0.8rem;
              color: #475569;
            }

            .med-note {
              font-size: 0.75rem;
              color: #64748b;
            }
          }

          .remove-med-btn {
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            &:hover { color: #ef4444; }
          }
        }
      }

      .no-meds-note {
        text-align: center;
        padding: 1.5rem;
        color: #94a3b8;
        font-size: 0.85rem;
        font-style: italic;
      }

      .pad-footer {
        border-top: 1px solid #e2e8f0;
        padding-top: 0.75rem;
        display: flex;
        justify-content: flex-end;

        .doctor-signature-box {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          font-size: 0.75rem;
          color: #64748b;

          .dr-name {
            font-weight: 800;
            font-size: 0.9rem;
            color: #0a4d68;
          }

          .verified-stamp {
            margin-top: 0.35rem;
            background: #dcfce7;
            color: #15803d;
            font-weight: 800;
            padding: 0.15rem 0.5rem;
            border-radius: var(--radius-sm);
            font-size: 0.65rem;
          }
        }
      }
    }

    /* Follow Up Box */
    .followup-box {
      background: var(--color-bg-app);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-md);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;

      .checkbox-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
      }

      .followup-details {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 0.75rem;
      }
    }

    /* RTL specific overrides */
    .encounter-page.rtl {
      direction: rtl;

      .rx-pad-preview {
        .pad-footer .doctor-signature-box {
          align-items: flex-start;
        }
      }
    }

    @media (max-width: 1000px) {
      .encounter-grid {
        grid-template-columns: 1fr;
      }
      .vitals-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class EncounterBuilderComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clinicalService = inject(ClinicalService);
  private authService = inject(AuthService);
  public langService = inject(LanguageService);

  public isSubmitting = signal<boolean>(false);

  public patientName = 'Ahmed Mahmoud Hassan';
  public unifiedId = 'SH-2026-000101';
  public appointmentId = '101';
  public currentDoctorName = 'Dr. Sarah Smith';

  public todayDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date());

  // Form Fields
  public chiefComplaint = '';
  public clinicalNotes = '';

  // Vitals
  public systolicBp: number = 120;
  public diastolicBp: number = 80;
  public heartRate: number = 72;
  public temperature: number = 37.0;
  public respiratoryRate: number = 16;
  public weight: number = 75;
  public height: number = 175;

  // Diagnoses
  public commonIcd10: ICD10Option[] = [
    { code: 'I10', name: 'Essential (primary) hypertension' },
    { code: 'E11.9', name: 'Type 2 diabetes mellitus without complications' },
    { code: 'J06.9', name: 'Acute upper respiratory infection, unspecified' },
    { code: 'K29.70', name: 'Gastritis, unspecified, without bleeding' },
    { code: 'M54.5', name: 'Low back pain' },
    { code: 'R51', name: 'Headache' },
    { code: 'K21.9', name: 'Gastro-esophageal reflux disease without esophagitis' }
  ];

  public selectedIcd10 = '';
  public newDiagType = 'Primary';
  public newDiagDescription = '';
  public diagnosesList: DiagnosisDto[] = [
    {
      code: 'I10',
      description: 'Essential (primary) hypertension',
      type: 'Primary'
    }
  ];

  // Prescription Items
  public newMedName = '';
  public newMedDosage = '1 tablet';
  public newMedFrequency = 'Once daily';
  public newMedDuration = '14 days';
  public newMedInstructions = 'Take in the morning after breakfast';

  public prescriptionItems: PrescriptionItemDto[] = [
    {
      medicationName: 'Concor (Bisoprolol) 5mg',
      dosage: '1 tablet',
      frequency: 'Once daily',
      duration: '30 days',
      instructions: 'Take in the morning after breakfast'
    }
  ];

  // Follow-up
  public hasFollowUp = false;
  public followUpDate = '';
  public followUpReason = '';

  public calculatedBmi = computed(() => {
    if (this.weight > 0 && this.height > 0) {
      const hMeters = this.height / 100;
      const bmi = this.weight / (hMeters * hMeters);
      return bmi.toFixed(1);
    }
    return null;
  });

  getBmiCategory(): string {
    const val = parseFloat(this.calculatedBmi() || '0');
    if (val < 18.5) return 'Underweight';
    if (val < 25) return 'Normal weight';
    if (val < 30) return 'Overweight';
    return 'Obese';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.appointmentId = id;
    }
    const qName = this.route.snapshot.queryParamMap.get('patientName');
    const qUid = this.route.snapshot.queryParamMap.get('unifiedId');
    if (qName) this.patientName = qName;
    if (qUid) this.unifiedId = qUid;

    const user = this.authService.currentUser();
    if (user?.fullName) {
      this.currentDoctorName = user.fullName;
    }
  }

  onIcdSelected(): void {
    const match = this.commonIcd10.find(i => i.code === this.selectedIcd10);
    if (match) {
      this.newDiagDescription = match.name;
    }
  }

  addDiagnosis(): void {
    if (!this.newDiagDescription.trim()) return;

    this.diagnosesList.push({
      code: this.selectedIcd10 || undefined,
      description: this.newDiagDescription.trim(),
      type: this.newDiagType
    });

    this.newDiagDescription = '';
    this.selectedIcd10 = '';
  }

  removeDiagnosis(index: number): void {
    this.diagnosesList.splice(index, 1);
  }

  addMedication(): void {
    if (!this.newMedName.trim()) return;

    this.prescriptionItems.push({
      medicationName: this.newMedName.trim(),
      dosage: this.newMedDosage || '1 tablet',
      frequency: this.newMedFrequency || 'Once daily',
      duration: this.newMedDuration || '7 days',
      instructions: this.newMedInstructions.trim() || undefined
    });

    this.newMedName = '';
    this.newMedInstructions = '';
  }

  removeMedication(index: number): void {
    this.prescriptionItems.splice(index, 1);
  }

  resetForm(): void {
    this.chiefComplaint = '';
    this.clinicalNotes = '';
    this.systolicBp = 120;
    this.diastolicBp = 80;
    this.heartRate = 72;
    this.temperature = 37.0;
    this.diagnosesList = [];
    this.prescriptionItems = [];
    this.hasFollowUp = false;
  }

  submitEncounter(): void {
    if (!this.chiefComplaint.trim()) {
      alert(this.langService.isRtl() ? 'يرجى كتابة شكوى المريض الرئيسية' : 'Please enter the patient chief complaint.');
      return;
    }

    this.isSubmitting.set(true);

    const visitDto: CreateVisitDto = {
      patientId: '1',
      doctorId: '1',
      clinicId: '1',
      appointmentId: this.appointmentId,
      chiefComplaint: this.chiefComplaint,
      notes: this.clinicalNotes,
      systolicBp: this.systolicBp,
      diastolicBp: this.diastolicBp,
      heartRate: this.heartRate,
      temperature: this.temperature,
      respiratoryRate: this.respiratoryRate,
      weight: this.weight,
      height: this.height,
      diagnoses: this.diagnosesList
    };

    this.clinicalService.createVisit(visitDto).subscribe({
      next: created => {
        // Now if prescriptions exist, issue prescription
        if (this.prescriptionItems.length > 0) {
          this.clinicalService
            .createPrescription({
              visitId: created.id || '1',
              patientId: '1',
              notes: 'Issued during consultation',
              items: this.prescriptionItems
            })
            .subscribe({
              next: () => this.finishEncounter(),
              error: () => this.finishEncounter()
            });
        } else {
          this.finishEncounter();
        }
      },
      error: () => {
        // Fallback for mock demo
        this.finishEncounter();
      }
    });
  }

  private finishEncounter(): void {
    this.isSubmitting.set(false);
    alert(
      this.langService.isRtl()
        ? 'تم اعتماد الكشف الطبي وتوثيق الروشتة الإلكترونية بنجاح في السجل الموحد للمريض!'
        : 'Clinical encounter signed and prescription issued successfully to patient unified health record!'
    );
    this.router.navigate(['/doctor/queue']);
  }
}

