import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="auth-split-layout" [class.rtl]="langService.isRtl()">
      <!-- Left Visual & Brand Presentation Panel -->
      <aside class="auth-hero-panel">
        <div class="hero-panel-decorations">
          <div class="circle-glow orb-1"></div>
          <div class="circle-glow orb-2"></div>
        </div>

        <!-- Back to Landing Home button -->
        <div class="top-nav-bar">
          <a routerLink="/" class="back-home-pill">
            <span class="material-symbols-outlined flip-rtl">arrow_back</span>
            <span>{{ langService.isRtl() ? 'العودة إلى الصفحة الرئيسية' : 'Back to Home' }}</span>
          </a>
        </div>

        <div class="hero-panel-content">
          <div class="brand-showcase">
            <div class="logo-wrapper">
              <img src="/sehati_logo.png" alt="Sehati Logo" class="brand-logo" />
            </div>
            <div class="brand-title-group">
              <span class="brand-ar">صِحّتي</span>
              <span class="brand-en">SEHATI PLATFORM</span>
            </div>
          </div>

          <h2 class="hero-motto">
            {{ langService.isRtl() ? 'مريض واحد، سجل طبي موحد، رعاية صحية أفضل.' : 'One Patient, One Medical History, Better Healthcare.' }}
          </h2>

          <p class="hero-description">
            {{ langService.isRtl() 
              ? 'المنظومة الوطنية الموحدة لربط السجلات الطبية والعيادات والمستشفيات وطوارئ الإسعاف بكود صحي مركزي وأعلى معايير الخصوصية.' 
              : 'The national centralized digital infrastructure linking citizen health passports, polyclinics, certified prescriptions, and emergency dispatch.' }}
          </p>

          <!-- Floating Simulation Card -->
          <div class="preview-mini-passport">
            <div class="passport-mini-head">
              <span class="passport-flag">🇪🇬 EGYPT</span>
              <span class="passport-code">SH-2026-000101</span>
            </div>
            <div class="passport-mini-body">
              <div class="patient-line">
                <strong>Ahmed Mahmoud Hassan</strong>
                <span class="blood-dot">A+</span>
              </div>
              <div class="meta-line">
                <span>Verified Citizen Health Profile</span>
                <span class="verified-icon material-symbols-outlined">verified</span>
              </div>
            </div>
          </div>

          <!-- Trust Badges -->
          <div class="hero-trust-list">
            <div class="trust-pill">
              <span class="material-symbols-outlined">lock</span>
              <span>256-Bit Encrypted</span>
            </div>
            <div class="trust-pill">
              <span class="material-symbols-outlined">shield</span>
              <span>Zero-Trust Consent</span>
            </div>
            <div class="trust-pill">
              <span class="material-symbols-outlined">qr_code</span>
              <span>Instant ER Access</span>
            </div>
          </div>
        </div>

        <div class="hero-panel-footer">
          <span>© 2026 Sehati Smart Healthcare Platform</span>
        </div>
      </aside>

      <!-- Right Form Container Panel -->
      <main class="auth-form-panel">
        <header class="form-panel-header">
          <!-- Mobile Brand Logo only visible on small screens -->
          <a routerLink="/" class="mobile-brand">
            <img src="/sehati_logo.png" alt="Sehati Logo" class="mobile-logo-img" />
            <span class="mobile-brand-title">صِحّتي</span>
          </a>

          <div class="panel-controls">
            <!-- Theme Toggle -->
            <button
              class="control-btn"
              (click)="themeService.toggleTheme()"
              [title]="themeService.isDark() ? langService.t('themeLight') : langService.t('themeDark')"
              type="button"
            >
              <span class="material-symbols-outlined">
                {{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}
              </span>
            </button>

            <!-- Language Switcher -->
            <button
              class="control-btn lang-btn"
              (click)="langService.toggleLanguage()"
              type="button"
            >
              <span class="material-symbols-outlined">translate</span>
              <span>{{ langService.currentLang() === 'en' ? 'العربية' : 'English' }}</span>
            </button>
          </div>
        </header>

        <!-- Route Content Outlet (Login / Register) -->
        <div class="form-scrollable-area">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .auth-split-layout {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1fr 1.15fr;
      background: var(--color-bg-app);
      font-family: var(--font-primary);
    }

    .auth-split-layout.rtl {
      direction: rtl;
      font-family: var(--font-arabic);

      .flip-rtl {
        transform: rotate(180deg);
      }
    }

    /* LEFT HERO PANEL */
    .auth-hero-panel {
      position: relative;
      background: linear-gradient(145deg, #0a4d68 0%, #088395 60%, #05bfdb 100%);
      color: #fff;
      padding: 3rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;

      .hero-panel-decorations {
        position: absolute;
        inset: 0;
        pointer-events: none;

        .circle-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(50px);
          opacity: 0.35;
        }

        .orb-1 {
          width: 350px;
          height: 350px;
          background: #05bfdb;
          top: -80px;
          right: -80px;
        }

        .orb-2 {
          width: 300px;
          height: 300px;
          background: #0a4d68;
          bottom: -50px;
          left: -50px;
        }
      }
    }

    .top-nav-bar {
      position: relative;
      z-index: 2;

      .back-home-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.25);
        color: #fff;
        text-decoration: none;
        padding: 0.45rem 1rem;
        border-radius: var(--radius-full);
        font-size: 0.85rem;
        font-weight: 700;
        backdrop-filter: blur(8px);
        transition: all 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-1px);
        }

        span.material-symbols-outlined { font-size: 1.1rem; }
      }
    }

    .hero-panel-content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 480px;
      margin: auto 0;

      .brand-showcase {
        display: flex;
        align-items: center;
        gap: 1rem;

        .logo-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #fff;
          padding: 6px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;

          .brand-logo {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        }

        .brand-title-group {
          display: flex;
          flex-direction: column;

          .brand-ar {
            font-size: 1.5rem;
            font-weight: 900;
            line-height: 1.1;
          }

          .brand-en {
            font-size: 0.75rem;
            letter-spacing: 0.15em;
            opacity: 0.9;
            font-weight: 700;
          }
        }
      }

      .hero-motto {
        font-size: 1.9rem;
        font-weight: 900;
        line-height: 1.25;
        margin: 0;
        letter-spacing: -0.01em;
      }

      .hero-description {
        font-size: 1rem;
        line-height: 1.6;
        opacity: 0.9;
        margin: 0;
      }
    }

    .preview-mini-passport {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: var(--radius-card);
      padding: 1.25rem;
      backdrop-filter: blur(12px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .passport-mini-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.75rem;
        font-weight: 800;

        .passport-flag {
          background: rgba(0,0,0,0.2);
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-sm);
        }

        .passport-code {
          font-family: monospace;
          color: #a5f3fc;
          letter-spacing: 0.08em;
        }
      }

      .passport-mini-body {
        .patient-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 1.05rem;
          font-weight: 800;

          .blood-dot {
            background: #ef4444;
            color: #fff;
            font-size: 0.75rem;
            padding: 0.15rem 0.45rem;
            border-radius: var(--radius-full);
          }
        }

        .meta-line {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          opacity: 0.85;
          margin-top: 0.25rem;

          .verified-icon {
            font-size: 0.95rem;
            color: #6ee7b7;
          }
        }
      }
    }

    .hero-trust-list {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;

      .trust-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        background: rgba(0,0,0,0.15);
        padding: 0.3rem 0.75rem;
        border-radius: var(--radius-full);
        font-size: 0.75rem;
        font-weight: 700;

        span.material-symbols-outlined { font-size: 0.95rem; }
      }
    }

    .hero-panel-footer {
      position: relative;
      z-index: 2;
      font-size: 0.8rem;
      opacity: 0.75;
    }

    /* RIGHT FORM PANEL */
    .auth-form-panel {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow-y: auto;
      background: var(--color-bg-app);
    }

    .form-panel-header {
      padding: 1.5rem 2.5rem 0.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .mobile-brand {
        display: none;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;

        .mobile-logo-img {
          width: 36px;
          height: 36px;
        }

        .mobile-brand-title {
          font-size: 1.25rem;
          font-weight: 900;
          color: var(--color-primary-deep);
        }
      }

      .panel-controls {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        margin-left: auto;

        .control-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid var(--color-border-subtle);
          background: var(--color-surface-card);
          color: var(--color-text-main);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: var(--color-surface-subtle);
          }

          &.lang-btn {
            width: auto;
            border-radius: var(--radius-full);
            padding: 0.4rem 0.85rem;
            display: inline-flex;
            gap: 0.35rem;
            font-size: 0.85rem;
            font-weight: 700;

            span.material-symbols-outlined { font-size: 1.05rem; }
          }
        }
      }
    }

    .auth-split-layout.rtl .form-panel-header .panel-controls {
      margin-left: 0;
      margin-right: auto;
    }

    .form-scrollable-area {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem 2.5rem 3rem;
    }

    /* RESPONSIVE */
    @media (max-width: 992px) {
      .auth-split-layout {
        grid-template-columns: 1fr;
      }

      .auth-hero-panel {
        display: none;
      }

      .auth-form-panel {
        height: auto;
        min-height: 100vh;
      }

      .form-panel-header .mobile-brand {
        display: flex;
      }

      .form-scrollable-area {
        padding: 1.5rem 1.25rem 3rem;
      }
    }
  `]
})
export class AuthLayoutComponent {
  public themeService = inject(ThemeService);
  public langService = inject(LanguageService);
}
