import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  labelAr: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout" [class.rtl]="currentLang === 'ar'">
      <!-- Sidebar Navigation -->
      <aside class="app-sidebar glass-panel">
        <div class="sidebar-brand">
          <div class="brand-logo-mark">
            <span class="material-symbols-outlined logo-icon">vital_signs</span>
          </div>
          <div class="brand-names">
            <span class="arabic">صِحّتي</span>
            <span class="latin">SEHATI</span>
          </div>
        </div>

        <!-- Current User Role Chip -->
        <div class="user-role-badge">
          <span class="role-pill">{{ userRole() || 'Healthcare' }}</span>
          <span class="unified-id" *ngIf="user()?.unifiedPatientId">{{ user()?.unifiedPatientId }}</span>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-title">
            {{ currentLang === 'en' ? 'MAIN MENU' : 'القائمة الرئيسية' }}
          </div>
          <ul class="nav-list">
            <ng-container *ngFor="let item of navItems">
              <li *ngIf="isItemVisible(item)">
                <a [routerLink]="item.route" routerLinkActive="active" [routerLinkActiveOptions]="{exact: item.route === '/dashboard'}" class="nav-link">
                  <span class="material-symbols-outlined nav-icon">{{ item.icon }}</span>
                  <span class="nav-label">{{ currentLang === 'en' ? item.label : item.labelAr }}</span>
                </a>
              </li>
            </ng-container>
          </ul>
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/preview" class="nav-link showcase-link">
            <span class="material-symbols-outlined nav-icon">architecture</span>
            <span class="nav-label">{{ currentLang === 'en' ? 'Architecture View' : 'عرض الهيكلية' }}</span>
          </a>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="app-main">
        <!-- Top App Bar -->
        <header class="app-header glass-panel">
          <div class="header-left">
            <h2 class="page-title">
              {{ currentLang === 'en' ? 'Centralized Health Portal' : 'البوابة الصحية الموحدة' }}
            </h2>
          </div>

          <div class="header-right">
            <!-- Language Toggle -->
            <button class="header-btn" (click)="toggleLanguage()" [title]="currentLang === 'en' ? 'Switch to Arabic' : 'التحويل للإنجليزية'">
              <span class="material-symbols-outlined">translate</span>
              <span>{{ currentLang === 'en' ? 'العربية' : 'English' }}</span>
            </button>

            <!-- User Menu -->
            <div class="user-profile-menu">
              <div class="avatar-circle">
                {{ userInitials() }}
              </div>
              <div class="user-meta">
                <span class="user-name">{{ user()?.fullName || 'User' }}</span>
                <span class="user-role">{{ userRole() }}</span>
              </div>
              <button class="logout-btn" (click)="logout()" title="Logout">
                <span class="material-symbols-outlined">logout</span>
              </button>
            </div>
          </div>
        </header>

        <!-- Route Content Outlet -->
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-canvas);
    }

    .app-sidebar {
      width: 260px;
      display: flex;
      flex-direction: column;
      border-radius: 0;
      border-right: 1px solid var(--border-subtle);
      border-top: none;
      border-bottom: none;
      border-left: none;
      padding: 1.5rem 1rem;
      flex-shrink: 0;
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0 0.5rem 1rem;
    }

    .brand-logo-mark {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    .brand-names {
      display: flex;
      align-items: baseline;
      gap: 0.35rem;

      .arabic {
        font-family: var(--font-arabic);
        font-weight: 800;
        color: var(--primary-400);
      }

      .latin {
        font-weight: 800;
        letter-spacing: 0.1em;
        font-size: 0.95rem;
      }
    }

    .user-role-badge {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 0.4rem 0.75rem;
      margin: 0.5rem 0.5rem 1.25rem;

      .role-pill {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--primary-300);
        text-transform: uppercase;
      }

      .unified-id {
        font-size: 0.75rem;
        font-family: monospace;
        color: var(--text-secondary);
      }
    }

    .sidebar-nav {
      flex: 1;

      .nav-section-title {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: var(--text-muted);
        padding: 0 0.5rem 0.5rem;
      }

      .nav-list {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .nav-link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.65rem 0.85rem;
        border-radius: 10px;
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 0.925rem;
        font-weight: 500;
        transition: all 0.2s ease;

        .nav-icon {
          font-size: 1.25rem;
        }

        &:hover {
          background: rgba(20, 184, 166, 0.08);
          color: var(--primary-300);
        }

        &.active {
          background: linear-gradient(90deg, rgba(20, 184, 166, 0.2) 0%, rgba(20, 184, 166, 0.05) 100%);
          border-left: 3px solid var(--primary-400);
          color: var(--text-main);
          font-weight: 600;
        }
      }
    }

    .app-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }

    .app-header {
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      border-radius: 0;
      border-top: none;
      border-right: none;
      border-left: none;
      border-bottom: 1px solid var(--border-subtle);
      flex-shrink: 0;

      .page-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text-main);
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 1.25rem;
      }

      .header-btn {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        background: transparent;
        border: 1px solid var(--border-subtle);
        color: var(--text-secondary);
        border-radius: 8px;
        padding: 0.4rem 0.75rem;
        font-size: 0.85rem;
        cursor: pointer;

        &:hover {
          border-color: var(--primary-500);
          color: var(--primary-300);
        }
      }

      .user-profile-menu {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding-left: 1rem;
        border-left: 1px solid var(--border-subtle);

        .avatar-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--primary-600) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          color: #fff;
        }

        .user-meta {
          display: flex;
          flex-direction: column;

          .user-name {
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-main);
          }

          .user-role {
            font-size: 0.725rem;
            color: var(--text-muted);
          }
        }

        .logout-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0.35rem;
          border-radius: 6px;
          transition: all 0.2s ease;

          &:hover {
            color: var(--accent-rose);
            background: rgba(244, 63, 94, 0.1);
          }
        }
      }
    }

    .page-content {
      flex: 1;
      padding: 2rem;
    }

    .rtl {
      direction: rtl;

      .app-sidebar {
        border-right: none;
        border-left: 1px solid var(--border-subtle);
      }

      .sidebar-nav .nav-link.active {
        border-left: none;
        border-right: 3px solid var(--primary-400);
        background: linear-gradient(270deg, rgba(20, 184, 166, 0.2) 0%, rgba(20, 184, 166, 0.05) 100%);
      }

      .app-header .user-profile-menu {
        padding-left: 0;
        padding-right: 1rem;
        border-left: none;
        border-right: 1px solid var(--border-subtle);
      }
    }
  `]
})
export class MainLayoutComponent {
  private authService = inject(AuthService);

  currentLang: 'en' | 'ar' = 'en';

  user = this.authService.currentUser;
  userRole = this.authService.userRole;

  userInitials = computed(() => {
    const name = this.user()?.fullName || 'User';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  });

  navItems: NavItem[] = [
    { label: 'Dashboard', labelAr: 'لوحة التحكم', icon: 'dashboard', route: '/dashboard' },
    { label: 'Patients', labelAr: 'سجل المرضى', icon: 'personal_injury', route: '/patients', roles: ['Doctor', 'Receptionist', 'ClinicAdmin', 'SystemAdmin'] },
    { label: 'Appointments & Queue', labelAr: 'المواعيد وقائمة الانتظار', icon: 'calendar_month', route: '/appointments' },
    { label: 'Clinics & Facilities', labelAr: 'العيادات والمراكز', icon: 'domain', route: '/clinics' },
    { label: 'Doctors', labelAr: 'الأطباء', icon: 'stethoscope', route: '/doctors' },
    { label: 'Prescriptions', labelAr: 'الروشتات الإلكترونية', icon: 'prescriptions', route: '/prescriptions' },
    { label: 'Access & Consent', labelAr: 'صلاحيات الوصول', icon: 'lock_open', route: '/consent' }
  ];

  isItemVisible(item: NavItem): boolean {
    if (!item.roles || item.roles.length === 0) return true;
    const role = this.userRole();
    return !!role && item.roles.includes(role);
  }

  toggleLanguage(): void {
    this.currentLang = this.currentLang === 'en' ? 'ar' : 'en';
    document.documentElement.setAttribute('dir', this.currentLang === 'ar' ? 'rtl' : 'ltr');
  }

  logout(): void {
    this.authService.logout();
  }
}
