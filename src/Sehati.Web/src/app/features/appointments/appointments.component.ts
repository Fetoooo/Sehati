import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppointmentService } from '../../core/services/appointment.service';
import { ClinicService } from '../../core/services/clinic.service';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { AppointmentDto, AppointmentStatus } from '../../core/models/appointment.models';
import { DoctorDto } from '../../core/models/clinic.models';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="appointments-page" [class.rtl]="langService.isRtl()">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-titles">
          <h1 class="page-title">{{ langService.isRtl() ? 'المواعيد والحجوزات' : 'Appointments & Consultations' }}</h1>
          <p class="page-subtitle">
            {{ langService.isRtl() 
                ? 'جدولة المواعيد مع الأطباء الاستشاريين ومتابعة دورك اللحظي في طابور العيادة.' 
                : 'Book consultations with specialist doctors and track your real-time clinic queue status.' }}
          </p>
        </div>
        <button class="medic-btn btn-primary" (click)="openBookModal()">
          <span class="material-symbols-outlined">add_circle</span>
          <span>{{ langService.isRtl() ? 'حجز موعد كشف جديد' : 'Book New Appointment' }}</span>
        </button>
      </header>

      <!-- Status Filter Tabs -->
      <div class="filter-tabs">
        <button
          class="filter-btn"
          [class.active]="filterStatus() === 'All'"
          (click)="filterStatus.set('All')"
        >
          {{ langService.isRtl() ? 'الكل' : 'All' }} ({{ appointments().length }})
        </button>
        <button
          class="filter-btn"
          [class.active]="filterStatus() === 'Confirmed'"
          (click)="filterStatus.set('Confirmed')"
        >
          {{ langService.isRtl() ? 'المؤكدة' : 'Confirmed' }}
        </button>
        <button
          class="filter-btn"
          [class.active]="filterStatus() === 'Pending'"
          (click)="filterStatus.set('Pending')"
        >
          {{ langService.isRtl() ? 'قيد التأكيد' : 'Pending' }}
        </button>
        <button
          class="filter-btn"
          [class.active]="filterStatus() === 'Completed'"
          (click)="filterStatus.set('Completed')"
        >
          {{ langService.isRtl() ? 'المكتملة' : 'Completed' }}
        </button>
      </div>

      <!-- Appointments List Grid -->
      <div class="appointments-grid">
        <div class="medic-card appointment-card" *ngFor="let apt of filteredAppointments()">
          <div class="card-head">
            <div class="doctor-meta">
              <span class="material-symbols-outlined doc-icon">stethoscope</span>
              <div>
                <h3 class="doc-name">{{ apt.doctorName }}</h3>
                <span class="doc-spec">{{ apt.specialty || (langService.isRtl() ? 'استشاري متخصص' : 'Specialist') }}</span>
              </div>
            </div>

            <span class="medic-badge" [ngClass]="getStatusBadgeClass(apt.status)">
              {{ apt.status }}
            </span>
          </div>

          <div class="card-body">
            <div class="clinic-location">
              <span class="material-symbols-outlined">domain</span>
              <span>{{ apt.clinicName }}</span>
            </div>

            <div class="date-time-box">
              <div class="dt-item">
                <span class="material-symbols-outlined">calendar_today</span>
                <span>{{ apt.appointmentDateTime | date:'fullDate' }}</span>
              </div>
              <div class="dt-item">
                <span class="material-symbols-outlined">schedule</span>
                <span>{{ apt.appointmentDateTime | date:'shortTime' }}</span>
              </div>
            </div>

            <!-- Queue Number Pill -->
            <div class="queue-number-box" *ngIf="apt.queueNumber">
              <span class="q-label">{{ langService.isRtl() ? 'رقم الدور بالطابور:' : 'Queue Number:' }}</span>
              <span class="q-num">#{{ apt.queueNumber }}</span>
            </div>
          </div>

          <div class="card-footer" *ngIf="apt.status === 'Confirmed' || apt.status === 'Pending'">
            <button class="medic-btn btn-outline btn-sm" (click)="cancelAppointment(apt.id)">
              <span class="material-symbols-outlined">cancel</span>
              <span>{{ langService.isRtl() ? 'إلغاء الموعد' : 'Cancel' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredAppointments().length === 0">
        <span class="material-symbols-outlined empty-icon">calendar_month</span>
        <p>{{ langService.isRtl() ? 'لا توجد مواعيد في هذا التصنيف.' : 'No appointments found in this view.' }}</p>
      </div>

      <!-- Book Appointment Modal -->
      <div class="modal-backdrop" *ngIf="showBookModal">
        <div class="medic-card modal-dialog">
          <div class="modal-header">
            <h3>{{ langService.isRtl() ? 'حجز موعد كشف طبي جديد' : 'Book Specialist Consultation' }}</h3>
            <button class="close-btn" (click)="closeBookModal()">&times;</button>
          </div>

          <form [formGroup]="bookForm" (ngSubmit)="onBookSubmit()">
            <div class="medic-form-group">
              <label class="medic-label">{{ langService.isRtl() ? 'اختر الطبيب المعالج' : 'Select Doctor' }} <span class="req">*</span></label>
              <select class="medic-select" formControlName="doctorId">
                <option value="doc-1">Dr. Sarah Ahmed (Cardiology)</option>
                <option value="doc-2">Dr. Mohamed Khaled (Pediatrics)</option>
                <option value="doc-3">Dr. Tarek Mostafa (Internal Medicine)</option>
              </select>
            </div>

            <div class="medic-form-group">
              <label class="medic-label">{{ langService.isRtl() ? 'العيادة / المركز الطبي' : 'Clinic' }} <span class="req">*</span></label>
              <select class="medic-select" formControlName="clinicId">
                <option value="1">Sehati Specialized Clinic - Nasr City</option>
                <option value="2">Nile Medical Center - Maadi</option>
              </select>
            </div>

            <div class="medic-form-group">
              <label class="medic-label">{{ langService.isRtl() ? 'تاريخ ووقت الموعد' : 'Appointment Date & Time' }} <span class="req">*</span></label>
              <input type="datetime-local" class="medic-input" formControlName="appointmentDateTime" />
            </div>

            <div class="medic-form-group">
              <label class="medic-label">{{ langService.isRtl() ? 'نوع الكشف' : 'Consultation Type' }}</label>
              <select class="medic-select" formControlName="type">
                <option value="FirstVisit">{{ langService.isRtl() ? 'كشف أول' : 'First Visit' }}</option>
                <option value="FollowUp">{{ langService.isRtl() ? 'استشارة ومتابعة' : 'Follow-up' }}</option>
                <option value="Urgent">{{ langService.isRtl() ? 'عاجل' : 'Urgent' }}</option>
              </select>
            </div>

            <div class="medic-form-group">
              <label class="medic-label">{{ langService.isRtl() ? 'ملاحظات / الشكوى المبدئية' : 'Chief Complaint / Notes' }}</label>
              <textarea class="medic-input" formControlName="notes" rows="2" placeholder="e.g. Routine checkup or chest discomfort"></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="medic-btn btn-outline" (click)="closeBookModal()">
                {{ langService.isRtl() ? 'إلغاء' : 'Cancel' }}
              </button>
              <button type="submit" class="medic-btn btn-primary" [disabled]="bookForm.invalid">
                {{ langService.isRtl() ? 'تأكيد الحجز' : 'Confirm Booking' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .appointments-page {
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

    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      border-bottom: 1px solid var(--color-border-subtle);
      padding-bottom: 0.75rem;
      overflow-x: auto;
    }

    .filter-btn {
      padding: 0.45rem 1rem;
      border-radius: var(--radius-pill);
      border: 1px solid transparent;
      background: transparent;
      color: var(--color-text-muted);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;

      &:hover {
        color: var(--color-primary-base);
      }

      &.active {
        background: var(--color-primary-surface);
        color: var(--color-primary-dark);
        border-color: rgba(8, 131, 149, 0.25);
      }
    }

    .dark-theme .filter-btn.active {
      background: var(--color-surface-tint);
      color: var(--color-primary-accent);
    }

    .appointments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .appointment-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1.25rem;
    }

    .card-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .doctor-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .doc-icon {
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

      .doc-name {
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--color-text-main);
      }

      .doc-spec {
        font-size: 0.8rem;
        color: var(--color-text-muted);
      }
    }

    .clinic-location {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.875rem;
      color: var(--color-text-main);
      font-weight: 600;
      margin-bottom: 0.75rem;

      .material-symbols-outlined {
        font-size: 1.15rem;
        color: var(--color-primary-base);
      }
    }

    .date-time-box {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 0.825rem;
      color: var(--color-text-muted);

      .dt-item {
        display: flex;
        align-items: center;
        gap: 0.4rem;

        .material-symbols-outlined {
          font-size: 1rem;
        }
      }
    }

    .queue-number-box {
      margin-top: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0.85rem;
      background: var(--color-surface-tint);
      border-radius: var(--radius-sm);
      border: 1px solid rgba(8, 131, 149, 0.2);

      .q-label {
        font-size: 0.8rem;
        color: var(--color-text-muted);
      }

      .q-num {
        font-size: 1.1rem;
        font-weight: 800;
        color: var(--color-primary-dark);
      }
    }

    .dark-theme .queue-number-box .q-num {
      color: var(--color-primary-accent);
    }

    .card-footer {
      display: flex;
      justify-content: flex-end;
      padding-top: 0.75rem;
      border-top: 1px solid var(--color-border-subtle);

      .btn-sm {
        padding: 0.4rem 0.85rem;
        font-size: 0.825rem;
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
        color: var(--color-primary-base);
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
      max-width: 520px;
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
export class AppointmentsComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  public langService = inject(LanguageService);
  private fb = inject(FormBuilder);

  public user = this.authService.currentUser;
  public appointments = signal<AppointmentDto[]>([]);
  public filterStatus = signal<string>('All');
  public showBookModal = false;

  public bookForm = this.fb.group({
    doctorId: ['doc-1', Validators.required],
    clinicId: ['1', Validators.required],
    appointmentDateTime: ['2026-11-10T11:00', Validators.required],
    type: ['FirstVisit'],
    notes: ['']
  });

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointmentService.getAppointments().subscribe({
      next: (res) => this.appointments.set(res),
      error: () => {
        // Fallback demo appointments
        this.appointments.set([
          {
            id: 'apt-1',
            patientId: 'p-1',
            patientName: this.user()?.fullName || 'Patient',
            unifiedPatientId: 'SH-2026-004812',
            doctorId: 'doc-1',
            doctorName: 'Dr. Sarah Ahmed',
            specialty: 'Cardiology Specialist',
            clinicId: '1',
            clinicName: 'Sehati Specialized Heart Center',
            appointmentDateTime: '2026-11-06T10:30:00Z',
            status: 'Confirmed',
            type: 'Consultation',
            queueNumber: 3,
            createdAt: '2026-11-02T08:00:00Z'
          },
          {
            id: 'apt-2',
            patientId: 'p-1',
            patientName: this.user()?.fullName || 'Patient',
            unifiedPatientId: 'SH-2026-004812',
            doctorId: 'doc-2',
            doctorName: 'Dr. Mohamed Khaled',
            specialty: 'Internal Medicine',
            clinicId: '2',
            clinicName: 'Nile PolyClinic Maadi',
            appointmentDateTime: '2026-11-12T17:00:00Z',
            status: 'Pending',
            type: 'Follow-up',
            queueNumber: 7,
            createdAt: '2026-11-03T11:15:00Z'
          }
        ]);
      }
    });
  }

  filteredAppointments(): AppointmentDto[] {
    const status = this.filterStatus();
    if (status === 'All') return this.appointments();
    return this.appointments().filter((a) => a.status === status);
  }

  getStatusBadgeClass(status: AppointmentStatus): string {
    switch (status) {
      case 'Confirmed': return 'badge-success';
      case 'Pending': return 'badge-warning';
      case 'Completed': return 'badge-info';
      case 'Cancelled':
      case 'NoShow': return 'badge-danger';
      default: return 'badge-teal';
    }
  }

  openBookModal(): void {
    this.showBookModal = true;
  }

  closeBookModal(): void {
    this.showBookModal = false;
  }

  onBookSubmit(): void {
    if (this.bookForm.invalid) return;

    const val = this.bookForm.value;
    const newApt: AppointmentDto = {
      id: 'apt-' + Date.now(),
      patientId: String(this.user()?.id || this.user()?.userId || 'demo-p1'),
      patientName: this.user()?.fullName || 'Patient',
      unifiedPatientId: this.user()?.unifiedPatientId || 'SH-2026-004812',
      doctorId: val.doctorId!,
      doctorName: val.doctorId === 'doc-1' ? 'Dr. Sarah Ahmed' : val.doctorId === 'doc-2' ? 'Dr. Mohamed Khaled' : 'Dr. Tarek Mostafa',
      specialty: 'Specialist Physician',
      clinicId: val.clinicId!,
      clinicName: val.clinicId === '1' ? 'Sehati Specialized Clinic - Nasr City' : 'Nile Medical Center - Maadi',
      appointmentDateTime: val.appointmentDateTime!,
      status: 'Confirmed',
      type: val.type || 'FirstVisit',
      queueNumber: Math.floor(Math.random() * 8) + 1,
      createdAt: new Date().toISOString()
    };

    this.appointments.update((list) => [newApt, ...list]);
    this.closeBookModal();
  }

  cancelAppointment(id: string): void {
    this.appointments.update((list) =>
      list.map((a) => (a.id === id ? { ...a, status: 'Cancelled' as AppointmentStatus } : a))
    );
  }
}

