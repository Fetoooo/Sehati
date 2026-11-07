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
    <div class="auth-viewport" [class.rtl]="langService.isRtl()">
      <!-- Background Ambient Lighting -->
      <div class="ambient-glow glow-top-left"></div>
      <div class="ambient-glow glow-bottom-right"></div>

      <!-- Top Header Navigation -->
      <header class="auth-header">
        <div class="header-inner">
          <!-- Brand -->
          <a routerLink="/" class="brand-link">
            <div class="brand-logo-frame">
              <img src="/sehati_logo.png" alt="Sehati Logo" class="brand-logo" />
            </div>
            <div class="brand-text">
              <span class="brand-ar">صِحّتي</span>
              <span class="brand-en">SEHATI</span>
            </div>
          </a>

          <!-- Controls: Home Link, Theme, Language -->
          <div class="header-controls">
            <a routerLink="/" class="btn-return-home">
              <span class="material-symbols-outlined flip-rtl">arrow_back</span>
              <span>{{ langService.isRtl() ? 'العودة إلى الرئيسية' : 'Back to Home' }}</span>
            </a>

            <button
              type="button"
              class="icon-btn"
              (click)="themeService.toggleTheme()"
              [title]="themeService.isDark() ? (langService.isRtl() ? 'الوضع النهاري' : 'Light Mode') : (langService.isRtl() ? 'الوضع الليلي' : 'Dark Mode')"
            >
              <span class="material-symbols-outlined">
                {{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}
              </span>
            </button>

            <button
              type="button"
              class="lang-pill"
              (click)="langService.toggleLanguage()"
            >
              <span class="material-symbols-outlined">translate</span>
              <span>{{ langService.currentLang() === 'en' ? 'العربية' : 'EN' }}</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Split Layout Container -->
      <div class="auth-layout-container">
        <!-- Visual Presentation Side Panel (Desktop only) -->
        <aside class="auth-visual-side">
          <div class="visual-panel-card">
            <!-- Holographic Badge -->
            <div class="visual-badge">
              <span class="flag">🇪🇬</span>
              <span>{{ langService.isRtl() ? 'المنظومة الوطنية الموحدة للسجلات الصحية' : 'National Digital Health Infrastructure' }}</span>
            </div>

            <h2 class="visual-motto">
              {{ langService.isRtl() ? 'مريض واحد، سجل طبي موحد، رعاية صحية أفضل.' : 'One Patient, One Record, Better Healthcare.' }}
            </h2>

            <p class="visual-desc">
              {{ langService.isRtl()
                ? 'منصة صحتي توحد تاريخك العلاجي، روشتاتك، وتحاليلك في مكان آمن واحد تحت تحكمك الكامل.'
                : 'Sehati synchronizes your lifelong clinical encounters, certified e-prescriptions, and diagnostic labs under zero-trust patient governance.' }}
            </p>

            <!-- Mini Holographic Health Passport Preview -->
            <div class="mini-passport-preview">
              <div class="p-top">
                <span class="p-flag">🇪🇬 EGYPT</span>
                <span class="p-id font-mono">SH-2026-000101</span>
              </div>
              <div class="p-body">
                <div class="p-name-row">
                  <strong>Ahmed Mahmoud Hassan</strong>
                  <span class="blood-tag">A+</span>
                </div>
                <div class="p-status-row">
                  <span class="material-symbols-outlined">verified</span>
                  <span>{{ langService.isRtl() ? 'جواز صحي موثق ونشط' : 'Verified Health Passport' }}</span>
                </div>
              </div>
            </div>

            <!-- 3 Security Pillars -->
            <div class="security-pillars-list">
              <div class="pillar-item">
                <span class="material-symbols-outlined">lock</span>
                <span>{{ langService.isRtl() ? 'تشفير سريري AES-256' : 'AES-256 Clinical Encryption' }}</span>
              </div>
              <div class="pillar-item">
                <span class="material-symbols-outlined">shield</span>
                <span>{{ langService.isRtl() ? 'تحكم كامل بأذونات الأطباء' : 'Patient Zero-Trust Consent' }}</span>
              </div>
              <div class="pillar-item">
                <span class="material-symbols-outlined">emergency</span>
                <span>{{ langService.isRtl() ? 'استجابة طوارئ في < 2 ثانية' : 'Emergency Triage in < 2s' }}</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- Dynamic Form Outlet Area -->
        <main class="auth-form-side">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Minimal Auth Footer -->
      <footer class="auth-minimal-footer">
        <div class="footer-wrap">
          <span>© 2026 Sehati Smart Healthcare Platform • 🇪🇬 Arab Republic of Egypt</span>
          <div class="footer-badges">
            <span>HIPAA Compliant</span>
            <span>•</span>
            <span>AES-256 Encrypted</span>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .auth-viewport {
      position: relative;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--color-bg-app, #F8FAFC);
      color: var(--color-text-main, #0F172A);
      font-family: var(--font-latin, 'Plus Jakarta Sans', sans-serif);
      overflow-x: hidden;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    .auth-viewport.rtl {
      direction: rtl;
      font-family: var(--font-arabic, 'Cairo', sans-serif);

      .flip-rtl {
        transform: rotate(180deg);
      }
    }

    /* Ambient Lighting */
    .ambient-glow {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      filter: blur(120px);
      z-index: 0;
      opacity: 0.55;
    }

    .glow-top-left {
      top: -80px;
      left: 10%;
      width: 480px;
      height: 480px;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%);
    }

    .glow-bottom-right {
      bottom: -60px;
      right: 10%;
      width: 520px;
      height: 520px;
      background: radial-gradient(circle, rgba(8, 131, 149, 0.14) 0%, transparent 70%);
    }

    /* Top Header */
    .auth-header {
      position: relative;
      z-index: 10;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--color-border-subtle, #E2E8F0);
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(14px);
    }

    :host-context([data-theme="dark"]) .auth-header,
    :host-context(.dark-theme) .auth-header {
      background: rgba(8, 38, 53, 0.9);
      border-bottom-color: rgba(5, 191, 219, 0.14);
    }

    .header-inner {
      max-width: 1240px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: inherit;
    }

    .brand-logo-frame {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(8, 131, 149, 0.12), rgba(5, 191, 219, 0.22));
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(8, 131, 149, 0.2);
    }

    .brand-logo {
      width: 26px;
      height: 26px;
      object-fit: contain;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }

    .brand-ar {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--color-primary-dark, #0A4D68);
    }

    :host-context([data-theme="dark"]) .brand-ar,
    :host-context(.dark-theme) .brand-ar {
      color: #05BFDB;
    }

    .brand-en {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 2px;
      color: var(--color-text-muted, #64748B);
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .btn-return-home {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      background: var(--color-surface-card, #FFFFFF);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      color: var(--color-text-main, #0F172A);
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 700;
      transition: all 0.2s ease;
    }

    :host-context([data-theme="dark"]) .btn-return-home,
    :host-context(.dark-theme) .btn-return-home {
      background: #082635;
      border-color: rgba(5, 191, 219, 0.2);
    }

    .btn-return-home:hover {
      border-color: var(--color-primary-base, #088395);
      color: var(--color-primary-base, #088395);
      transform: translateY(-1px);
    }

    .icon-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      background: var(--color-surface-card, #FFFFFF);
      color: var(--color-text-main, #0F172A);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    :host-context([data-theme="dark"]) .icon-btn,
    :host-context(.dark-theme) .icon-btn {
      background: #082635;
      border-color: rgba(5, 191, 219, 0.2);
    }

    .icon-btn:hover {
      border-color: var(--color-primary-base, #088395);
      color: var(--color-primary-base, #088395);
    }

    .lang-pill {
      height: 38px;
      padding: 0 0.85rem;
      border-radius: 9999px;
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      background: var(--color-surface-card, #FFFFFF);
      color: var(--color-text-main, #0F172A);
      font-size: 0.85rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    :host-context([data-theme="dark"]) .lang-pill,
    :host-context(.dark-theme) .lang-pill {
      background: #082635;
      border-color: rgba(5, 191, 219, 0.2);
    }

    .lang-pill:hover {
      border-color: var(--color-primary-base, #088395);
      color: var(--color-primary-base, #088395);
    }

    /* Main Container */
    .auth-layout-container {
      flex: 1;
      max-width: 1240px;
      width: 100%;
      margin: 0 auto;
      padding: 3rem 1.5rem 4rem 1.5rem;
      display: grid;
      grid-template-columns: 1fr 1.25fr;
      align-items: center;
      gap: 3.5rem;
      position: relative;
      z-index: 2;
    }

    /* Left Visual Panel */
    .auth-visual-side {
      display: flex;
      flex-direction: column;
    }

    .visual-panel-card {
      background: linear-gradient(145deg, #0A4D68 0%, #088395 60%, #05BFDB 100%);
      border-radius: 32px;
      padding: 3rem 2.5rem;
      color: #FFFFFF;
      box-shadow: 0 20px 45px -10px rgba(8, 131, 149, 0.35);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .visual-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 9999px;
      padding: 0.35rem 0.95rem;
      font-size: 0.8rem;
      font-weight: 700;
      width: fit-content;
    }

    .visual-motto {
      font-size: 2.2rem;
      font-weight: 900;
      line-height: 1.25;
      margin: 0;
      letter-spacing: -0.5px;
    }

    .visual-desc {
      font-size: 1.05rem;
      line-height: 1.7;
      opacity: 0.92;
      margin: 0;
    }

    .mini-passport-preview {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 20px;
      padding: 1.25rem 1.5rem;
      backdrop-filter: blur(10px);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .p-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.78rem;
      font-weight: 800;
    }

    .p-flag {
      background: rgba(0, 0, 0, 0.2);
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
    }

    .p-id {
      color: #A5F3FC;
      letter-spacing: 0.5px;
    }

    .p-body {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .p-name-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 1.1rem;
    }

    .blood-tag {
      background: #EF4444;
      color: #FFFFFF;
      font-size: 0.8rem;
      font-weight: 900;
      padding: 0.15rem 0.55rem;
      border-radius: 6px;
    }

    .p-status-row {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.82rem;
      color: #6EE7B7;
      font-weight: 700;
    }

    .p-status-row .material-symbols-outlined {
      font-size: 1rem;
    }

    .security-pillars-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      padding-top: 0.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      font-size: 0.88rem;
    }

    .pillar-item {
      display: flex;
      align-items: center;
      gap: 0.55rem;
    }

    .pillar-item .material-symbols-outlined {
      font-size: 1.15rem;
      color: #A5F3FC;
    }

    /* Right Form Panel */
    .auth-form-side {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    /* Footer */
    .auth-minimal-footer {
      position: relative;
      z-index: 2;
      padding: 1.5rem;
      border-top: 1px solid var(--color-border-subtle, #E2E8F0);
      background: var(--color-surface-card, #FFFFFF);
      font-size: 0.85rem;
      color: var(--color-text-muted, #64748B);
    }

    :host-context([data-theme="dark"]) .auth-minimal-footer,
    :host-context(.dark-theme) .auth-minimal-footer {
      background: #031B26;
      border-color: rgba(5, 191, 219, 0.12);
    }

    .footer-wrap {
      max-width: 1240px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .footer-badges {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      font-size: 0.8rem;
    }

    .font-mono {
      font-family: monospace;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .auth-layout-container {
        grid-template-columns: 1fr;
        gap: 2.5rem;
      }

      .auth-visual-side {
        display: none; /* Focus completely on the creative form card on tablet & mobile */
      }
    }

    @media (max-width: 640px) {
      .auth-layout-container {
        padding: 1.5rem 1rem 3rem 1rem;
      }

      .footer-wrap {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class AuthLayoutComponent {
  themeService = inject(ThemeService);
  langService = inject(LanguageService);
}
