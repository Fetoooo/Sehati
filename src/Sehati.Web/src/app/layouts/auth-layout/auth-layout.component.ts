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
      <!-- Ambient Lighting Backdrops -->
      <div class="ambient-glow glow-1"></div>
      <div class="ambient-glow glow-2"></div>
      <div class="ambient-glow glow-3"></div>

      <!-- Top Header Navigation -->
      <header class="auth-header">
        <div class="header-inner">
          <!-- Official Brand -->
          <a routerLink="/" class="brand-link" title="Sehati Homepage">
            <div class="brand-logo-frame">
              <img src="/sehati_logo.png" alt="Sehati Logo" class="brand-logo" />
            </div>
            <div class="brand-text">
              <span class="brand-ar">صِحّتي</span>
              <span class="brand-en">SEHATI PLATFORM</span>
            </div>
          </a>

          <!-- Utility Controls -->
          <div class="header-controls">
            <a routerLink="/" class="btn-return-home">
              <span class="material-symbols-outlined flip-rtl">arrow_back</span>
              <span>{{ langService.isRtl() ? 'الرئيسية' : 'Homepage' }}</span>
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
              title="Change Language"
            >
              <span class="material-symbols-outlined">translate</span>
              <span>{{ langService.currentLang() === 'en' ? 'العربية' : 'EN' }}</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Stage Container (Centered Focus Canvas) -->
      <main class="auth-main-stage">
        <div class="auth-stage-wrapper">
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- Trust Footer -->
      <footer class="auth-trust-footer">
        <div class="footer-inner">
          <div class="footer-attribution">
            <span class="flag">🇪🇬</span>
            <span>{{ langService.isRtl() ? 'جمهورية مصر العربية • المنظومة الوطنية الموحدة للسجلات الصحية' : 'Arab Republic of Egypt • National Unified Digital Health System' }}</span>
          </div>
          <div class="footer-security-chips">
            <span class="sec-chip">
              <span class="material-symbols-outlined">verified_user</span>
              <span>HIPAA Compliant</span>
            </span>
            <span class="dot-sep">•</span>
            <span class="sec-chip">
              <span class="material-symbols-outlined">lock</span>
              <span>AES-256 Encrypted</span>
            </span>
            <span class="dot-sep">•</span>
            <span class="sec-chip">
              <span class="material-symbols-outlined">shield</span>
              <span>Zero-Trust Consent</span>
            </span>
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
      filter: blur(140px);
      z-index: 0;
    }

    .glow-1 {
      top: -100px;
      left: 15%;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(8, 131, 149, 0.12) 0%, transparent 70%);
    }

    .glow-2 {
      top: 35%;
      right: 10%;
      width: 550px;
      height: 550px;
      background: radial-gradient(circle, rgba(5, 191, 219, 0.09) 0%, transparent 70%);
    }

    .glow-3 {
      bottom: -80px;
      left: 20%;
      width: 480px;
      height: 480px;
      background: radial-gradient(circle, rgba(10, 77, 104, 0.08) 0%, transparent 70%);
    }

    /* Header */
    .auth-header {
      position: relative;
      z-index: 10;
      padding: 1.1rem 2rem;
      background: rgba(255, 255, 255, 0.85);
      border-bottom: 1px solid var(--color-border-subtle, #E2E8F0);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      transition: all 0.3s ease;
    }

    :host-context([data-theme="dark"]) .auth-header,
    :host-context(.dark-theme) .auth-header {
      background: rgba(8, 38, 53, 0.85);
      border-bottom-color: rgba(5, 191, 219, 0.16);
    }

    .header-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s ease;
    }

    .brand-link:hover {
      transform: translateY(-1px);
    }

    .brand-logo-frame {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: linear-gradient(135deg, rgba(8, 131, 149, 0.12), rgba(5, 191, 219, 0.22));
      border: 1px solid rgba(8, 131, 149, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(8, 131, 149, 0.15);
    }

    .brand-logo {
      width: 28px;
      height: 28px;
      object-fit: contain;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .brand-ar {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--color-primary-dark, #0A4D68);
      letter-spacing: -0.2px;
    }

    :host-context([data-theme="dark"]) .brand-ar,
    :host-context(.dark-theme) .brand-ar {
      color: #05BFDB;
    }

    .brand-en {
      font-size: 0.68rem;
      font-weight: 800;
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
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
      transition: all 0.2s ease;
    }

    :host-context([data-theme="dark"]) .btn-return-home,
    :host-context(.dark-theme) .btn-return-home {
      background: #082635;
      border-color: rgba(5, 191, 219, 0.22);
    }

    .btn-return-home:hover {
      border-color: var(--color-primary-base, #088395);
      color: var(--color-primary-base, #088395);
      transform: translateY(-1px);
    }

    .icon-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      background: var(--color-surface-card, #FFFFFF);
      color: var(--color-text-main, #0F172A);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
      transition: all 0.2s ease;
    }

    :host-context([data-theme="dark"]) .icon-btn,
    :host-context(.dark-theme) .icon-btn {
      background: #082635;
      border-color: rgba(5, 191, 219, 0.22);
    }

    .icon-btn:hover {
      border-color: var(--color-primary-base, #088395);
      color: var(--color-primary-base, #088395);
      transform: translateY(-1px);
    }

    .lang-pill {
      height: 40px;
      padding: 0 1rem;
      border-radius: 9999px;
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      background: var(--color-surface-card, #FFFFFF);
      color: var(--color-text-main, #0F172A);
      font-size: 0.88rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
      transition: all 0.2s ease;
    }

    :host-context([data-theme="dark"]) .lang-pill,
    :host-context(.dark-theme) .lang-pill {
      background: #082635;
      border-color: rgba(5, 191, 219, 0.22);
    }

    .lang-pill:hover {
      border-color: var(--color-primary-base, #088395);
      color: var(--color-primary-base, #088395);
      transform: translateY(-1px);
    }

    /* Main Stage */
    .auth-main-stage {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem 4rem 1.5rem;
      position: relative;
      z-index: 2;
    }

    .auth-stage-wrapper {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    /* Trust Footer */
    .auth-trust-footer {
      position: relative;
      z-index: 2;
      padding: 1.5rem 2rem;
      background: var(--color-surface-card, #FFFFFF);
      border-top: 1px solid var(--color-border-subtle, #E2E8F0);
      color: var(--color-text-muted, #64748B);
      font-size: 0.85rem;
      transition: all 0.3s ease;
    }

    :host-context([data-theme="dark"]) .auth-trust-footer,
    :host-context(.dark-theme) .auth-trust-footer {
      background: #031B26;
      border-top-color: rgba(5, 191, 219, 0.12);
    }

    .footer-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .footer-attribution {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
    }

    .footer-security-chips {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-wrap: wrap;
    }

    .sec-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .sec-chip .material-symbols-outlined {
      font-size: 1rem;
      color: var(--color-primary-base, #088395);
    }

    .dot-sep {
      opacity: 0.4;
    }

    @media (max-width: 640px) {
      .auth-header {
        padding: 0.85rem 1rem;
      }

      .btn-return-home span:last-child {
        display: none;
      }

      .auth-main-stage {
        padding: 1.75rem 1rem 3rem 1rem;
      }

      .footer-inner {
        flex-direction: column;
        text-align: center;
        justify-content: center;
      }

      .footer-security-chips {
        justify-content: center;
      }
    }
  `]
})
export class AuthLayoutComponent {
  themeService = inject(ThemeService);
  langService = inject(LanguageService);
}
