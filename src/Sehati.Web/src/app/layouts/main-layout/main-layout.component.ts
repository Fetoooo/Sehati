import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';

interface NavItem {
  labelKey: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout" [class.rtl]="langService.isRtl()">
      <!-- Mobile Sidebar Overlay Backdrop -->
      <div class="mobile-overlay" *ngIf="isMobileSidebarOpen()" (click)="closeMobileSidebar()"></div>

      <!-- Sidebar Navigation Drawer -->
      <aside class="app-sidebar" [class.mobile-open]="isMobileSidebarOpen()">
        <div class="sidebar-header">
          <div class="sidebar-brand">
            <img src="/sehati_logo.png" alt="Sehati Logo" class="sehati-logo-image" />
            <div class="brand-names">
              <span class="arabic">صِحّتي</span>
              <span class="latin">SEHATI</span>
            </div>
          </div>
          <!-- Close button on mobile -->
          <button class="mobile-close-btn" (click)="closeMobileSidebar()" type="button">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Current User Role & Unified ID Pill -->
        <div class="user-role-badge">
          <span class="role-pill">{{ userRole() || 'Healthcare' }}</span>
          <span class="unified-id" *ngIf="user()?.unifiedPatientId">{{ user()?.unifiedPatientId }}</span>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-title">
            {{ langService.isRtl() ? 'القائمة الرئيسية' : 'MAIN MENU' }}
          </div>
          <ul class="nav-list">
            <ng-container *ngFor="let item of navItems">
              <li *ngIf="isItemVisible(item)">
                <a
                  [routerLink]="item.route"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{exact: item.route === '/dashboard'}"
                  class="nav-link"
                  (click)="closeMobileSidebar()"
                >
                  <span class="material-symbols-outlined nav-icon">{{ item.icon }}</span>
                  <span class="nav-label">{{ langService.t(item.labelKey) }}</span>
                </a>
              </li>
            </ng-container>
          </ul>
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/preview" class="nav-link showcase-link" (click)="closeMobileSidebar()">
            <span class="material-symbols-outlined nav-icon">architecture</span>
            <span class="nav-label">{{ langService.t('architectureShowcase') }}</span>
          </a>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="app-main">
        <!-- Top App Bar -->
        <header class="app-header">
          <div class="header-left">
            <button class="mobile-menu-trigger" (click)="toggleMobileSidebar()" type="button" title="Toggle Menu">
              <span class="material-symbols-outlined">menu</span>
            </button>
            <h2 class="page-title">
              {{ langService.isRtl() ? 'المنظومة الصحية الموحدة' : 'Centralized Health Portal' }}
            </h2>
          </div>

          <div class="header-right">
            <!-- Theme Toggle Button -->
            <button
              class="header-btn theme-toggle-btn"
              (click)="themeService.toggleTheme()"
              [title]="themeService.isDark() ? langService.t('themeLight') : langService.t('themeDark')"
              type="button"
            >
              <span class="material-symbols-outlined">
                {{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}
              </span>
            </button>

            <!-- Language Toggle -->
            <button
              class="header-btn"
              (click)="langService.toggleLanguage()"
              [title]="langService.currentLang() === 'en' ? 'التحويل للعربية' : 'Switch to English'"
              type="button"
            >
              <span class="material-symbols-outlined">translate</span>
              <span class="lang-text">{{ langService.currentLang() === 'en' ? 'العربية' : 'English' }}</span>
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
              <button class="logout-btn" (click)="logout()" [title]="langService.t('logout')" type="button">
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
      background-color: var(--color-bg-app);
      position: relative;
    }

