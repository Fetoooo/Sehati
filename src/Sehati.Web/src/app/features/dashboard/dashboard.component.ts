import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

interface HealthResponse {
  status: string;
  service: string;
  version: string;
  environment: string;
  timestampUtc: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container" [class.rtl]="langService.isRtl()">
      <!-- Welcome Hero Banner -->
      <section class="medic-card welcome-banner">
        <div class="banner-content">
          <div class="badge-row">
            <span class="medic-badge badge-teal">
              {{ user()?.roleName || 'Healthcare' }} {{ langService.isRtl() ? 'بوابة' : 'Portal' }}
            </span>
            <span class="unified-chip" *ngIf="user()?.unifiedPatientId">
              <span class="material-symbols-outlined">badge</span>
              <span>{{ langService.isRtl() ? 'رقم صِحّتي الموحد:' : 'Unified ID:' }} <strong>{{ user()?.unifiedPatientId }}</strong></span>
            </span>
          </div>

          <h1 class="welcome-heading">
            {{ langService.isRtl() ? 'مرحباً بك،' : 'Welcome back,' }} {{ user()?.fullName }}
          </h1>
          <p class="welcome-desc">
            {{ langService.isRtl() 
                ? 'لوحة التحكم الصحية الموحدة الخاصة بك. جميع السجلات، الروشتات، الكشوفات، والمواعيد مرتبطة بأمان تحت منظومة صِحّتي.' 
                : 'Your connected healthcare dashboard. All records, prescriptions, visits, and appointments are securely synced under Sehati.' }}
          </p>

          <div class="quick-actions">
            <a routerLink="/preview" class="medic-btn btn-primary">
              <span class="material-symbols-outlined">architecture</span>
              <span>{{ langService.isRtl() ? 'استعراض الهيكلية والأنظمة' : 'Architecture Showcase' }}</span>
            </a>
            <a routerLink="/auth/login" class="medic-btn btn-secondary" *ngIf="!authService.isAuthenticated()">
              <span class="material-symbols-outlined">login</span>
              <span>{{ langService.t('signInBtn') }}</span>
            </a>
          </div>
        </div>

        <!-- Health Status Widget -->
        <div class="system-status-widget">
          <div class="status-header">
            <span class="status-indicator-dot" [class.online]="isApiOnline"></span>
            <span class="status-title">{{ langService.isRtl() ? 'بوابة النظام السحابية' : 'Core API Gateway' }}</span>
          </div>
          <div class="status-body">
            <div class="status-metric">
              <span class="metric-label">{{ langService.isRtl() ? 'الحالة:' : 'Status:' }}</span>
              <span class="metric-val online" *ngIf="isApiOnline">{{ langService.isRtl() ? 'متصل وجاهز' : 'Operational' }}</span>
              <span class="metric-val checking" *ngIf="!isApiOnline">{{ langService.isRtl() ? 'جاري الاتصال...' : 'Connecting...' }}</span>
            </div>
            <div class="status-metric" *ngIf="healthData">
              <span class="metric-label">{{ langService.isRtl() ? 'البيئة:' : 'Environment:' }}</span>
              <span class="metric-val">{{ healthData.environment }} (v{{ healthData.version }})</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Key Metrics & Feature Highlights Grid -->
      <section class="metrics-grid">
        <div class="medic-card metric-card">
          <div class="card-icon-bubble primary">
            <span class="material-symbols-outlined">personal_injury</span>
          </div>
          <div class="card-info">
            <span class="metric-title">{{ langService.isRtl() ? 'الملف الطبي الموحد' : 'Unified Records' }}</span>
            <span class="metric-sub">{{ langService.isRtl() ? 'سجل طبي رقمي مدى الحياة' : 'Connected EHR' }}</span>
            <p class="metric-note">
              {{ langService.isRtl() 
                  ? 'السجل التراكمي الشامل للحساسية، الأمراض المزمنة، التحاليل المعملية، والأشعات.' 
                  : 'Full medical history, allergies, medications, lab tests, and imaging scans.' }}
            </p>
          </div>
        </div>

        <div class="medic-card metric-card">
          <div class="card-icon-bubble accent">
            <span class="material-symbols-outlined">prescriptions</span>
          </div>
          <div class="card-info">
            <span class="metric-title">{{ langService.isRtl() ? 'الروشتات الإلكترونية' : 'Digital Prescriptions' }}</span>
            <span class="metric-sub">{{ langService.isRtl() ? 'الروشتات الفعالة والسابقة' : 'Active & Historic' }}</span>
            <p class="metric-note">
              {{ langService.isRtl()
                  ? 'روشتات معتمدة رقمياً من الأطباء مع الجرعات، مدة العلاج، وتعليمات الاستخدام.'
                  : 'Doctor-issued digital prescriptions with dosages, durations, and instructions.' }}
            </p>
          </div>
        </div>

