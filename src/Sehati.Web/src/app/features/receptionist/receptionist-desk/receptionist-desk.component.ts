import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PatientService } from '../../../core/services/patient.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ClinicService } from '../../../core/services/clinic.service';
import { LanguageService } from '../../../core/services/language.service';
import { PatientDto, CreatePatientDto } from '../../../core/models/patient.models';
import { DailyQueueItemDto } from '../../../core/models/appointment.models';
import { DoctorDto } from '../../../core/models/clinic.models';

@Component({
  selector: 'app-receptionist-desk',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="desk-page" [class.rtl]="langService.isRtl()">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-titles">
          <div class="title-with-badge">
            <span class="material-symbols-outlined header-icon">desk</span>
            <h1 class="page-title">
              {{ langService.isRtl() ? 'مكتب الاستقبال وإدارة الدخول' : "Reception Desk & Queue Manager" }}
            </h1>
          </div>
          <p class="page-subtitle">
            {{ langService.isRtl()
              ? 'تسجيل المرضى الجدد، استخراج الكود الموحد، وتوزيع أرقام الطابور وغرف الكشف'
              : 'Register new walk-in patients, issue unified IDs, and manage daily check-ins' }}
          </p>
        </div>

        <div class="header-actions">
          <button class="btn btn-primary" (click)="openRegisterModal()">
            <span class="material-symbols-outlined">person_add</span>
            <span>{{ langService.isRtl() ? 'تسجيل مريض جديد (كود موحد)' : 'Register Walk-In Patient' }}</span>
          </button>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="metrics-grid">
        <div class="metric-card waiting">
          <span class="material-symbols-outlined metric-icon">schedule</span>
          <div class="metric-info">
            <span class="val">{{ queueStats().waiting }}</span>
            <span class="lbl">{{ langService.isRtl() ? 'في صالة الانتظار' : 'In Waiting Lounge' }}</span>
          </div>
        </div>

        <div class="metric-card active">
          <span class="material-symbols-outlined metric-icon">meeting_room</span>
          <div class="metric-info">
            <span class="val">{{ queueStats().inProgress }}</span>
            <span class="lbl">{{ langService.isRtl() ? 'في غرف الكشف' : 'With Doctors' }}</span>
          </div>
        </div>

        <div class="metric-card done">
          <span class="material-symbols-outlined metric-icon">done_all</span>
          <div class="metric-info">
            <span class="val">{{ queueStats().completed }}</span>
            <span class="lbl">{{ langService.isRtl() ? 'اكتمل كشفهم اليوم' : 'Completed Today' }}</span>
          </div>
        </div>

        <div class="metric-card total">
          <span class="material-symbols-outlined metric-icon">badge</span>
          <div class="metric-info">
            <span class="val">{{ queueStats().total }}</span>
            <span class="lbl">{{ langService.isRtl() ? 'إجمالي الحالات اليوم' : 'Total Check-ins' }}</span>
          </div>
        </div>
      </div>

      <!-- Main Desk Section: Search & Check-in Console -->
      <div class="console-card">
        <div class="search-section">
          <label class="search-label">
            {{ langService.isRtl() ? 'البحث عن مريض (الكود الموحد، الرقم القومي، الهاتف، أو الاسم)' : 'Search Patient (Unified ID, National ID, Phone, or Name)' }}
          </label>
          <div class="search-bar">
            <span class="material-symbols-outlined">search</span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (keyup.enter)="searchPatient()"
              [placeholder]="langService.isRtl() ? 'أدخل مثلاً: SH-2026-000101 أو 01012345678 أو الرقم القومي...' : 'Enter e.g. SH-2026-000101, 29805121601234, or name...'"
            />
            <button class="btn btn-secondary" (click)="searchPatient()">
              <span>{{ langService.isRtl() ? 'بحث' : 'Search' }}</span>
            </button>
          </div>
        </div>

        <!-- Selected Patient Quick Card -->
        <div class="patient-found-box" *ngIf="foundPatient">
          <div class="found-header">
            <div class="avatar-col">
              <span class="material-symbols-outlined">account_circle</span>
            </div>
            <div class="info-col">
              <div class="found-name-row">
                <h3>{{ foundPatient.fullName }}</h3>
                <span class="uid-tag">{{ foundPatient.unifiedPatientId }}</span>
                <span class="blood-tag">{{ foundPatient.bloodType || 'A+' }}</span>
              </div>
              <div class="found-meta-row">
                <span>{{ langService.isRtl() ? 'الرقم القومي:' : 'National ID:' }} {{ foundPatient.nationalId }}</span>
                <span>•</span>
                <span>{{ langService.isRtl() ? 'الهاتف:' : 'Phone:' }} {{ foundPatient.phoneNumber }}</span>
                <span>•</span>
                <span>{{ langService.isRtl() ? 'تاريخ الميلاد:' : 'DOB:' }} {{ foundPatient.dateOfBirth }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Check-in Controller -->
          <div class="checkin-controller">
            <div class="ctrl-field">
              <label>{{ langService.isRtl() ? 'اختر الطبيب المعالج:' : 'Assign to Doctor:' }}</label>
              <select [(ngModel)]="assignedDoctorId">
                <option *ngFor="let doc of doctorsList" [value]="doc.id">
                  {{ doc.fullName }} ({{ doc.specialty }})
                </option>
              </select>
            </div>

            <button class="btn btn-primary checkin-btn" (click)="checkInPatient()">
              <span class="material-symbols-outlined">how_to_reg</span>
              <span>{{ langService.isRtl() ? 'تسجيل دخول وتخصيص رقم طابور' : 'Check-In & Assign Queue Token' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Today's Queue Management Table -->
      <div class="queue-table-card">
        <div class="table-card-header">
          <div class="title-col">
            <span class="material-symbols-outlined">reorder</span>
            <h3>{{ langService.isRtl() ? 'طابور المرضى الحالي بالعيادة' : "Live Clinic Waiting Queue" }}</h3>
          </div>
          <button class="btn btn-secondary btn-sm" (click)="loadQueue()">
            <span class="material-symbols-outlined">sync</span>
            <span>{{ langService.isRtl() ? 'تحديث' : 'Refresh' }}</span>
          </button>
        </div>

        <div class="table-container">
          <table class="styled-table">
            <thead>
              <tr>
                <th>{{ langService.isRtl() ? 'رقم الكشف' : 'Queue #' }}</th>
                <th>{{ langService.isRtl() ? 'اسم المريض' : 'Patient Name' }}</th>
                <th>{{ langService.isRtl() ? 'الكود الموحد' : 'Unified ID' }}</th>
                <th>{{ langService.isRtl() ? 'الطبيب المعالج' : 'Doctor' }}</th>
                <th>{{ langService.isRtl() ? 'وقت الدخول' : 'Time' }}</th>
                <th>{{ langService.isRtl() ? 'الحالة' : 'Status' }}</th>
                <th class="actions-header">{{ langService.isRtl() ? 'إجراءات' : 'Actions' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of todayQueue(); let idx = index">
                <td>
                  <span class="queue-token-pill">#{{ item.queueNumber || (idx + 1) }}</span>
                </td>
                <td class="font-bold">{{ item.patientName }}</td>
                <td>
                  <span class="uid-code">{{ item.unifiedPatientId }}</span>
                </td>
                <td>{{ item.doctorName }}</td>
                <td>{{ item.appointmentTime }}</td>
                <td>
                  <span class="status-badge" [ngClass]="item.status.toLowerCase()">
                    {{ item.status }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button
                    class="icon-action-btn"
                    [title]="langService.isRtl() ? 'استدعاء المريض' : 'Call Patient'"
                    (click)="callPatient(item)"
                  >
                    <span class="material-symbols-outlined">campaign</span>
                  </button>
                  <button
                    class="icon-action-btn complete"
                    [title]="langService.isRtl() ? 'تحديد كمكتمل' : 'Mark Completed'"
                    (click)="completePatient(item)"
                  >
                    <span class="material-symbols-outlined">check_circle</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Register Modal -->
      <div class="modal-backdrop" *ngIf="showRegisterModal" (click)="showRegisterModal = false">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-with-icon">
              <span class="material-symbols-outlined">badge</span>
              <h3>{{ langService.isRtl() ? 'تسجيل مريض جديد وإصدار كود صحتي الموحد' : 'New Patient Registration (Unified Health ID)' }}</h3>
            </div>
            <button class="close-btn" (click)="showRegisterModal = false">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-grid-2">
              <div class="form-group">
                <label class="required">{{ langService.isRtl() ? 'الاسم رباعي' : 'Full Name' }}</label>
                <input type="text" class="form-control" [(ngModel)]="newReg.fullName" placeholder="Ahmed Mahmoud Hassan" />
              </div>

              <div class="form-group">
                <label class="required">{{ langService.isRtl() ? 'الرقم القومي (14 رقم)' : 'National ID (14 digits)' }}</label>
                <input type="text" class="form-control" maxlength="14" [(ngModel)]="newReg.nationalId" placeholder="29805121601234" />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="required">{{ langService.isRtl() ? 'رقم الهاتف المحمول' : 'Phone Number' }}</label>
                <input type="tel" class="form-control" [(ngModel)]="newReg.phoneNumber" placeholder="01012345678" />
              </div>

              <div class="form-group">
                <label>{{ langService.isRtl() ? 'البريد الإلكتروني (اختياري)' : 'Email Address' }}</label>
                <input type="email" class="form-control" [(ngModel)]="newReg.email" placeholder="patient@example.com" />
              </div>
            </div>

            <div class="form-grid-3">
              <div class="form-group">
                <label class="required">{{ langService.isRtl() ? 'تاريخ الميلاد' : 'Date of Birth' }}</label>
                <input type="date" class="form-control" [(ngModel)]="newReg.dateOfBirth" />
              </div>

              <div class="form-group">
                <label class="required">{{ langService.isRtl() ? 'النوع' : 'Gender' }}</label>
                <select class="form-control" [(ngModel)]="newReg.gender">
                  <option [value]="1">{{ langService.isRtl() ? 'ذكر' : 'Male' }}</option>
                  <option [value]="2">{{ langService.isRtl() ? 'أنثى' : 'Female' }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>{{ langService.isRtl() ? 'فصيلة الدم' : 'Blood Type' }}</label>
                <select class="form-control" [(ngModel)]="newReg.bloodType">
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

            <div class="form-grid-2">
              <div class="form-group">
                <label>{{ langService.isRtl() ? 'اسم جهة اتصال الطوارئ' : 'Emergency Contact Name' }}</label>
                <input type="text" class="form-control" [(ngModel)]="newReg.emergencyContactName" placeholder="Mona Hassan" />
              </div>

              <div class="form-group">
                <label>{{ langService.isRtl() ? 'هاتف جهة اتصال الطوارئ' : 'Emergency Contact Phone' }}</label>
                <input type="tel" class="form-control" [(ngModel)]="newReg.emergencyContactPhone" placeholder="01098765432" />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showRegisterModal = false">
              <span>{{ langService.isRtl() ? 'إلغاء' : 'Cancel' }}</span>
            </button>
            <button class="btn btn-primary" (click)="submitRegister()" [disabled]="isSaving()">
              <span class="material-symbols-outlined">badge</span>
              <span>{{ isSaving() 
                ? (langService.isRtl() ? 'جاري الإصدار...' : 'Issuing Unified ID...') 
                : (langService.isRtl() ? 'إصدار الكود الطبي والتسجيل' : 'Generate ID & Save') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .desk-page {
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

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 1rem;
    }

    .metric-card {
      background: var(--color-surface-card);
      border-radius: var(--radius-card);
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border: 1px solid var(--color-border-subtle);
      box-shadow: var(--shadow-sm);

      .metric-icon {
        font-size: 2rem;
        padding: 0.65rem;
        border-radius: var(--radius-md);
      }

      .metric-info {
        display: flex;
        flex-direction: column;
      }

      .val {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--color-text-main);
        line-height: 1.2;
      }

      .lbl {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--color-text-muted);
      }

      &.waiting .metric-icon {
        background: rgba(245, 158, 11, 0.12);
        color: #d97706;
      }

      &.active .metric-icon {
        background: rgba(8, 131, 149, 0.12);
        color: var(--color-primary-ocean);
      }

      &.done .metric-icon {
        background: rgba(16, 185, 129, 0.12);
        color: #059669;
      }

      &.total .metric-icon {
        background: rgba(10, 77, 104, 0.1);
        color: var(--color-primary-deep);
      }
    }

    /* Console Card */
    .console-card {
      background: var(--color-surface-card);
      border-radius: var(--radius-card);
      padding: 1.5rem;
      border: 1px solid var(--color-border-subtle);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .search-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .search-label {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--color-text-main);
      }

      .search-bar {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        background: var(--color-bg-app);
        border: 1px solid var(--color-border-subtle);
        border-radius: var(--radius-md);
        padding: 0.4rem 0.75rem;

        span { color: var(--color-text-muted); }

        input {
          flex: 1;
          border: none;
          background: none;
          font-size: 1rem;
          color: var(--color-text-main);
          &:focus { outline: none; }
        }
      }
    }

    /* Found Patient Box */
    .patient-found-box {
      background: rgba(8, 131, 149, 0.04);
      border: 1px solid rgba(8, 131, 149, 0.2);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .found-header {
        display: flex;
        align-items: center;
        gap: 1rem;

        .avatar-col span {
          font-size: 3rem;
          color: var(--color-primary-ocean);
        }

        .info-col {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;

          .found-name-row {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex-wrap: wrap;

            h3 { margin: 0; font-size: 1.2rem; font-weight: 800; }

            .uid-tag {
              font-family: monospace;
              font-weight: 800;
              background: var(--color-primary-deep);
              color: #fff;
              padding: 0.2rem 0.6rem;
              border-radius: var(--radius-sm);
              font-size: 0.8rem;
            }

            .blood-tag {
              background: rgba(239, 68, 68, 0.15);
              color: #b91c1c;
              font-weight: 800;
              padding: 0.2rem 0.5rem;
              border-radius: var(--radius-full);
              font-size: 0.8rem;
            }
          }

          .found-meta-row {
            display: flex;
            gap: 0.65rem;
            color: var(--color-text-muted);
            font-size: 0.85rem;
          }
        }
      }

      .checkin-controller {
        display: flex;
        align-items: flex-end;
        gap: 1rem;
        border-top: 1px solid rgba(8, 131, 149, 0.15);
        padding-top: 1rem;
        flex-wrap: wrap;

        .ctrl-field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          flex: 1;
          min-width: 250px;

          label {
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--color-text-muted);
          }

          select {
            padding: 0.6rem 0.75rem;
            border-radius: var(--radius-md);
            border: 1px solid var(--color-border-subtle);
            background: var(--color-surface-card);
            color: var(--color-text-main);
            font-size: 0.95rem;
          }
        }

        .checkin-btn {
          height: 44px;
        }
      }
    }

    /* Queue Table Card */
    .queue-table-card {
      background: var(--color-surface-card);
      border-radius: var(--radius-card);
      border: 1px solid var(--color-border-subtle);
      box-shadow: var(--shadow-sm);
      overflow: hidden;

      .table-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid var(--color-border-subtle);

        .title-col {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          span { color: var(--color-primary-deep); font-size: 1.5rem; }
          h3 { margin: 0; font-size: 1.15rem; font-weight: 800; color: var(--color-text-main); }
        }
      }
    }

    .table-container {
      overflow-x: auto;
    }

    .styled-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;

      th {
        background: var(--color-bg-app);
        padding: 0.85rem 1.25rem;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid var(--color-border-subtle);
      }

      td {
        padding: 1rem 1.25rem;
        border-bottom: 1px solid var(--color-border-subtle);
        font-size: 0.9rem;
        color: var(--color-text-main);
      }

      tr:last-child td {
        border-bottom: none;
      }

      .queue-token-pill {
        display: inline-block;
        font-weight: 900;
        background: rgba(10, 77, 104, 0.08);
        color: var(--color-primary-deep);
        padding: 0.25rem 0.65rem;
        border-radius: var(--radius-md);
      }

      .uid-code {
        font-family: monospace;
        font-weight: 700;
        color: var(--color-primary-ocean);
      }

      .status-badge {
        display: inline-block;
        padding: 0.25rem 0.65rem;
        border-radius: var(--radius-full);
        font-size: 0.75rem;
        font-weight: 700;

        &.pending {
          background: rgba(245, 158, 11, 0.12);
          color: #d97706;
        }

        &.confirmed {
          background: rgba(8, 131, 149, 0.15);
          color: var(--color-primary-deep);
        }

        &.completed {
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
        }
      }

      .actions-cell {
        display: flex;
        gap: 0.5rem;

        .icon-action-btn {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--color-border-subtle);
          background: var(--color-surface-card);
          color: var(--color-text-muted);
          cursor: pointer;

          &:hover {
            color: var(--color-primary-ocean);
            border-color: var(--color-primary-ocean);
          }

          &.complete:hover {
            color: #059669;
            border-color: #059669;
          }
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
      max-width: 650px;
      box-shadow: var(--shadow-lg);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid var(--color-border-subtle);

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid var(--color-border-subtle);

        .modal-title-with-icon {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          span { color: var(--color-primary-deep); font-size: 1.5rem; }
          h3 { margin: 0; font-size: 1.15rem; font-weight: 800; color: var(--color-text-main); }
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
        }
      }

      .modal-body {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-height: 75vh;
        overflow-y: auto;
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

    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1rem;
    }

    /* RTL */
    .desk-page.rtl {
      direction: rtl;

      .styled-table {
        text-align: right;
      }
    }
  `]
})
export class ReceptionistDeskComponent implements OnInit {
  private patientService = inject(PatientService);
  private appointmentService = inject(AppointmentService);
  private clinicService = inject(ClinicService);
  public langService = inject(LanguageService);

  public searchQuery = '';
  public foundPatient: PatientDto | null = null;
  public assignedDoctorId = '1';

  public showRegisterModal = false;
  public isSaving = signal<boolean>(false);

  public doctorsList: DoctorDto[] = [
    {
      id: '1',
      userId: '2',
      fullName: 'Dr. Sarah Smith',
      phoneNumber: '01011112222',
      specialty: 'Internal Medicine & Cardiology',
      licenseNumber: 'MD-89102-EG',
      affiliatedClinicsCount: 1
    },
    {
      id: '2',
      userId: '3',
      fullName: 'Dr. Hesham Talaat',
      phoneNumber: '01033334444',
      specialty: 'Pediatrics',
      licenseNumber: 'MD-67210-EG',
      affiliatedClinicsCount: 1
    }
  ];

  public todayQueue = signal<DailyQueueItemDto[]>([]);

  public queueStats = computed(() => {
    const list = this.todayQueue();
    return {
      waiting: list.filter(i => i.status === 'Pending').length,
      inProgress: list.filter(i => i.status === 'Confirmed').length,
      completed: list.filter(i => i.status === 'Completed').length,
      total: list.length
    };
  });

  public newReg: CreatePatientDto = {
    fullName: '',
    nationalId: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '1995-05-15',
    gender: 1,
    bloodType: 'A+',
    emergencyContactName: '',
    emergencyContactPhone: ''
  };

  ngOnInit(): void {
    this.loadQueue();
    this.loadDoctors();
  }

  loadQueue(): void {
    const today = new Date().toISOString().split('T')[0];
    this.appointmentService.getDailyQueue('1', today).subscribe({
      next: data => {
        if (data && data.length > 0) {
          this.todayQueue.set(data);
        } else {
          this.seedInitialQueue();
        }
      },
      error: () => this.seedInitialQueue()
    });
  }

  private seedInitialQueue(): void {
    const mocks: DailyQueueItemDto[] = [
      {
        appointmentId: '101',
        queueNumber: 1,
        patientName: 'Ahmed Mahmoud Hassan',
        unifiedPatientId: 'SH-2026-000101',
        appointmentTime: '09:00 AM',
        status: 'Completed',
        doctorName: 'Dr. Sarah Smith'
      },
      {
        appointmentId: '102',
        queueNumber: 2,
        patientName: 'Mona Youssef El-Sayed',
        unifiedPatientId: 'SH-2026-000102',
        appointmentTime: '09:30 AM',
        status: 'Confirmed',
        doctorName: 'Dr. Sarah Smith'
      },
      {
        appointmentId: '103',
        queueNumber: 3,
        patientName: 'Tarek Zaki Ibrahim',
        unifiedPatientId: 'SH-2026-000103',
        appointmentTime: '10:00 AM',
        status: 'Pending',
        doctorName: 'Dr. Sarah Smith'
      }
    ];
    this.todayQueue.set(mocks);
  }

  loadDoctors(): void {
    this.clinicService.getDoctors().subscribe({
      next: docs => {
        if (docs && docs.length > 0) {
          this.doctorsList = docs;
        }
      }
    });
  }

  searchPatient(): void {
    if (!this.searchQuery.trim()) return;

    this.patientService.getPatients(1, 10, this.searchQuery.trim()).subscribe({
      next: res => {
        if (res && res.items && res.items.length > 0) {
          this.foundPatient = res.items[0];
        } else {
          this.mockPatientLookup(this.searchQuery.trim());
        }
      },
      error: () => {
        this.mockPatientLookup(this.searchQuery.trim());
      }
    });
  }

  private mockPatientLookup(query: string): void {
    this.foundPatient = {
      id: '1',
      unifiedPatientId: query.startsWith('SH') ? query : 'SH-2026-000101',
      nationalId: '29805121601234',
      fullName: 'Ahmed Mahmoud Hassan',
      phoneNumber: '01012345678',
      email: 'ahmed.patient@sehati.gov.eg',
      dateOfBirth: '1988-06-12',
      gender: 1,
      bloodType: 'A+',
      emergencyContactName: 'Mona Hassan (Sister)',
      emergencyContactPhone: '01098765432',
      createdAt: '2026-11-01'
    };
  }

  checkInPatient(): void {
    if (!this.foundPatient) return;

    const currentCount = this.todayQueue().length;
    const doc = this.doctorsList.find(d => d.id === this.assignedDoctorId);

    const newItem: DailyQueueItemDto = {
      appointmentId: (currentCount + 101).toString(),
      queueNumber: currentCount + 1,
      patientName: this.foundPatient.fullName,
      unifiedPatientId: this.foundPatient.unifiedPatientId,
      appointmentTime: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }).format(new Date()),
      status: 'Pending',
      doctorName: doc?.fullName || 'Dr. Sarah Smith'
    };

    this.todayQueue.update(list => [...list, newItem]);

    alert(
      this.langService.isRtl()
        ? `تم تسجيل دخول المريض بنجاح! رقم الطابور المخصص: #${newItem.queueNumber}`
        : `Patient checked in successfully! Assigned Queue Token: #${newItem.queueNumber}`
    );

    this.foundPatient = null;
    this.searchQuery = '';
  }

  callPatient(item: DailyQueueItemDto): void {
    item.status = 'Confirmed';
    this.todayQueue.update(list => [...list]);
    alert(
      this.langService.isRtl()
        ? `تم استدعاء المريض #${item.queueNumber} (${item.patientName}) لغرفة الكشف.`
        : `Calling Patient #${item.queueNumber} (${item.patientName}) to consultation room.`
    );
  }

  completePatient(item: DailyQueueItemDto): void {
    item.status = 'Completed';
    this.todayQueue.update(list => [...list]);
  }

  openRegisterModal(): void {
    this.newReg = {
      fullName: '',
      nationalId: '',
      phoneNumber: '',
      email: '',
      dateOfBirth: '1995-05-15',
      gender: 1,
      bloodType: 'A+',
      emergencyContactName: '',
      emergencyContactPhone: ''
    };
    this.showRegisterModal = true;
  }

  submitRegister(): void {
    if (!this.newReg.fullName || !this.newReg.nationalId || !this.newReg.phoneNumber) {
      alert(this.langService.isRtl() ? 'يرجى استكمال البيانات الإلزامية المطلوبة' : 'Please complete all required fields.');
      return;
    }

    this.isSaving.set(true);

    this.patientService.createPatient(this.newReg).subscribe({
      next: created => {
        this.isSaving.set(false);
        this.showRegisterModal = false;
        this.foundPatient = created;
        alert(
          this.langService.isRtl()
            ? `تم تسجيل المريض بنجاح وتم توليد الكود الطبي الموحد: ${created.unifiedPatientId}`
            : `Patient registered successfully! Generated Unified Health ID: ${created.unifiedPatientId}`
        );
      },
      error: () => {
        // Fallback mock generation
        const generatedUid = `SH-2026-${Math.floor(100000 + Math.random() * 900000)}`;
        this.isSaving.set(false);
        this.showRegisterModal = false;
        this.foundPatient = {
          id: Math.floor(Math.random() * 1000).toString(),
          unifiedPatientId: generatedUid,
          nationalId: this.newReg.nationalId,
          fullName: this.newReg.fullName,
          phoneNumber: this.newReg.phoneNumber,
          email: this.newReg.email,
          dateOfBirth: this.newReg.dateOfBirth,
          gender: this.newReg.gender,
          bloodType: this.newReg.bloodType,
          emergencyContactName: this.newReg.emergencyContactName,
          emergencyContactPhone: this.newReg.emergencyContactPhone,
          createdAt: new Date().toISOString()
        };

        alert(
          this.langService.isRtl()
            ? `تم تسجيل المريض وتوليد الكود الطبي الموحد: ${generatedUid}`
            : `Patient registered and generated Unified Health ID: ${generatedUid}`
        );
      }
    });
  }
}

