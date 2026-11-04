import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicService } from '../../../core/services/clinic.service';
import { LanguageService } from '../../../core/services/language.service';
import { ClinicDto, DoctorDto, ReceptionistDto } from '../../../core/models/clinic.models';

@Component({
  selector: 'app-clinic-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="clinic-admin-page" [class.rtl]="langService.isRtl()">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-titles">
          <div class="title-with-badge">
            <span class="material-symbols-outlined header-icon">domain</span>
            <h1 class="page-title">
              {{ langService.isRtl() ? 'إدارة المنشأة الطبية والعيادات' : 'Clinic & Facility Administration' }}
            </h1>
          </div>
          <p class="page-subtitle">
            {{ langService.isRtl()
              ? 'إدارة الكادر الطبي، توزيع نوبات الاستقبال، وضبط ساعات العمل ومواعيد الكشف'
              : 'Manage medical staff roster, receptionist shifts, operating hours, and facility profiles' }}
          </p>
        </div>

        <div class="header-actions">
          <button class="btn btn-primary" (click)="openAffiliateModal()">
            <span class="material-symbols-outlined">person_add</span>
            <span>{{ langService.isRtl() ? 'ربط طبيب معالج بالعيادة' : 'Affiliate Doctor' }}</span>
          </button>
        </div>
      </div>

      <!-- Facility Overview Card -->
      <div class="facility-card">
        <div class="facility-icon">
          <span class="material-symbols-outlined">local_hospital</span>
        </div>
        <div class="facility-info">
          <div class="facility-name-row">
            <h2>{{ clinic().name }}</h2>
            <span class="license-tag">Lic: {{ clinic().licenseNumber }}</span>
            <span class="active-badge">{{ clinic().isActive ? (langService.isRtl() ? 'نشط' : 'Active') : 'Inactive' }}</span>
          </div>
          <div class="facility-meta">
            <span><span class="material-symbols-outlined">location_on</span> {{ clinic().address }}, {{ clinic().city }}</span>
            <span>•</span>
            <span><span class="material-symbols-outlined">phone</span> {{ clinic().phoneNumber }}</span>
            <span>•</span>
            <span><span class="material-symbols-outlined">schedule</span> {{ clinic().openingTime }} - {{ clinic().closingTime }}</span>
          </div>
        </div>
      </div>

      <!-- Metric Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="material-symbols-outlined icon docs">medical_services</span>
          <div class="kpi-data">
            <span class="kpi-value">{{ doctorsList().length }}</span>
            <span class="kpi-label">{{ langService.isRtl() ? 'الأطباء المعتمدون' : 'Active Physicians' }}</span>
          </div>
        </div>

        <div class="kpi-card">
          <span class="material-symbols-outlined icon staff">support_agent</span>
          <div class="kpi-data">
            <span class="kpi-value">{{ receptionistsList().length }}</span>
            <span class="kpi-label">{{ langService.isRtl() ? 'طاقم الاستقبال' : 'Reception Staff' }}</span>
          </div>
        </div>

        <div class="kpi-card">
          <span class="material-symbols-outlined icon capacity">event_available</span>
          <div class="kpi-data">
            <span class="kpi-value">60</span>
            <span class="kpi-label">{{ langService.isRtl() ? 'الطاقة الاستيعابية اليومية' : 'Daily Patient Capacity' }}</span>
          </div>
        </div>

        <div class="kpi-card">
          <span class="material-symbols-outlined icon duration">avg_time</span>
          <div class="kpi-data">
            <span class="kpi-value">15 min</span>
            <span class="kpi-label">{{ langService.isRtl() ? 'متوسط وقت الكشف' : 'Avg. Slot Duration' }}</span>
          </div>
        </div>
      </div>

      <!-- Content Tabs -->
      <div class="portal-card">
        <div class="tabs-header">
          <button
            class="tab-item"
            [class.active]="activeTab === 'doctors'"
            (click)="activeTab = 'doctors'"
          >
            <span class="material-symbols-outlined">stethoscope</span>
            <span>{{ langService.isRtl() ? 'الأطباء المعالجون' : 'Doctors Roster' }} ({{ doctorsList().length }})</span>
          </button>

          <button
            class="tab-item"
            [class.active]="activeTab === 'receptionists'"
            (click)="activeTab = 'receptionists'"
          >
            <span class="material-symbols-outlined">badge</span>
            <span>{{ langService.isRtl() ? 'موظفو الاستقبال' : 'Reception Staff' }} ({{ receptionistsList().length }})</span>
          </button>

          <button
            class="tab-item"
            [class.active]="activeTab === 'shifts'"
            (click)="activeTab = 'shifts'"
          >
            <span class="material-symbols-outlined">calendar_clock</span>
            <span>{{ langService.isRtl() ? 'ساعات العمل والفترات' : 'Operating Shifts' }}</span>
          </button>
        </div>

        <!-- Doctors Tab -->
        <div class="tab-body" *ngIf="activeTab === 'doctors'">
          <div class="table-container">
            <table class="styled-table">
              <thead>
                <tr>
                  <th>{{ langService.isRtl() ? 'اسم الطبيب' : 'Doctor Name' }}</th>
                  <th>{{ langService.isRtl() ? 'التخصص الطبي' : 'Specialty' }}</th>
                  <th>{{ langService.isRtl() ? 'رقم الترخيص' : 'License #' }}</th>
                  <th>{{ langService.isRtl() ? 'الهاتف' : 'Phone' }}</th>
                  <th>{{ langService.isRtl() ? 'سعر الكشف' : 'Consult Fee' }}</th>
                  <th>{{ langService.isRtl() ? 'الحالة' : 'Status' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let doc of doctorsList()">
                  <td>
                    <div class="doc-cell">
                      <div class="avatar-circle">
                        <span class="material-symbols-outlined">person</span>
                      </div>
                      <span class="font-bold">{{ doc.fullName }}</span>
                    </div>
                  </td>
                  <td>{{ doc.specialty }}</td>
                  <td><span class="mono-badge">{{ doc.licenseNumber }}</span></td>
                  <td>{{ doc.phoneNumber }}</td>
                  <td class="fee-col">{{ doc.consultationFee || 250 }} EGP</td>
                  <td>
                    <span class="status-pill active">
                      {{ langService.isRtl() ? 'نشط بالعيادة' : 'Active' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Receptionists Tab -->
        <div class="tab-body" *ngIf="activeTab === 'receptionists'">
          <div class="table-container">
            <table class="styled-table">
              <thead>
                <tr>
                  <th>{{ langService.isRtl() ? 'اسم الموظف' : 'Staff Member' }}</th>
                  <th>{{ langService.isRtl() ? 'البريد الإلكتروني' : 'Email' }}</th>
                  <th>{{ langService.isRtl() ? 'رقم الهاتف' : 'Phone' }}</th>
                  <th>{{ langService.isRtl() ? 'فترة النوبات' : 'Shift Hours' }}</th>
                  <th>{{ langService.isRtl() ? 'الحالة' : 'Status' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let rec of receptionistsList()">
                  <td class="font-bold">{{ rec.fullName }}</td>
                  <td>{{ rec.email || 'reception@sehati.gov.eg' }}</td>
                  <td>{{ rec.phoneNumber }}</td>
                  <td><span class="shift-badge">{{ rec.shiftHours || 'Morning (08:00 - 16:00)' }}</span></td>
                  <td>
                    <span class="status-pill active">
                      {{ langService.isRtl() ? 'على رأس العمل' : 'On Duty' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Shifts Tab -->
        <div class="tab-body" *ngIf="activeTab === 'shifts'">
          <div class="schedule-grid">
            <div class="day-slot" *ngFor="let day of clinicSchedule">
              <div class="day-title">{{ day.day }}</div>
              <div class="day-status" [class.open]="day.isOpen">
                {{ day.isOpen ? (langService.isRtl() ? 'مفتوح للكشف' : 'Open for Consultations') : (langService.isRtl() ? 'عطلة أسبوعية' : 'Closed') }}
              </div>
              <div class="day-hours" *ngIf="day.isOpen">
                <span class="material-symbols-outlined">schedule</span>
                {{ day.hours }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Affiliate Doctor Modal -->
      <div class="modal-backdrop" *ngIf="showAffiliateModal" (click)="showAffiliateModal = false">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ langService.isRtl() ? 'ربط طبيب معالج جديد بالعيادة' : 'Affiliate Doctor with Clinic' }}</h3>
            <button class="close-btn" (click)="showAffiliateModal = false">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label class="required">{{ langService.isRtl() ? 'اسم الطبيب' : 'Doctor Full Name' }}</label>
              <input type="text" class="form-control" [(ngModel)]="newDoc.fullName" placeholder="Dr. Tarek Omar" />
            </div>

            <div class="form-group">
              <label class="required">{{ langService.isRtl() ? 'التخصص الطبي' : 'Specialty' }}</label>
              <input type="text" class="form-control" [(ngModel)]="newDoc.specialty" placeholder="Orthopedic Surgery" />
            </div>

            <div class="form-group">
              <label class="required">{{ langService.isRtl() ? 'رقم ترخيص مزاولة المهنة' : 'Medical License Number' }}</label>
              <input type="text" class="form-control" [(ngModel)]="newDoc.licenseNumber" placeholder="MD-77889-EG" />
            </div>

            <div class="form-group">
              <label class="required">{{ langService.isRtl() ? 'سعر الكشف (بالجنيه)' : 'Consultation Fee (EGP)' }}</label>
              <input type="number" class="form-control" [(ngModel)]="newDoc.consultationFee" placeholder="300" />
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showAffiliateModal = false">
              <span>{{ langService.isRtl() ? 'إلغاء' : 'Cancel' }}</span>
            </button>
            <button class="btn btn-primary" (click)="submitAffiliation()">
              <span class="material-symbols-outlined">check</span>
              <span>{{ langService.isRtl() ? 'اعتماد الربط' : 'Affiliate Doctor' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .clinic-admin-page {
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

    .title-with-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .header-icon {
        font-size: 2rem;
        color: var(--color-primary-deep);
      }

      .page-title {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--color-text-main);
        margin: 0;
      }
    }

    .page-subtitle {
      color: var(--color-text-muted);
      margin-top: 0.35rem;
      font-size: 0.95rem;
    }

    /* Facility Card */
    .facility-card {
      background: var(--color-surface-card);
      border-radius: var(--radius-card);
      padding: 1.5rem;
      border: 1px solid var(--color-border-subtle);
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: center;
      gap: 1.5rem;

      .facility-icon {
        width: 64px;
        height: 64px;
        border-radius: var(--radius-md);
        background: rgba(10, 77, 104, 0.1);
        color: var(--color-primary-deep);
        display: flex;
        align-items: center;
        justify-content: center;
        span { font-size: 2.2rem; }
      }

      .facility-info {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        .facility-name-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;

          h2 { margin: 0; font-size: 1.35rem; font-weight: 800; }

          .license-tag {
            font-family: monospace;
            font-size: 0.8rem;
            background: var(--color-bg-app);
            padding: 0.2rem 0.5rem;
            border-radius: var(--radius-sm);
            color: var(--color-text-muted);
          }

          .active-badge {
            background: rgba(16, 185, 129, 0.15);
            color: #059669;
            font-weight: 800;
            padding: 0.2rem 0.6rem;
            border-radius: var(--radius-full);
            font-size: 0.75rem;
          }
        }

        .facility-meta {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          color: var(--color-text-muted);
          font-size: 0.85rem;
          flex-wrap: wrap;

          span {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            .material-symbols-outlined { font-size: 1rem; }
          }
        }
      }
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 1rem;
    }

    .kpi-card {
      background: var(--color-surface-card);
      border-radius: var(--radius-card);
      padding: 1.25rem;
      border: 1px solid var(--color-border-subtle);
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: center;
      gap: 1rem;

      .icon {
        font-size: 2rem;
        padding: 0.65rem;
        border-radius: var(--radius-md);

        &.docs { background: rgba(8, 131, 149, 0.12); color: var(--color-primary-ocean); }
        &.staff { background: rgba(5, 191, 219, 0.12); color: var(--color-primary-deep); }
        &.capacity { background: rgba(16, 185, 129, 0.12); color: #059669; }
        &.duration { background: rgba(245, 158, 11, 0.12); color: #d97706; }
      }

      .kpi-data {
        display: flex;
        flex-direction: column;

        .kpi-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--color-text-main);
          line-height: 1.2;
        }

        .kpi-label {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          font-weight: 600;
        }
      }
    }

    /* Portal Card */
    .portal-card {
      background: var(--color-surface-card);
      border-radius: var(--radius-card);
      border: 1px solid var(--color-border-subtle);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .tabs-header {
      display: flex;
      background: var(--color-bg-app);
      border-bottom: 1px solid var(--color-border-subtle);

      .tab-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem 1.5rem;
        border: none;
        background: none;
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--color-text-muted);
        cursor: pointer;
        border-bottom: 2px solid transparent;

        &.active {
          color: var(--color-primary-ocean);
          background: var(--color-surface-card);
          border-bottom-color: var(--color-primary-ocean);
        }
      }
    }

    .tab-body {
      padding: 1.5rem;
    }

    .table-container {
      overflow-x: auto;
    }

    .styled-table {
      width: 100%;
      border-collapse: collapse;

      th {
        padding: 0.75rem 1rem;
        text-align: left;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--color-text-muted);
        text-transform: uppercase;
        border-bottom: 1px solid var(--color-border-subtle);
      }

      td {
        padding: 0.85rem 1rem;
        border-bottom: 1px solid var(--color-border-subtle);
        font-size: 0.9rem;
        color: var(--color-text-main);
      }

      .doc-cell {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .avatar-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(8, 131, 149, 0.1);
          color: var(--color-primary-ocean);
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .mono-badge {
        font-family: monospace;
        background: var(--color-bg-app);
        padding: 0.2rem 0.5rem;
        border-radius: var(--radius-sm);
        font-weight: 700;
      }

      .fee-col {
        font-weight: 800;
        color: var(--color-primary-deep);
      }

      .status-pill {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.2rem 0.6rem;
        border-radius: var(--radius-full);

        &.active {
          background: rgba(16, 185, 129, 0.15);
          color: #059669;
        }
      }

      .shift-badge {
        background: rgba(10, 77, 104, 0.08);
        color: var(--color-primary-deep);
        padding: 0.2rem 0.5rem;
        border-radius: var(--radius-sm);
        font-size: 0.8rem;
      }
    }

    /* Schedule Grid */
    .schedule-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;

      .day-slot {
        background: var(--color-bg-app);
        border: 1px solid var(--color-border-subtle);
        border-radius: var(--radius-md);
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        .day-title {
          font-weight: 800;
          font-size: 1rem;
          color: var(--color-text-main);
        }

        .day-status {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-text-muted);

          &.open {
            color: #059669;
          }
        }

        .day-hours {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          color: var(--color-text-muted);
          span { font-size: 0.95rem; }
        }
      }
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(10, 77, 104, 0.5);
      backdrop-filter: blur(4px);
      z-index: 1050;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-dialog {
      background: var(--color-surface-card);
      border-radius: var(--radius-card);
      width: 100%;
      max-width: 500px;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--color-border-subtle);
      overflow: hidden;

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid var(--color-border-subtle);

        h3 { margin: 0; font-size: 1.15rem; font-weight: 800; }
        .close-btn { background: none; border: none; color: var(--color-text-muted); cursor: pointer; }
      }

      .modal-body {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--color-border-subtle);
        background: var(--color-bg-app);
      }
    }

    /* RTL */
    .clinic-admin-page.rtl {
      direction: rtl;
      .styled-table th { text-align: right; }
    }
  `]
})
export class ClinicAdminComponent implements OnInit {
  private clinicService = inject(ClinicService);
  public langService = inject(LanguageService);

  public activeTab: 'doctors' | 'receptionists' | 'shifts' = 'doctors';
  public showAffiliateModal = false;

  public clinic = signal<ClinicDto>({
    id: '1',
    name: 'Sehati Specialized Central Polyclinic',
    address: '15 Tahrir Square, Downtown',
    city: 'Cairo',
    phoneNumber: '+20 2 2795 4321',
    email: 'contact@sehati.clinic.eg',
    licenseNumber: 'CL-88910-EG',
    openingTime: '08:00 AM',
    closingTime: '10:00 PM',
    isActive: true,
    doctorsCount: 4,
    receptionistsCount: 2
  });

  public doctorsList = signal<DoctorDto[]>([
    {
      id: '1',
      userId: '2',
      fullName: 'Dr. Sarah Smith',
      phoneNumber: '01011112222',
      specialty: 'Internal Medicine & Cardiology',
      licenseNumber: 'MD-89102-EG',
      consultationFee: 300,
      affiliatedClinicsCount: 1
    },
    {
      id: '2',
      userId: '3',
      fullName: 'Dr. Hesham Talaat',
      phoneNumber: '01033334444',
      specialty: 'Pediatrics',
      licenseNumber: 'MD-67210-EG',
      consultationFee: 250,
      affiliatedClinicsCount: 1
    },
    {
      id: '3',
      userId: '4',
      fullName: 'Dr. Mona El-Khouly',
      phoneNumber: '01055556666',
      specialty: 'Obstetrics & Gynecology',
      licenseNumber: 'MD-55412-EG',
      consultationFee: 350,
      affiliatedClinicsCount: 1
    }
  ]);

  public receptionistsList = signal<ReceptionistDto[]>([
    {
      id: '1',
      userId: '10',
      fullName: 'Fatma Khaled',
      phoneNumber: '01099887766',
      email: 'fatma.reception@sehati.gov.eg',
      clinicId: '1',
      clinicName: 'Sehati Specialized Central Polyclinic',
      shiftHours: 'Morning (08:00 AM - 04:00 PM)'
    },
    {
      id: '2',
      userId: '11',
      fullName: 'Karim Mostafa',
      phoneNumber: '01088776655',
      email: 'karim.reception@sehati.gov.eg',
      clinicId: '1',
      clinicName: 'Sehati Specialized Central Polyclinic',
      shiftHours: 'Evening (04:00 PM - 10:00 PM)'
    }
  ]);

  public clinicSchedule = [
    { day: 'Saturday', isOpen: true, hours: '08:00 AM - 10:00 PM' },
    { day: 'Sunday', isOpen: true, hours: '08:00 AM - 10:00 PM' },
    { day: 'Monday', isOpen: true, hours: '08:00 AM - 10:00 PM' },
    { day: 'Tuesday', isOpen: true, hours: '08:00 AM - 10:00 PM' },
    { day: 'Wednesday', isOpen: true, hours: '08:00 AM - 10:00 PM' },
    { day: 'Thursday', isOpen: true, hours: '08:00 AM - 10:00 PM' },
    { day: 'Friday', isOpen: false, hours: 'Closed' }
  ];

  public newDoc = {
    fullName: '',
    specialty: '',
    licenseNumber: '',
    consultationFee: 250
  };

  ngOnInit(): void {
    this.loadClinicData();
  }

  loadClinicData(): void {
    this.clinicService.getClinicById('1').subscribe({
      next: data => {
        if (data) this.clinic.set(data);
      }
    });

    this.clinicService.getDoctors().subscribe({
      next: docs => {
        if (docs && docs.length > 0) {
          this.doctorsList.set(docs);
        }
      }
    });
  }

  openAffiliateModal(): void {
    this.newDoc = {
      fullName: '',
      specialty: '',
      licenseNumber: '',
      consultationFee: 250
    };
    this.showAffiliateModal = true;
  }

  submitAffiliation(): void {
    if (!this.newDoc.fullName || !this.newDoc.licenseNumber) {
      alert(this.langService.isRtl() ? 'يرجى إدخال اسم الطبيب ورقم الترخيص' : 'Please fill in doctor name and license number.');
      return;
    }

    const created: DoctorDto = {
      id: (this.doctorsList().length + 1).toString(),
      userId: (this.doctorsList().length + 10).toString(),
      fullName: this.newDoc.fullName,
      specialty: this.newDoc.specialty || 'General Practitioner',
      licenseNumber: this.newDoc.licenseNumber,
      phoneNumber: '01000000000',
      consultationFee: this.newDoc.consultationFee,
      affiliatedClinicsCount: 1
    };

    this.doctorsList.update(list => [...list, created]);
    this.showAffiliateModal = false;

    alert(
      this.langService.isRtl()
        ? `تم اعتماد وربط الطبيب ${created.fullName} بنجاح بالعيادة!`
        : `Dr. ${created.fullName} successfully affiliated with clinic!`
    );
  }
}