    /* Mobile Backdrop */
    .mobile-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(10, 77, 104, 0.4);
      backdrop-filter: blur(4px);
      z-index: 998;
    }

    /* Sidebar Navigation */
    .app-sidebar {
      width: 270px;
      display: flex;
      flex-direction: column;
      background: var(--color-surface-card);
      border-right: 1px solid var(--color-border-subtle);
      padding: 1.5rem 1rem;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      height: 100vh;
      box-shadow: var(--shadow-sm);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 999;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      padding: 0 0.5rem;
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;

      .brand-names {
        display: flex;
        flex-direction: column;

        .arabic {
          font-family: var(--font-arabic);
          font-weight: 800;
          font-size: 1.25rem;
          color: var(--color-primary-dark);
          line-height: 1.1;
        }

        .latin {
          font-size: 0.725rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: var(--color-primary-base);
        }
      }
    }

    .dark-theme .sidebar-brand .brand-names .arabic {
      color: var(--color-primary-accent);
    }

    .dark-theme .sidebar-brand .brand-names .latin {
      color: #94A3B8;
    }

    .mobile-close-btn {
      display: none;
      background: none;
      border: none;
      color: var(--color-text-muted);
      cursor: pointer;
      padding: 0.4rem;
      border-radius: 8px;

      &:hover {
        background: var(--color-surface-tint);
        color: var(--color-primary-base);
      }
    }

    .user-role-badge {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.65rem 0.85rem;
      background: var(--color-primary-surface);
      border: 1px solid rgba(8, 131, 149, 0.2);
      border-radius: var(--radius-md);
      margin-bottom: 1.5rem;

      .role-pill {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-primary-dark);
      }

      .unified-id {
        font-family: monospace;
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--color-primary-base);
      }
    }

    .dark-theme .user-role-badge {
      background: var(--color-surface-tint);
      border-color: rgba(5, 191, 219, 0.25);

      .role-pill {
        color: var(--color-primary-accent);
      }
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
    }

    .nav-section-title {
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--color-text-muted);
      margin-bottom: 0.65rem;
      padding-left: 0.65rem;
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
      gap: 0.85rem;
      padding: 0.75rem 0.85rem;
      border-radius: var(--radius-md);
      color: var(--color-text-muted);
      text-decoration: none;
      font-size: 0.925rem;
      font-weight: 600;
      transition: all 0.2s ease;

      .nav-icon {
        font-size: 1.3rem;
      }

      &:hover {
        background: var(--color-surface-hover);
        color: var(--color-primary-base);
      }

      &.active {
        background: linear-gradient(135deg, var(--color-primary-base) 0%, var(--color-primary-dark) 100%);
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(8, 131, 149, 0.3);

        .nav-icon {
          color: #ffffff;
        }
      }
    }

    .sidebar-footer {
      padding-top: 1rem;
      border-top: 1px solid var(--color-border-subtle);

      .showcase-link {
        color: var(--color-primary-base);
      }
    }

    /* Main Area */
    .app-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .app-header {
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      background: var(--color-surface-card);
      border-bottom: 1px solid var(--color-border-subtle);
      box-shadow: var(--shadow-sm);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;

      .mobile-menu-trigger {
        display: none;
        background: none;
        border: 1px solid var(--color-border-subtle);
        border-radius: 8px;
        color: var(--color-text-main);
        padding: 0.4rem;
        cursor: pointer;
      }

      .page-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--color-text-brand);
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .header-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.5rem 0.85rem;
      border-radius: var(--radius-pill);
      background: var(--color-surface-tint);
      border: 1px solid var(--color-border-subtle);
      color: var(--color-text-main);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--color-primary-base);
        color: var(--color-primary-base);
      }
    }

    .theme-toggle-btn {
      padding: 0.5rem;
      border-radius: 50%;
    }

    .user-profile-menu {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.35rem 0.65rem;
      border-radius: var(--radius-pill);
      background: var(--color-surface-tint);
      border: 1px solid var(--color-border-subtle);

      .avatar-circle {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--color-primary-base), var(--color-primary-dark));
        color: #ffffff;
        font-size: 0.825rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .user-meta {
        display: flex;
        flex-direction: column;
        line-height: 1.2;

        .user-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--color-text-main);
        }

        .user-role {
          font-size: 0.725rem;
          color: var(--color-text-muted);
        }
      }

      .logout-btn {
        background: none;
        border: none;
        color: var(--color-status-danger);
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 0.25rem;
        border-radius: 6px;

        &:hover {
          background: var(--color-status-danger-bg);
        }
      }
    }

    .page-content {
      padding: 2rem;
      flex: 1;
    }

    /* RTL specific adaptations */
    .app-layout.rtl {
      direction: rtl;

      .app-sidebar {
        border-right: none;
        border-left: 1px solid var(--color-border-subtle);
      }

      .nav-section-title {
        padding-left: 0;
        padding-right: 0.65rem;
      }
    }

    /* Responsive Breakdown */
    @media (max-width: 1024px) {
      .app-sidebar {
        position: fixed;
        left: -300px;
        top: 0;
        bottom: 0;
        transition: left 0.3s ease;
      }

      .app-layout.rtl .app-sidebar {
        left: auto;
        right: -300px;
        transition: right 0.3s ease;
      }

      .app-sidebar.mobile-open {
        left: 0;
      }

      .app-layout.rtl .app-sidebar.mobile-open {
        right: 0;
      }

      .mobile-overlay {
        display: block;
      }

      .mobile-close-btn {
        display: block;
      }

      .header-left .mobile-menu-trigger {
        display: flex;
      }

      .app-header {
        padding: 0 1.25rem;
      }

      .page-content {
        padding: 1.25rem;
      }
    }

    @media (max-width: 640px) {
      .user-meta {
        display: none;
      }

      .header-btn .lang-text {
        display: none;
      }

      .header-left .page-title {
        font-size: 1rem;
      }
    }
  `]
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  public themeService = inject(ThemeService);
  public langService = inject(LanguageService);

  public user = this.authService.currentUser;
  public userRole = this.authService.userRole;

  public isMobileSidebarOpen = signal<boolean>(false);

  public navItems: NavItem[] = [
    { labelKey: 'dashboard', icon: 'dashboard', route: '/dashboard' },
    { labelKey: 'myMedicalPassport', icon: 'medical_information', route: '/dashboard', roles: ['Patient'] },
    { labelKey: 'appointments', icon: 'calendar_month', route: '/dashboard' },
    { labelKey: 'prescriptions', icon: 'prescriptions', route: '/dashboard', roles: ['Patient', 'Doctor'] },
    { labelKey: 'consentEngine', icon: 'shield_lock', route: '/dashboard', roles: ['Patient'] },
    { labelKey: 'emergencyProfile', icon: 'emergency', route: '/dashboard', roles: ['Patient'] },
    { labelKey: 'doctorWorkspace', icon: 'stethoscope', route: '/dashboard', roles: ['Doctor'] },
    { labelKey: 'patientQueue', icon: 'reduce_capacity', route: '/dashboard', roles: ['Doctor', 'Receptionist', 'ClinicAdmin'] },
    { labelKey: 'clinicManagement', icon: 'domain', route: '/dashboard', roles: ['ClinicAdmin'] },
    { labelKey: 'auditLog', icon: 'security', route: '/dashboard', roles: ['SystemAdmin'] }
  ];

  public userInitials = computed(() => {
    const name = this.user()?.fullName;
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  });

  public isItemVisible(item: NavItem): boolean {
    if (!item.roles || item.roles.length === 0) return true;
    const currentRole = this.userRole();
    if (!currentRole) return true;
    return item.roles.includes(currentRole);
  }

  public toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update((open) => !open);
  }

  public closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }

  public logout(): void {
    this.authService.logout();
  }
}