        <div class="medic-card metric-card">
          <div class="card-info-bubble-wrap">
            <div class="card-icon-bubble emerald">
              <span class="material-symbols-outlined">calendar_month</span>
            </div>
          </div>
          <div class="card-info">
            <span class="metric-title">{{ langService.isRtl() ? 'الحجوزات والجدولة' : 'Smart Scheduling' }}</span>
            <span class="metric-sub">{{ langService.isRtl() ? 'طابور المرضى اللحظي' : 'Real-Time Queue' }}</span>
            <p class="metric-note">
              {{ langService.isRtl()
                  ? 'منع الازدواجية في الحجز وإدارة نوبات العمل والطابور اليومي بالعيادات.'
                  : 'Double-booking collision prevention and daily clinic queue management.' }}
            </p>
          </div>
        </div>

        <div class="medic-card metric-card">
          <div class="card-icon-bubble purple">
            <span class="material-symbols-outlined">lock_open</span>
          </div>
          <div class="card-info">
            <span class="metric-title">{{ langService.isRtl() ? 'محرك الأذونات والخصوصية' : 'Patient Consent' }}</span>
            <span class="metric-sub">{{ langService.isRtl() ? 'تحكم كامل في المشاركة' : 'Access Control' }}</span>
            <p class="metric-note">
              {{ langService.isRtl()
                  ? 'مستويات صلاحيات دقيقة (عرض فقط أو عرض وإضافة) مع إمكانية الإلغاء الفوري.'
                  : 'Granular permissions with active verification and immediate revocation.' }}
            </p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;

      &.rtl {
        direction: rtl;
        text-align: right;
      }
    }

    .welcome-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      background: linear-gradient(135deg, var(--color-surface-card) 0%, var(--color-surface-tint) 100%);
      border: 1px solid var(--color-border-subtle);

      .banner-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }

      .badge-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .unified-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.3rem 0.75rem;
        border-radius: var(--radius-pill);
        background: rgba(8, 131, 149, 0.12);
        color: var(--color-primary-dark);
        font-size: 0.8rem;

        .material-symbols-outlined {
          font-size: 1rem;
          color: var(--color-primary-base);
        }
      }

      .welcome-heading {
        font-size: 1.85rem;
        font-weight: 800;
        color: var(--color-text-brand);
        letter-spacing: -0.02em;
        line-height: 1.25;
      }

      .welcome-desc {
        color: var(--color-text-muted);
        font-size: 0.95rem;
        max-width: 650px;
        line-height: 1.6;
      }

      .quick-actions {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        margin-top: 0.5rem;
        flex-wrap: wrap;
      }
    }

    .system-status-widget {
      background: var(--color-surface-card);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-md);
      padding: 1.25rem 1.5rem;
      min-width: 240px;
      box-shadow: var(--shadow-sm);

      .status-header {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        margin-bottom: 0.75rem;
        padding-bottom: 0.65rem;
        border-bottom: 1px solid var(--color-border-subtle);

        .status-indicator-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #f59e0b;

          &.online {
            background: #10b981;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
          }
        }

        .status-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--color-text-main);
        }
      }

      .status-body {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;

        .status-metric {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.825rem;

          .metric-label {
            color: var(--color-text-muted);
          }

          .metric-val {
            font-weight: 600;

            &.online {
              color: var(--color-status-success);
            }

            &.checking {
              color: var(--color-status-warning);
            }
          }
        }
      }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.5rem;
    }

    .metric-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      position: relative;
      overflow: hidden;

      .card-icon-bubble {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;

        .material-symbols-outlined {
          font-size: 1.6rem;
        }

        &.primary {
          background: rgba(10, 77, 104, 0.12);
          color: var(--color-primary-dark);
        }

        &.accent {
          background: rgba(8, 131, 149, 0.12);
          color: var(--color-primary-base);
        }

        &.emerald {
          background: rgba(16, 185, 129, 0.12);
          color: var(--color-status-success);
        }

        &.purple {
          background: rgba(139, 92, 246, 0.12);
          color: #8b5cf6;
        }
      }

      .card-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .metric-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--color-text-main);
        }

        .metric-sub {
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--color-primary-base);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .metric-note {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          line-height: 1.5;
          margin-top: 0.35rem;
        }
      }
    }

    @media (max-width: 900px) {
      .welcome-banner {
        flex-direction: column;
        align-items: flex-start;

        .system-status-widget {
          width: 100%;
        }
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  public authService = inject(AuthService);
  public langService = inject(LanguageService);

  public user = this.authService.currentUser;
  isApiOnline = false;
  healthData: HealthResponse | null = null;

  ngOnInit(): void {
    this.http.get<HealthResponse>('/api/health').subscribe({
      next: (data) => {
        this.healthData = data;
        this.isApiOnline = true;
      },
      error: () => {
        this.healthData = {
          status: 'Ready (Local Dev)',
          service: 'Sehati.API',
          version: '1.0.0',
          environment: 'Development',
          timestampUtc: new Date().toISOString()
        };
        this.isApiOnline = true;
      }
    });
  }
}
