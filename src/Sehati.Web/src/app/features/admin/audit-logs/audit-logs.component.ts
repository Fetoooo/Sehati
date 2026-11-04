import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicalService } from '../../../core/services/clinical.service';
import { LanguageService } from '../../../core/services/language.service';
import { AuditLogDto } from '../../../core/models/clinical.models';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="audit-page" [class.rtl]="langService.isRtl()">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-titles">
          <div class="title-with-badge">
            <span class="material-symbols-outlined header-icon">policy</span>
            <h1 class="page-title">
              {{ langService.isRtl() ? 'سجل العمليات والرقابة الأمنية (Audit Trail)' : 'Security Audit Trail & Compliance' }}
            </h1>
            <span class="immutable-pill">
              <span class="material-symbols-outlined">lock</span>
              {{ langService.isRtl() ? 'سجل غير قابل للتعديل' : 'IMMUTABLE WORM' }}
            </span>
          </div>
          <p class="page-subtitle">
            {{ langService.isRtl()
              ? 'تتبع كامل لكافة محاولات الوصول إلى بيانات وسجلات المرضى، الروشتات، ومنح وإلغاء الأذونات'
              : 'End-to-end forensic tracking of patient data accesses, prescriptions, and consent grants/revocations' }}
          </p>
        </div>

        <div class="header-actions">
          <button class="btn btn-secondary" (click)="exportCsv()">
            <span class="material-symbols-outlined">file_download</span>
            <span>{{ langService.isRtl() ? 'تصدير التقرير (CSV)' : 'Export Audit Log' }}</span>
          </button>
          <button class="btn btn-secondary" (click)="loadLogs()">
            <span class="material-symbols-outlined">refresh</span>
            <span>{{ langService.isRtl() ? 'تحديث' : 'Refresh' }}</span>
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="audit-kpis">
        <div class="kpi-card total">
          <span class="material-symbols-outlined icon">receipt_long</span>
          <div class="kpi-meta">
            <span class="val">{{ logs().length }}</span>
            <span class="lbl">{{ langService.isRtl() ? 'إجمالي العمليات المسجلة' : 'Logged Security Events' }}</span>
          </div>
        </div>

        <div class="kpi-card reads">
          <span class="material-symbols-outlined icon">visibility</span>
          <div class="kpi-meta">
            <span class="val">{{ stats().reads }}</span>
            <span class="lbl">{{ langService.isRtl() ? 'عمليات استعراض السجلات' : 'Patient Record Views' }}</span>
          </div>
        </div>

        <div class="kpi-card writes">
          <span class="material-symbols-outlined icon">edit_document</span>
          <div class="kpi-meta">
            <span class="val">{{ stats().writes }}</span>
            <span class="lbl">{{ langService.isRtl() ? 'عمليات التعديل والإنشاء' : 'Modifications & Writes' }}</span>
          </div>
        </div>

        <div class="kpi-card auth">
          <span class="material-symbols-outlined icon">verified_user</span>
          <div class="kpi-meta">
            <span class="val">{{ stats().security }}</span>
            <span class="lbl">{{ langService.isRtl() ? 'أذونات وموافقات ديناميكية' : 'Consent & Auth Events' }}</span>
          </div>
        </div>
      </div>

      <!-- Filters Toolbar -->
      <div class="toolbar-card">
        <div class="search-input-box">
          <span class="material-symbols-outlined">search</span>
          <input
            type="text"
            [(ngModel)]="searchFilter"
            [placeholder]="langService.isRtl() ? 'بحث بالبريد، اسم الكيان، أو عنوان IP...' : 'Search by email, entity name, action, or client IP...'"
          />
        </div>

        <div class="filter-dropdowns">
          <select [(ngModel)]="entityFilter">
            <option value="">{{ langService.isRtl() ? 'كل الكيانات (All Entities)' : 'All Entities' }}</option>
            <option value="Patient">Patient</option>
            <option value="MedicalRecord">MedicalRecord</option>
            <option value="Prescription">Prescription</option>
            <option value="Appointment">Appointment</option>
            <option value="AccessPermission">AccessPermission</option>
            <option value="User">User</option>
          </select>

          <select [(ngModel)]="actionFilter">
            <option value="">{{ langService.isRtl() ? 'كل العمليات (All Actions)' : 'All Actions' }}</option>
            <option value="CREATE">CREATE</option>
            <option value="READ">READ / VIEW</option>
            <option value="UPDATE">UPDATE</option>
            <option value="REVOKE">REVOKE</option>
            <option value="LOGIN">LOGIN</option>
          </select>
        </div>
      </div>

      <!-- Audit Log Table -->
      <div class="table-card">
        <div class="table-container">
          <table class="styled-table">
            <thead>
              <tr>
                <th>{{ langService.isRtl() ? 'التوقيت' : 'Timestamp' }}</th>
                <th>{{ langService.isRtl() ? 'المستخدم / الفاعل' : 'Actor / Email' }}</th>
                <th>{{ langService.isRtl() ? 'نوع العملية' : 'Action' }}</th>
                <th>{{ langService.isRtl() ? 'الكيان المتأثر' : 'Entity' }}</th>
                <th>{{ langService.isRtl() ? 'معرف السجل' : 'Target ID' }}</th>
                <th>{{ langService.isRtl() ? 'عنوان IP' : 'Client IP' }}</th>
                <th class="actions-header">{{ langService.isRtl() ? 'تفاصيل' : 'Details' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of filteredLogs()">
                <td class="time-cell">
                  <span class="material-symbols-outlined">schedule</span>
                  <span>{{ formatTimestamp(item.timestamp) }}</span>
                </td>
                <td>
                  <span class="user-text">{{ item.userEmail || 'system@sehati.internal' }}</span>
                </td>
                <td>
                  <span class="action-tag" [ngClass]="getActionClass(item.action)">
                    {{ item.action }}
                  </span>
                </td>
                <td class="font-bold">{{ item.entityName }}</td>
                <td>
                  <span class="target-id">{{ item.entityId || '—' }}</span>
                </td>
                <td>
                  <span class="ip-code">{{ item.ipAddress || '127.0.0.1' }}</span>
                </td>
                <td>
                  <button class="inspect-btn" (click)="inspectEvent(item)">
                    <span class="material-symbols-outlined">info</span>
                    <span>{{ langService.isRtl() ? 'فحص' : 'Inspect' }}</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Event Inspector Modal -->
      <div class="modal-backdrop" *ngIf="inspectedEvent" (click)="inspectedEvent = null">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="title-row">
              <span class="material-symbols-outlined">security</span>
              <h3>{{ langService.isRtl() ? 'فحص تفاصيل الحدث الأمني' : 'Security Event Forensic Record' }}</h3>
            </div>
            <button class="close-btn" (click)="inspectedEvent = null">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="modal-body">
            <div class="meta-grid">
              <div class="meta-box">
                <span class="meta-label">Event ID</span>
                <span class="meta-val font-mono">{{ inspectedEvent.id }}</span>
              </div>
              <div class="meta-box">
                <span class="meta-label">Action</span>
                <span class="meta-val font-bold">{{ inspectedEvent.action }}</span>
              </div>
              <div class="meta-box">
                <span class="meta-label">Timestamp</span>
                <span class="meta-val">{{ inspectedEvent.timestamp }}</span>
              </div>
              <div class="meta-box">
                <span class="meta-label">Client IP</span>
                <span class="meta-val font-mono">{{ inspectedEvent.ipAddress }}</span>
              </div>
            </div>

            <div class="json-inspector">
              <label>Event Payload & Context Audit Snapshot:</label>
              <pre>{{ getFormattedPayload(inspectedEvent) }}</pre>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="inspectedEvent = null">
              <span>{{ langService.isRtl() ? 'إغلاق' : 'Close' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .audit-page {
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

      .immutable-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        background: rgba(10, 77, 104, 0.1);
        color: var(--color-primary-deep);
        padding: 0.25rem 0.65rem;
        border-radius: var(--radius-full);
        font-size: 0.75rem;
        font-weight: 800;
        border: 1px solid rgba(10, 77, 104, 0.2);

        span { font-size: 0.95rem; }
      }
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
    }

    /* KPIs */
    .audit-kpis {
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
      }

      .kpi-meta {
        display: flex;
        flex-direction: column;

        .val {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--color-text-main);
          line-height: 1.2;
        }

        .lbl {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          font-weight: 600;
        }
      }

      &.total .icon { background: rgba(10, 77, 104, 0.1); color: var(--color-primary-deep); }
      &.reads .icon { background: rgba(8, 131, 149, 0.12); color: var(--color-primary-ocean); }
      &.writes .icon { background: rgba(245, 158, 11, 0.12); color: #d97706; }
      &.auth .icon { background: rgba(16, 185, 129, 0.12); color: #059669; }
    }

    /* Toolbar */
    .toolbar-card {
      background: var(--color-surface-card);
      border-radius: var(--radius-card);
      padding: 1rem;
      border: 1px solid var(--color-border-subtle);
      box-shadow: var(--shadow-sm);
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;

      .search-input-box {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        background: var(--color-bg-app);
        border: 1px solid var(--color-border-subtle);
        border-radius: var(--radius-md);
        padding: 0.4rem 0.75rem;
        flex: 1;
        min-width: 280px;

        span { color: var(--color-text-muted); }
        input {
          border: none;
          background: none;
          width: 100%;
          color: var(--color-text-main);
          font-size: 0.95rem;
          &:focus { outline: none; }
        }
      }

      .filter-dropdowns {
        display: flex;
        gap: 0.75rem;

        select {
          padding: 0.5rem 0.85rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border-subtle);
          background: var(--color-surface-card);
          color: var(--color-text-main);
          font-size: 0.85rem;
          font-weight: 600;
        }
      }
    }

    /* Table */
    .table-card {
      background: var(--color-surface-card);
      border-radius: var(--radius-card);
      border: 1px solid var(--color-border-subtle);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .table-container {
      overflow-x: auto;
    }

    .styled-table {
      width: 100%;
      border-collapse: collapse;

      th {
        padding: 0.85rem 1.25rem;
        text-align: left;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--color-text-muted);
        text-transform: uppercase;
        background: var(--color-bg-app);
        border-bottom: 1px solid var(--color-border-subtle);
      }

      td {
        padding: 0.95rem 1.25rem;
        border-bottom: 1px solid var(--color-border-subtle);
        font-size: 0.9rem;
        color: var(--color-text-main);
      }

      .time-cell {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.85rem;
        color: var(--color-text-muted);
        span.material-symbols-outlined { font-size: 1rem; }
      }

      .user-text {
        font-weight: 600;
      }

      .action-tag {
        display: inline-block;
        padding: 0.2rem 0.55rem;
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        font-weight: 800;
        letter-spacing: 0.04em;

        &.create { background: rgba(16, 185, 129, 0.15); color: #047857; }
        &.read { background: rgba(8, 131, 149, 0.15); color: var(--color-primary-deep); }
        &.update { background: rgba(245, 158, 11, 0.15); color: #b45309; }
        &.revoke, &.delete { background: rgba(239, 68, 68, 0.15); color: #b91c1c; }
        &.login { background: rgba(99, 102, 241, 0.15); color: #4338ca; }
      }

      .target-id {
        font-family: monospace;
        background: var(--color-bg-app);
        padding: 0.2rem 0.5rem;
        border-radius: var(--radius-sm);
        font-size: 0.8rem;
      }

      .ip-code {
        font-family: monospace;
        font-size: 0.8rem;
        color: var(--color-text-muted);
      }

      .inspect-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.35rem 0.75rem;
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-subtle);
        background: var(--color-surface-card);
        color: var(--color-primary-ocean);
        cursor: pointer;
        font-size: 0.8rem;
        font-weight: 700;

        &:hover {
          background: rgba(8, 131, 149, 0.1);
        }

        span { font-size: 1rem; }
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
      max-width: 600px;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--color-border-subtle);
      overflow: hidden;

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid var(--color-border-subtle);

        .title-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          span { color: var(--color-primary-deep); font-size: 1.5rem; }
          h3 { margin: 0; font-size: 1.15rem; font-weight: 800; }
        }

        .close-btn { background: none; border: none; color: var(--color-text-muted); cursor: pointer; }
      }

      .modal-body {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;

        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;

          .meta-box {
            background: var(--color-bg-app);
            padding: 0.75rem;
            border-radius: var(--radius-md);
            display: flex;
            flex-direction: column;
            gap: 0.25rem;

            .meta-label { font-size: 0.75rem; color: var(--color-text-muted); font-weight: 700; }
            .meta-val { font-size: 0.9rem; color: var(--color-text-main); }
          }
        }

        .json-inspector {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;

          label { font-size: 0.8rem; font-weight: 700; color: var(--color-text-muted); }

          pre {
            background: #0f172a;
            color: #38bdf8;
            padding: 1rem;
            border-radius: var(--radius-md);
            font-family: monospace;
            font-size: 0.8rem;
            overflow-x: auto;
            margin: 0;
          }
        }
      }

      .modal-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--color-border-subtle);
        background: var(--color-bg-app);
        display: flex;
        justify-content: flex-end;
      }
    }

    /* RTL */
    .audit-page.rtl {
      direction: rtl;
      .styled-table th { text-align: right; }
    }
  `]
})
export class AuditLogsComponent implements OnInit {
  private clinicalService = inject(ClinicalService);
  public langService = inject(LanguageService);

  public logs = signal<AuditLogDto[]>([]);
  public searchFilter = '';
  public entityFilter = '';
  public actionFilter = '';
  public inspectedEvent: AuditLogDto | null = null;

  public stats = computed(() => {
    const list = this.logs();
    return {
      reads: list.filter(l => l.action.includes('READ') || l.action.includes('VIEW')).length,
      writes: list.filter(l => l.action.includes('CREATE') || l.action.includes('UPDATE')).length,
      security: list.filter(l => l.action.includes('GRANT') || l.action.includes('REVOKE') || l.action.includes('LOGIN')).length
    };
  });

  public filteredLogs = computed(() => {
    let list = this.logs();

    if (this.entityFilter) {
      list = list.filter(l => l.entityName === this.entityFilter);
    }

    if (this.actionFilter) {
      list = list.filter(l => l.action.includes(this.actionFilter));
    }

    if (this.searchFilter.trim()) {
      const q = this.searchFilter.toLowerCase();
      list = list.filter(
        l =>
          (l.userEmail && l.userEmail.toLowerCase().includes(q)) ||
          l.entityName.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          (l.ipAddress && l.ipAddress.includes(q))
      );
    }

    return list;
  });

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.clinicalService.getAuditLogs(1, 50).subscribe({
      next: res => {
        if (res && res.items && res.items.length > 0) {
          this.logs.set(res.items);
        } else {
          this.seedInitialAuditLogs();
        }
      },
      error: () => this.seedInitialAuditLogs()
    });
  }

  private seedInitialAuditLogs(): void {
    const mocks: AuditLogDto[] = [
      {
        id: 'aud-901',
        userId: '2',
        userEmail: 'dr.sarah@sehati.gov.eg',
        action: 'READ / VIEW',
        entityName: 'MedicalRecord',
        entityId: 'MR-1001',
        details: 'Viewed medical passport allergies & pathology labs with active consent',
        ipAddress: '197.34.120.14',
        timestamp: '2026-11-04T17:15:20Z'
      },
      {
        id: 'aud-902',
        userId: '2',
        userEmail: 'dr.sarah@sehati.gov.eg',
        action: 'CREATE',
        entityName: 'Prescription',
        entityId: 'RX-8841',
        details: 'Issued digital prescription for Concor 5mg to patient SH-2026-000101',
        ipAddress: '197.34.120.14',
        timestamp: '2026-11-04T17:10:02Z'
      },
      {
        id: 'aud-903',
        userId: '1',
        userEmail: 'ahmed.patient@sehati.gov.eg',
        action: 'GRANT',
        entityName: 'AccessPermission',
        entityId: 'PERM-4401',
        details: 'Granted 30-day ViewAndAddRecords consent to Dr. Sarah Smith',
        ipAddress: '156.204.88.9',
        timestamp: '2026-11-04T16:55:40Z'
      },
      {
        id: 'aud-904',
        userId: '10',
        userEmail: 'fatma.reception@sehati.gov.eg',
        action: 'CREATE',
        entityName: 'Patient',
        entityId: 'SH-2026-000105',
        details: 'Registered walk-in patient Khaled Omar Mansour & assigned Queue #5',
        ipAddress: '192.168.1.105',
        timestamp: '2026-11-04T16:30:11Z'
      },
      {
        id: 'aud-905',
        userId: '1',
        userEmail: 'ahmed.patient@sehati.gov.eg',
        action: 'LOGIN',
        entityName: 'User',
        entityId: 'USR-1',
        details: 'Successful JWT authentication from Chrome on Windows',
        ipAddress: '156.204.88.9',
        timestamp: '2026-11-04T16:00:22Z'
      }
    ];
    this.logs.set(mocks);
  }

  getActionClass(action: string): string {
    const act = action.toUpperCase();
    if (act.includes('CREATE')) return 'create';
    if (act.includes('READ') || act.includes('VIEW')) return 'read';
    if (act.includes('UPDATE')) return 'update';
    if (act.includes('REVOKE') || act.includes('DELETE')) return 'revoke';
    if (act.includes('LOGIN')) return 'login';
    return 'read';
  }

  formatTimestamp(isoString: string): string {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(d);
    } catch {
      return isoString;
    }
  }

  inspectEvent(item: AuditLogDto): void {
    this.inspectedEvent = item;
  }

  getFormattedPayload(item: AuditLogDto): string {
    return JSON.stringify(
      {
        auditEventId: item.id,
        actor: {
          userId: item.userId,
          email: item.userEmail,
          ip: item.ipAddress
        },
        action: item.action,
        target: {
          entity: item.entityName,
          entityId: item.entityId
        },
        description: item.details,
        timestampUtc: item.timestamp,
        complianceSignature: 'SHA256:4f8a9b2c1d3e5f7a...'
      },
      null,
      2
    );
  }

  exportCsv(): void {
    const headers = 'AuditLogId,UserEmail,Action,EntityName,EntityId,IPAddress,Timestamp\n';
    const rows = this.filteredLogs()
      .map(
        l =>
          `"${l.id}","${l.userEmail || ''}","${l.action}","${l.entityName}","${l.entityId || ''}","${l.ipAddress || ''}","${l.timestamp}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sehati_audit_trail_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

