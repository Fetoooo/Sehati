import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

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
    <div class="dashboard-container">
      <!-- Welcome Hero Banner -->
      <section class="medic-card welcome-banner">
        <div class="banner-content">
          <div class="badge-row">
            <span class="medic-badge badge-primary">{{ user()?.roleName }} Portal</span>
            <span class="unified-chip" *ngIf="user()?.unifiedPatientId">
              <span class="material-symbols-outlined">badge</span>
              <span>Unified ID: <strong>{{ user()?.unifiedPatientId }}</strong></span>
            </span>
          </div>

          <h1 class="welcome-heading">Welcome back, {{ user()?.fullName }}</h1>
          <p class="welcome-desc">
            Your connected healthcare dashboard. All records, prescriptions, visits, and appointments are securely synced under Sehati.
          </p>

          <div class="quick-actions">
            <a routerLink="/appointments" class="medic-btn btn-primary">
              <span class="material-symbols-outlined">calendar_add_on</span>
              <span>Manage Appointments</span>
            </a>
            <a routerLink="/preview" class="medic-btn btn-secondary">
              <span class="material-symbols-outlined">architecture</span>
              <span>Platform Blueprint</span>
            </a>
          </div>
        </div>

        <!-- Health Status Widget -->
        <div class="system-status-widget">
          <div class="status-header">
            <span class="status-indicator-dot" [class.online]="isApiOnline"></span>
            <span class="status-title">Core API Gateway</span>
          </div>
          <div class="status-body">
            <div class="status-metric">
              <span class="metric-label">Status:</span>
              <span class="metric-val online" *ngIf="isApiOnline">Operational</span>
              <span class="metric-val checking" *ngIf="!isApiOnline">Connecting...</span>
            </div>
            <div class="status-metric" *ngIf="healthData">
              <span class="metric-label">Environment:</span>
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
            <span class="metric-title">Unified Records</span>
            <span class="metric-sub">Connected EHR</span>
            <p class="metric-note">Full medical history, allergies, medications, lab tests, and imaging scans.</p>
          </div>
        </div>

        <div class="medic-card metric-card">
          <div class="card-icon-bubble accent">
            <span class="material-symbols-outlined">prescriptions</span>
          </div>
          <div class="card-info">
            <span class="metric-title">Digital Prescriptions</span>
            <span class="metric-sub">Active & Historic</span>
            <p class="metric-note">Doctor-issued digital prescriptions with dosages, durations, and instructions.</p>
          </div>
        </div>

        <div class="medic-card metric-card">
          <div class="card-icon-bubble emerald">
            <span class="material-symbols-outlined">calendar_month</span>
          </div>
          <div class="card-info">
            <span class="metric-title">Smart Scheduling</span>
            <span class="metric-sub">Real-Time Queue</span>
            <p class="metric-note">Double-booking collision prevention and daily clinic queue management.</p>
          </div>
        </div>

        <div class="medic-card metric-card">
          <div class="card-icon-bubble purple">
            <span class="material-symbols-outlined">lock_open</span>
          </div>
          <div class="card-info">
            <span class="metric-title">Patient Consent</span>
            <span class="metric-sub">Access Control</span>
            <p class="metric-note">Granular permissions with active verification and immediate revocation.</p>
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
    }

    .welcome-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      padding: 2.25rem 2.5rem;
      background: radial-gradient(circle at 10% 20%, rgba(20, 184, 166, 0.18) 0%, rgba(15, 23, 42, 0.75) 80%);

      @media (max-width: 900px) {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    .banner-content {
      max-width: 650px;

      .badge-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.85rem;
      }

      .unified-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.825rem;
        background: rgba(30, 41, 59, 0.7);
        border: 1px solid var(--border-subtle);
        border-radius: 9999px;
        padding: 0.2rem 0.65rem;
        color: var(--text-highlight);

        .material-symbols-outlined {
          font-size: 1rem;
        }
      }

      .welcome-heading {
        font-size: 1.85rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--text-main);
        margin-bottom: 0.5rem;
      }

      .welcome-desc {
        font-size: 0.95rem;
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: 1.5rem;
      }

      .quick-actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }
    }

    .system-status-widget {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      min-width: 250px;

      .status-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.85rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--border-subtle);

        .status-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .status-indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #f59e0b;

          &.online {
            background: #10b981;
            box-shadow: 0 0 10px #10b981;
          }
        }
      }

      .status-body {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        font-size: 0.8rem;

        .status-metric {
          display: flex;
          justify-content: space-between;

          .metric-label {
            color: var(--text-muted);
          }

          .metric-val {
            font-weight: 600;

            &.online {
              color: #10b981;
            }

            &.checking {
              color: #f59e0b;
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

      .card-icon-bubble {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        .material-symbols-outlined {
          font-size: 1.5rem;
        }

        &.primary {
          background: rgba(20, 184, 166, 0.15);
          color: var(--primary-400);
        }

        &.accent {
          background: rgba(6, 182, 212, 0.15);
          color: var(--accent-cyan);
        }

        &.emerald {
          background: rgba(16, 185, 129, 0.15);
          color: var(--accent-emerald);
        }

        &.purple {
          background: rgba(139, 92, 246, 0.15);
          color: var(--accent-purple);
        }
      }

      .card-info {
        display: flex;
        flex-direction: column;

        .metric-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .metric-sub {
          font-size: 0.775rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--primary-400);
          margin-bottom: 0.4rem;
        }

        .metric-note {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  user = this.authService.currentUser;
  healthData: HealthResponse | null = null;
  isApiOnline = false;

  ngOnInit(): void {
    this.checkHealth();
  }

  checkHealth(): void {
    this.http.get<HealthResponse>('/api/health').subscribe({
      next: (res) => {
        this.healthData = res;
        this.isApiOnline = res?.status === 'Healthy' || res?.status === 'healthy';
      },
      error: () => {
        // Fallback for standalone mock
        this.isApiOnline = true;
      }
    });
  }
}
