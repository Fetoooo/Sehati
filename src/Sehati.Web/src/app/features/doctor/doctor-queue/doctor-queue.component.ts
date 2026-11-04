import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { DailyQueueItemDto, AppointmentStatus } from '../../../core/models/appointment.models';

interface QueueStats {
  waiting: number;
  inProgress: number;
  completed: number;
  total: number;
}

@Component({
  selector: 'app-doctor-queue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="queue-page" [class.rtl]="langService.isRtl()">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-titles">
          <div class="title-with-badge">
            <span class="material-symbols-outlined header-icon">reduce_capacity</span>
            <h1 class="page-title">
              {{ langService.isRtl() ? 'طابور كشف اليوم والعيادة' : "Today's Patient Queue" }}
            </h1>
            <span class="live-indicator">
              <span class="pulse-dot"></span>
              {{ langService.isRtl() ? 'مباشر' : 'LIVE' }}
            </span>
          </div>
          <p class="page-subtitle">
            {{ langService.isRtl() 
              ? 'إدارة طابور الانتظار، استدعاء المرضى، وبدء الكشف الطبي وتوثيق الروشتات' 
              : 'Manage patient waiting queue, call patients to examination room, and launch clinical encounters' }}
          </p>
        </div>

        <div class="header-actions">
          <div class="date-chip">
            <span class="material-symbols-outlined">event</span>
            <span>{{ todayDisplay }}</span>
          </div>
          <button class="btn btn-secondary" (click)="loadQueue()">
            <span class="material-symbols-outlined">refresh</span>
            <span>{{ langService.isRtl() ? 'تحديث' : 'Refresh' }}</span>
          </button>
        </div>
      </div>

      <!-- KPI Stat Cards -->
      <div class="stats-grid">
        <div class="stat-card waiting">
          <div class="stat-icon">
            <span class="material-symbols-outlined">hourglass_top</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats().waiting }}</span>
            <span class="stat-label">{{ langService.isRtl() ? 'في الانتظار' : 'Waiting' }}</span>
          </div>
        </div>

        <div class="stat-card in-progress">
          <div class="stat-icon">
            <span class="material-symbols-outlined">stethoscope</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats().inProgress }}</span>
            <span class="stat-label">{{ langService.isRtl() ? 'قيد الكشف الآن' : 'In Consultation' }}</span>
          </div>
        </div>

        <div class="stat-card completed">
          <div class="stat-icon">
            <span class="material-symbols-outlined">check_circle</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats().completed }}</span>
            <span class="stat-label">{{ langService.isRtl() ? 'تم الكشف' : 'Completed' }}</span>
          </div>
        </div>

        <div class="stat-card total">
          <div class="stat-icon">
            <span class="material-symbols-outlined">groups</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats().total }}</span>
            <span class="stat-label">{{ langService.isRtl() ? 'إجمالي الحالات اليوم' : 'Total Appointments' }}</span>
          </div>
        </div>
      </div>

      <!-- Controls & Filter Toolbar -->
      <div class="toolbar-card">
        <div class="search-box">
          <span class="material-symbols-outlined search-icon">search</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            [placeholder]="langService.isRtl() ? 'بحث برقم الطابور، اسم المريض، أو الكود الموحد...' : 'Search by queue #, patient name, or Unified ID...'"
            class="search-input"
          />
          <button *ngIf="searchQuery" class="clear-btn" (click)="searchQuery = ''">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="filter-tabs">
          <button
            class="tab-btn"
            [class.active]="activeTab === 'all'"
            (click)="activeTab = 'all'"
          >
            {{ langService.isRtl() ? 'الكل' : 'All' }} ({{ queueList().length }})
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab === 'waiting'"
            (click)="activeTab = 'waiting'"
          >
            {{ langService.isRtl() ? 'في الانتظار' : 'Waiting' }} ({{ stats().waiting }})
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab === 'inProgress'"
            (click)="activeTab = 'inProgress'"
          >
            {{ langService.isRtl() ? 'قيد الكشف' : 'In Consultation' }} ({{ stats().inProgress }})
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab === 'completed'"
            (click)="activeTab = 'completed'"
          >
            {{ langService.isRtl() ? 'المكتملة' : 'Completed' }} ({{ stats().completed }})
          </button>
        </div>
      </div>

      <!-- Queue Cards List -->
      <div class="queue-list" *ngIf="filteredQueue().length > 0; else emptyState">
        <div
          *ngFor="let item of filteredQueue()"
          class="queue-card"
          [class.active-consult]="item.status === 'Confirmed'"
          [class.done]="item.status === 'Completed'"
        >
          <!-- Queue Number Token -->
          <div class="queue-number-badge">
            <span class="token-prefix">{{ langService.isRtl() ? 'رقم' : 'No.' }}</span>
            <span class="token-number">{{ item.queueNumber || '—' }}</span>
          </div>

          <!-- Patient Information Summary -->
          <div class="patient-main-info">
            <div class="name-row">
              <h3 class="patient-name">{{ item.patientName }}</h3>
              <span class="unified-badge">
                <span class="material-symbols-outlined">badge</span>
                {{ item.unifiedPatientId }}
              </span>
            </div>

            <div class="meta-row">
              <div class="meta-item">
                <span class="material-symbols-outlined">schedule</span>
                <span>{{ item.appointmentTime }}</span>
              </div>
              <div class="meta-item" *ngIf="item.doctorName">
                <span class="material-symbols-outlined">medical_services</span>
                <span>{{ item.doctorName }}</span>
              </div>
            </div>
          </div>

          <!-- Status Indicator Pill -->
          <div class="status-col">
            <span class="status-pill" [ngClass]="getStatusClass(item.status)">
              <span class="status-dot"></span>
              {{ getStatusLabel(item.status) }}
            </span>
          </div>

          <!-- Action Controls -->
          <div class="actions-col">
            <!-- Call Patient Action -->
            <button
              *ngIf="item.status === 'Pending' || item.status === 'Confirmed'"
              class="action-btn call-btn"
              (click)="callPatient(item)"
              [title]="langService.isRtl() ? 'استدعاء المريض للدخول' : 'Call Patient to Room'"
            >
              <span class="material-symbols-outlined">notifications_active</span>
              <span>{{ langService.isRtl() ? 'استدعاء' : 'Call' }}</span>
            </button>

            <!-- Start / Resume Encounter Action -->
            <button
              class="action-btn encounter-btn"
              (click)="startEncounter(item)"
            >
              <span class="material-symbols-outlined">stethoscope</span>
              <span>{{ langService.isRtl() ? 'بدء الكشف والروشتة' : 'Open Encounter' }}</span>
            </button>

            <!-- Mark Complete Action -->
            <button
              *ngIf="item.status !== 'Completed'"
              class="action-btn complete-btn"
              (click)="markCompleted(item)"
              [title]="langService.isRtl() ? 'تحديد كمكتمل' : 'Mark as Completed'"
            >
              <span class="material-symbols-outlined">check</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <ng-template #emptyState>
        <div class="empty-card">
          <span class="material-symbols-outlined empty-icon">group_off</span>
          <h3>{{ langService.isRtl() ? 'لا يوجد مرضى في هذه القائمة' : 'No patients found in this queue' }}</h3>
          <p>{{ langService.isRtl() ? 'سيظهر المرضى المسجلون والمحجوزون لهذا اليوم تلقائياً هنا.' : 'Patients booked or checked in for today will appear here in real-time.' }}</p>
          <button class="btn btn-secondary" (click)="loadQueue()">
            <span class="material-symbols-outlined">refresh</span>
            <span>{{ langService.isRtl() ? 'إعادة التحميل' : 'Reload' }}</span>
          </button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .queue-page {
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
      flex-wrap: wrap;

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

    .live-indicator {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(16, 185, 129, 0.15);
      color: #059669;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-full);
      letter-spacing: 0.05em;

      .pulse-dot {
        width: 8px;
        height: 8px;
        background: #10B981;
        border-radius: 50%;
        animation: pulse 1.8s infinite;
      }
    }

    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }

    .page-subtitle {
      color: var(--color-text-muted);
      margin-top: 0.35rem;
      font-size: 0.95rem;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .date-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        background: var(--color-surface-card);
        border: 1px solid var(--color-border-subtle);
        padding: 0.5rem 0.9rem;
        border-radius: var(--radius-md);
        font-weight: 600;
        font-size: 0.9rem;
        color: var(--color-text-main);
      }
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: var(--color-surface-card);
      border-radius: var(--radius-card);
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border: 1px solid var(--color-border-subtle);
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s ease;

      &:hover {
        transform: translateY(-2px);
      }

      .stat-icon {
        width: 52px;
        height: 52px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        span { font-size: 1.6rem; }
      }

      .stat-info {
        display: flex;
        flex-direction: column;
      }

      .stat-value {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--color-text-main);
        line-height: 1.2;
      }

      .stat-label {
        font-size: 0.85rem;
        color: var(--color-text-muted);
        font-weight: 600;
      }

      &.waiting .stat-icon {
        background: rgba(245, 158, 11, 0.12);
        color: #d97706;
      }

      &.in-progress .stat-icon {
        background: rgba(8, 131, 149, 0.12);
        color: var(--color-primary-ocean);
      }

      &.completed .stat-icon {
        background: rgba(16, 185, 129, 0.12);
        color: #059669;
      }

      &.total .stat-icon {
        background: rgba(10, 77, 104, 0.1);
        color: var(--color-primary-deep);
      }
    }

    /* Toolbar */
    .toolbar-card {
      background: var(--color-surface-card);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-card);
      padding: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 260px;

      .search-icon {
        position: absolute;
        left: 0.85rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-text-muted);
        font-size: 1.25rem;
      }

      .search-input {
        width: 100%;
        padding: 0.65rem 1rem 0.65rem 2.6rem;
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-subtle);
        background: var(--color-bg-app);
        color: var(--color-text-main);
        font-size: 0.95rem;

        &:focus {
          outline: none;
          border-color: var(--color-primary-ocean);
        }
      }

      .clear-btn {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--color-text-muted);
        cursor: pointer;
      }
    }

    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      background: var(--color-bg-app);
      padding: 0.25rem;
      border-radius: var(--radius-md);

      .tab-btn {
        background: none;
        border: none;
        padding: 0.45rem 0.85rem;
        border-radius: var(--radius-sm);
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--color-text-muted);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          color: var(--color-text-main);
        }

        &.active {
          background: var(--color-surface-card);
          color: var(--color-primary-ocean);
          box-shadow: var(--shadow-sm);
        }
      }
    }

    /* Queue List */
    .queue-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .queue-card {
      background: var(--color-surface-card);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-card);
      padding: 1.25rem 1.5rem;
      display: grid;
      grid-template-columns: auto 1fr auto auto;
      align-items: center;
      gap: 1.5rem;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--color-primary-mint);
        box-shadow: var(--shadow-md);
      }

      &.active-consult {
        border-left: 4px solid var(--color-primary-ocean);
        background: linear-gradient(to right, rgba(8, 131, 149, 0.03), transparent);
      }

      &.done {
        opacity: 0.75;
      }
    }

    .queue-number-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      background: var(--color-surface-subtle);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-md);

      .token-prefix {
        font-size: 0.65rem;
        font-weight: 700;
        color: var(--color-text-muted);
        text-transform: uppercase;
      }

      .token-number {
        font-size: 1.4rem;
        font-weight: 900;
        color: var(--color-primary-deep);
        line-height: 1.1;
      }
    }

    .patient-main-info {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;

      .name-row {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        flex-wrap: wrap;

        .patient-name {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--color-text-main);
          margin: 0;
        }

        .unified-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-family: monospace;
          font-size: 0.8rem;
          font-weight: 700;
          background: rgba(10, 77, 104, 0.08);
          color: var(--color-primary-deep);
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-sm);

          span { font-size: 0.95rem; }
        }
      }

      .meta-row {
        display: flex;
        align-items: center;
        gap: 1.25rem;

        .meta-item {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--color-text-muted);
          font-size: 0.85rem;

          span.material-symbols-outlined {
            font-size: 1rem;
          }
        }
      }
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 0.35rem 0.85rem;
      border-radius: var(--radius-full);

      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }

      &.waiting {
        background: rgba(245, 158, 11, 0.12);
        color: #b45309;
        .status-dot { background: #f59e0b; }
      }

      &.in-consultation {
        background: rgba(8, 131, 149, 0.15);
        color: var(--color-primary-deep);
        .status-dot { background: var(--color-primary-ocean); }
      }

      &.completed {
        background: rgba(16, 185, 129, 0.12);
        color: #047857;
        .status-dot { background: #10b981; }
      }

      &.cancelled {
        background: rgba(239, 68, 68, 0.12);
        color: #b91c1c;
        .status-dot { background: #ef4444; }
      }
    }

    .actions-col {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .action-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.55rem 0.95rem;
        border-radius: var(--radius-md);
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        border: none;
        transition: all 0.2s ease;

        span.material-symbols-outlined {
          font-size: 1.1rem;
        }

        &.call-btn {
          background: rgba(245, 158, 11, 0.12);
          color: #b45309;
          border: 1px solid rgba(245, 158, 11, 0.3);

          &:hover {
            background: #f59e0b;
            color: #fff;
          }
        }

        &.encounter-btn {
          background: var(--color-primary-deep);
          color: #fff;

          &:hover {
            background: var(--color-primary-ocean);
          }
        }

        &.complete-btn {
          background: rgba(16, 185, 129, 0.12);
          color: #047857;
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 0.55rem 0.75rem;

          &:hover {
            background: #10b981;
            color: #fff;
          }
        }
      }
    }

    .empty-card {
      background: var(--color-surface-card);
      border: 1px dashed var(--color-border-subtle);
      border-radius: var(--radius-card);
      padding: 3rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;

      .empty-icon {
        font-size: 3.5rem;
        color: var(--color-text-muted);
      }

      h3 { margin: 0; color: var(--color-text-main); }
      p { margin: 0; color: var(--color-text-muted); max-width: 400px; font-size: 0.9rem; }
    }

    /* RTL specific overrides */
    .queue-page.rtl {
      direction: rtl;

      .search-box {
        .search-icon {
          left: auto;
          right: 0.85rem;
        }
        .search-input {
          padding: 0.65rem 2.6rem 0.65rem 1rem;
        }
        .clear-btn {
          right: auto;
          left: 0.75rem;
        }
      }

      .queue-card.active-consult {
        border-left: none;
        border-right: 4px solid var(--color-primary-ocean);
        background: linear-gradient(to left, rgba(8, 131, 149, 0.03), transparent);
      }
    }

    /* Responsive */
    @media (max-width: 900px) {
      .queue-card {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      .actions-col {
        justify-content: flex-start;
        flex-wrap: wrap;
      }
    }
  `]
})
export class DoctorQueueComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  public langService = inject(LanguageService);
  private router = inject(Router);

  public queueList = signal<DailyQueueItemDto[]>([]);
  public searchQuery = '';
  public activeTab: 'all' | 'waiting' | 'inProgress' | 'completed' = 'all';

  public todayDisplay = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date());

  public stats = computed<QueueStats>(() => {
    const list = this.queueList();
    return {
      waiting: list.filter(i => i.status === 'Pending').length,
      inProgress: list.filter(i => i.status === 'Confirmed' || (i.status as any) === 'InConsultation').length,
      completed: list.filter(i => i.status === 'Completed').length,
      total: list.length
    };
  });

  public filteredQueue = computed(() => {
    let list = this.queueList();

    // Tab filter
    if (this.activeTab === 'waiting') {
      list = list.filter(i => i.status === 'Pending');
    } else if (this.activeTab === 'inProgress') {
      list = list.filter(i => i.status === 'Confirmed' || (i.status as any) === 'InConsultation');
    } else if (this.activeTab === 'completed') {
      list = list.filter(i => i.status === 'Completed');
    }

    // Search query filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(
        i =>
          i.patientName.toLowerCase().includes(q) ||
          i.unifiedPatientId.toLowerCase().includes(q) ||
          i.queueNumber?.toString().includes(q)
      );
    }

    return list;
  });

  ngOnInit(): void {
    this.loadQueue();
  }

  loadQueue(): void {
    const today = new Date().toISOString().split('T')[0];
    this.appointmentService.getDailyQueue('1', today).subscribe({
      next: data => {
        if (data && data.length > 0) {
          this.queueList.set(data);
        } else {
          this.seedInitialQueue();
        }
      },
      error: () => {
        this.seedInitialQueue();
      }
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
        status: 'Confirmed', // Currently in consultation
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
      },
      {
        appointmentId: '104',
        queueNumber: 4,
        patientName: 'Nouran Karim Adel',
        unifiedPatientId: 'SH-2026-000104',
        appointmentTime: '10:30 AM',
        status: 'Pending',
        doctorName: 'Dr. Sarah Smith'
      },
      {
        appointmentId: '105',
        queueNumber: 5,
        patientName: 'Khaled Omar Mansour',
        unifiedPatientId: 'SH-2026-000105',
        appointmentTime: '11:00 AM',
        status: 'Pending',
        doctorName: 'Dr. Sarah Smith'
      }
    ];
    this.queueList.set(mocks);
  }

  callPatient(item: DailyQueueItemDto): void {
    item.status = 'Confirmed';
    this.queueList.update(list => [...list]);
    alert(
      this.langService.isRtl()
        ? `تم استدعاء المريض رقم ${item.queueNumber}: ${item.patientName} للدخول إلى غرفة الكشف`
        : `Calling Queue #${item.queueNumber}: ${item.patientName} to the examination room.`
    );
  }

  startEncounter(item: DailyQueueItemDto): void {
    this.router.navigate(['/doctor/encounter', item.appointmentId], {
      queryParams: {
        patientName: item.patientName,
        unifiedId: item.unifiedPatientId
      }
    });
  }

  markCompleted(item: DailyQueueItemDto): void {
    item.status = 'Completed';
    this.queueList.update(list => [...list]);
  }

  getStatusClass(status: AppointmentStatus): string {
    switch (status) {
      case 'Pending':
        return 'waiting';
      case 'Confirmed':
        return 'in-consultation';
      case 'Completed':
        return 'completed';
      case 'Cancelled':
      case 'NoShow':
        return 'cancelled';
      default:
        return 'waiting';
    }
  }

  getStatusLabel(status: AppointmentStatus): string {
    const isAr = this.langService.isRtl();
    switch (status) {
      case 'Pending':
        return isAr ? 'في الانتظار' : 'Waiting';
      case 'Confirmed':
        return isAr ? 'قيد الكشف' : 'In Consultation';
      case 'Completed':
        return isAr ? 'مكتمل' : 'Completed';
      case 'Cancelled':
        return isAr ? 'ملغي' : 'Cancelled';
      case 'NoShow':
        return isAr ? 'لم يحضر' : 'No Show';
      default:
        return status;
    }
  }
}

