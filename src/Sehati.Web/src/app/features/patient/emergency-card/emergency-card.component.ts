import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from '../../../core/services/patient.service';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { EmergencyProfileDto } from '../../../core/models/patient.models';

@Component({
  selector: 'app-emergency-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="emergency-page" [class.rtl]="langService.isRtl()">
      <!-- Page Header -->
      <header class="page-header" *ngIf="authService.isAuthenticated()">
        <div class="header-titles">
          <h1 class="page-title">{{ langService.isRtl() ? 'بطاقة الطوارئ الرقمية (QR)' : 'Emergency Medical QR Profile' }}</h1>
          <p class="page-subtitle">
            {{ langService.isRtl() 
                ? 'ملف الطوارئ الحيوي المتاح للإسعاف والمستشفيات عبر مسح رمز الاستجابة السريعة (QR) في الحالات الحرجة.' 
                : 'Life-saving profile instantly accessible by first responders via QR scan without login credentials.' }}
          </p>
        </div>
        <button class="medic-btn btn-secondary" (click)="printCard()">
          <span class="material-symbols-outlined">print</span>
          <span>{{ langService.isRtl() ? 'طباعة البطاقة' : 'Print Wallet Card' }}</span>
        </button>
      </header>

      <!-- Emergency Banner -->
      <div class="medic-alert alert-error emergency-alert">
        <span class="material-symbols-outlined">emergency</span>
        <div>
          <strong>{{ langService.isRtl() ? 'ملف طوارئ طبي مصرح به' : 'Official Emergency Medical Alert' }}</strong>
          <p>{{ langService.isRtl() ? 'هذه البيانات مخصصة لأطقم الإسعاف والطوارئ الطبية لتفادي التفاعلات الدوائية الخطرة.' : 'This critical profile prevents adverse drug interactions and facilitates immediate ER triage.' }}</p>
        </div>
      </div>

      <!-- Main Emergency Card -->
      <div class="medic-card emergency-card">
        <div class="card-top">
          <div class="brand-zone">
            <img src="/sehati_logo.png" alt="Sehati Logo" class="emergency-logo" />
            <div>
              <span class="em-title">{{ langService.isRtl() ? 'صِحّتي - بطاقة الطوارئ' : 'SEHATI EMERGENCY CARD' }}</span>
              <span class="em-id">{{ profile()?.unifiedPatientId || 'SH-2026-004812' }}</span>
            </div>
          </div>

          <div class="blood-group-badge">
            <span class="bg-label">{{ langService.isRtl() ? 'فصيلة الدم' : 'BLOOD' }}</span>
            <span class="bg-value">{{ profile()?.bloodType || 'O+' }}</span>
          </div>
        </div>

        <div class="card-body-grid">
          <!-- Critical Allergies -->
          <div class="em-section">
            <h4 class="section-title danger-text">
              <span class="material-symbols-outlined">warning</span>
              <span>{{ langService.isRtl() ? 'حساسية دوائية وغذائية حرجة' : 'Critical Allergies' }}</span>
            </h4>
            <div class="tags-container">
              <span class="danger-pill" *ngFor="let a of profile()?.allergies">
                <span class="material-symbols-outlined">coronavirus</span>
                <span>{{ a }}</span>
              </span>
            </div>
          </div>

          <!-- Chronic Conditions -->
          <div class="em-section">
            <h4 class="section-title">
              <span class="material-symbols-outlined">medical_information</span>
              <span>{{ langService.isRtl() ? 'الأمراض المزمنة' : 'Chronic Conditions' }}</span>
            </h4>
            <div class="tags-container">
              <span class="info-pill" *ngFor="let c of profile()?.chronicConditions">
                <span class="material-symbols-outlined">vital_signs</span>
                <span>{{ c }}</span>
              </span>
            </div>
          </div>

          <!-- Active Medications -->
          <div class="em-section">
            <h4 class="section-title">
              <span class="material-symbols-outlined">medication</span>
              <span>{{ langService.isRtl() ? 'الأدوية الحالية المستمرة' : 'Ongoing Medications' }}</span>
            </h4>
            <div class="tags-container">
              <span class="teal-pill" *ngFor="let m of profile()?.activeMedications">
                <span class="material-symbols-outlined">pill</span>
                <span>{{ m }}</span>
              </span>
            </div>
          </div>

          <!-- Emergency Contact Person -->
          <div class="em-section emergency-contact-box">
            <h4 class="section-title">
              <span class="material-symbols-outlined">contact_phone</span>
              <span>{{ langService.isRtl() ? 'جهة الاتصال في الطوارئ' : 'Emergency Contact' }}</span>
            </h4>
            <div class="contact-details">
              <span class="contact-name">{{ profile()?.emergencyContactName || 'Dr. Ahmed Mostafa (Brother)' }}</span>
              <a [href]="'tel:' + (profile()?.emergencyContactPhone || '01012345678')" class="contact-phone-btn">
                <span class="material-symbols-outlined">call</span>
                <span>{{ profile()?.emergencyContactPhone || '01012345678' }}</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Scannable QR Code Visualization -->
        <div class="qr-code-footer">
          <div class="qr-box">
            <svg viewBox="0 0 100 100" class="qr-svg">
              <!-- Geometric QR simulation pattern -->
              <rect width="100" height="100" fill="#FFFFFF"/>
              <!-- Finder top left -->
              <rect x="5" y="5" width="28" height="28" fill="#0A4D68"/>
              <rect x="9" y="9" width="20" height="20" fill="#FFFFFF"/>
              <rect x="13" y="13" width="12" height="12" fill="#0A4D68"/>
              <!-- Finder top right -->
              <rect x="67" y="5" width="28" height="28" fill="#0A4D68"/>
              <rect x="71" y="9" width="20" height="20" fill="#FFFFFF"/>
              <rect x="75" y="13" width="12" height="12" fill="#0A4D68"/>
              <!-- Finder bottom left -->
              <rect x="5" y="67" width="28" height="28" fill="#0A4D68"/>
              <rect x="9" y="71" width="20" height="20" fill="#FFFFFF"/>
              <rect x="13" y="75" width="12" height="12" fill="#0A4D68"/>
              <!-- Internal data dots -->
              <rect x="38" y="10" width="8" height="8" fill="#088395"/>
              <rect x="50" y="18" width="8" height="8" fill="#088395"/>
              <rect x="38" y="38" width="24" height="24" fill="#0A4D68"/>
              <rect x="42" y="42" width="16" height="16" fill="#05BFDB"/>
              <rect x="70" y="45" width="12" height="12" fill="#088395"/>
              <rect x="45" y="70" width="10" height="10" fill="#0A4D68"/>
              <rect x="65" y="75" width="16" height="10" fill="#088395"/>
            </svg>
          </div>
          <div class="qr-text">
            <span class="qr-headline">{{ langService.isRtl() ? 'رمز الطوارئ السريع' : 'Instant Paramedic Scan' }}</span>
            <span class="qr-sub">https://sehati.health/emergency/{{ profile()?.unifiedPatientId || 'SH-2026-004812' }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .emergency-page {
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

    .emergency-alert {
      border-left: 5px solid #DC2626;

      &.rtl {
        border-left: none;
        border-right: 5px solid #DC2626;
      }
    }

    .emergency-card {
      max-width: 800px;
      margin: 0 auto;
      width: 100%;
      border: 2px solid rgba(220, 38, 38, 0.3);
      box-shadow: var(--shadow-card);
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid var(--color-border-subtle);
      padding-bottom: 1.25rem;
    }

    .brand-zone {
      display: flex;
      align-items: center;
      gap: 0.85rem;

      .emergency-logo {
        width: 48px;
        height: 48px;
        border-radius: 10px;
        background: #FFFFFF;
        padding: 2px;
      }

      .em-title {
        display: block;
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--color-primary-dark);
        letter-spacing: 0.05em;
      }

      .em-id {
        display: block;
        font-family: monospace;
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--color-primary-base);
      }
    }

    .blood-group-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #DC2626;
      color: #FFFFFF;
      padding: 0.4rem 1.25rem;
      border-radius: var(--radius-md);
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.35);

      .bg-label {
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.1em;
      }

      .bg-value {
        font-size: 1.6rem;
        font-weight: 900;
        line-height: 1.1;
      }
    }

    .card-body-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .em-section {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;

      .section-title {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--color-text-main);

        &.danger-text {
          color: #DC2626;
        }

        .material-symbols-outlined {
          font-size: 1.2rem;
        }
      }
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .danger-pill,
    .info-pill,
    .teal-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-pill);
      font-size: 0.825rem;
      font-weight: 700;

      .material-symbols-outlined {
        font-size: 1rem;
      }
    }

    .danger-pill {
      background: #FEE2E2;
      color: #B91C1C;
      border: 1px solid rgba(220, 38, 38, 0.3);
    }

    .info-pill {
      background: #EFF6FF;
      color: #1D4ED8;
      border: 1px solid rgba(29, 78, 216, 0.3);
    }

    .teal-pill {
      background: var(--color-primary-surface);
      color: var(--color-primary-dark);
      border: 1px solid rgba(8, 131, 149, 0.3);
    }

    .dark-theme {
      .danger-pill {
        background: rgba(220, 38, 38, 0.2);
        color: #F87171;
      }

      .info-pill {
        background: rgba(29, 78, 216, 0.2);
        color: #60A5FA;
      }

      .teal-pill {
        background: var(--color-surface-tint);
        color: var(--color-primary-accent);
      }
    }

    .emergency-contact-box {
      grid-column: span 2;
      background: var(--color-surface-tint);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-md);
      padding: 1rem 1.25rem;

      .contact-details {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-top: 0.35rem;

        .contact-name {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-text-main);
        }

        .contact-phone-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          background: #059669;
          color: #FFFFFF;
          border-radius: var(--radius-pill);
          text-decoration: none;
          font-weight: 700;
          font-size: 0.9rem;
          box-shadow: 0 4px 10px rgba(5, 150, 105, 0.3);
        }
      }
    }

    .qr-code-footer {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      border-top: 1.5px solid var(--color-border-subtle);
      padding-top: 1.25rem;

      .qr-box {
        width: 80px;
        height: 80px;
        background: #FFFFFF;
        padding: 4px;
        border-radius: 8px;
        box-shadow: var(--shadow-sm);
        border: 1px solid var(--color-border-subtle);

        .qr-svg {
          width: 100%;
          height: 100%;
        }
      }

      .qr-text {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .qr-headline {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--color-text-brand);
        }

        .qr-sub {
          font-family: monospace;
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }
      }
    }

    @media (max-width: 640px) {
      .card-body-grid {
        grid-template-columns: 1fr;
      }

      .emergency-contact-box {
        grid-column: span 1;

        .contact-details {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    }
  `]
})
export class EmergencyCardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private patientService = inject(PatientService);
  public authService = inject(AuthService);
  public langService = inject(LanguageService);

  public profile = signal<EmergencyProfileDto | null>(null);

  ngOnInit(): void {
    const routeId = this.route.snapshot.paramMap.get('unifiedId');
    const unifiedId = routeId || this.authService.currentUser()?.unifiedPatientId || 'SH-2026-004812';

    this.patientService.getEmergencyProfile(unifiedId).subscribe({
      next: (data) => this.profile.set(data),
      error: () => {
        // Fallback emergency profile simulation
        this.profile.set({
          id: 'em-1',
          patientId: 'p-1',
          unifiedPatientId: unifiedId,
          fullName: this.authService.currentUser()?.fullName || 'Mohamed Ahmed Ali',
          bloodType: 'O+',
          emergencyContactName: 'Ahmed Ali (Father)',
          emergencyContactPhone: '01098765432',
          allergies: ['Penicillin (Anaphylaxis)', 'Aspirin (Severe Rash)'],
          chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
          activeMedications: ['Metformin 500mg', 'Amlodipine 5mg']
        });
      }
    });
  }

  printCard(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}

