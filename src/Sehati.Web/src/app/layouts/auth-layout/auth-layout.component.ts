import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="auth-wrapper" [class.rtl]="langService.isRtl()">
      <!-- Background Micro-Grid & Ambient Lighting -->
      <div class="ambient-glow glow-1"></div>
      <div class="ambient-glow glow-2"></div>

      <!-- Top Header Navigation -->
      <header class="auth-top-header">
        <div class="header-container">
          <!-- Brand Logo & Name -->
          <a routerLink="/" class="auth-brand">
            <div class="brand-logo-frame">
              <img src="/sehati_logo.png" alt="Sehati Logo" class="brand-img" />
            </div>
            <div class="brand-typography">
              <span class="brand-ar">صِحّتي</span>
              <span class="brand-en">SEHATI</span>
            </div>
          </a>

          <!-- Controls: Back Home, Theme, Language -->
          <div class="auth-controls">
            <!-- Back to Home Button -->
            <a routerLink="/" class="back-home-btn">
              <span class="material-symbols-outlined flip-rtl">arrow_back</span>
              <span>{{ langService.isRtl() ? 'الرئيسية' : 'Home' }}</span>
            </a>

            <!-- Theme Toggle -->
            <button
              type="button"
              class="icon-control-btn"
              (click)="themeService.toggleTheme()"
              [title]="themeService.isDark() ? (langService.isRtl() ? 'الوضع النهاري' : 'Light Mode') : (langService.isRtl() ? 'الوضع الليلي' : 'Dark Mode')"
            >
              <span class="material-symbols-outlined">
                {{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}
              </span>
            </button>

            <!-- Language Switcher -->
            <button
              type="button"
              class="lang-control-btn"
              (click)="langService.toggleLanguage()"
            >
              <span class="material-symbols-outlined">translate</span>
              <span>{{ langService.currentLang() === 'en' ? 'العربية' : 'EN' }}</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Center Content Area -->
      <main class="auth-content-area">
        <div class="auth-card-wrapper">
          <!-- Outlet for Login & Register -->
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- Minimal Clean Auth Footer -->
      <footer class="auth-footer">
        <div class="footer-inner">
          <span>© 2026 Sehati Smart Healthcare Platform • 🇪🇬 Egypt</span>
          <div class="footer-security-chips">
            <span>🔒 AES-256</span>
            <span>•</span>
            <span>🛡️ HIPAA Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      position: relative;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--color-bg-app, #FAFCFB);
      /* Subtle micro-grid background matching landing page */
      background-image: 
        linear-gradient(to right, rgba(8, 131, 149, 0.045) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(8, 131, 149, 0.045) 1px, transparent 1px);
      background-size: 36px 36px;
      color: var(--color-text-main, #0F172A);
      font-family: var(--font-latin, 'Plus Jakarta Sans', sans-serif);
      overflow-x: hidden;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    .auth-wrapper.rtl {
      direction: rtl;
      font-family: var(--font-arabic, 'Cairo', sans-serif);

      .flip-rtl {
        transform: rotate(180deg);
      }
    }

    /* Ambient Glow Orbs */
    .ambient-glow {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      filter: blur(100px);
      z-index: 0;
      opacity: 0.6;
    }

    .glow-1 {
      top: -60px;
      left: 10%;
      width: 450px;
      height: 450px;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%);
    }

    .glow-2 {
      bottom: 5%;
      right: 10%;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(8, 131, 149, 0.12) 0%, transparent 70%);
    }

    /* Top Header */
    .auth-top-header {
      position: relative;
      z-index: 10;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid rgba(8, 131, 149, 0.08);
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(14px);
    }

    :host-context([data-theme="dark"]) .auth-top-header,
    :host-context(.dark-theme) .auth-top-header {
      background: rgba(8, 38, 53, 0.88);
      border-bottom: 1px solid rgba(5, 191, 219, 0.12);
    }

    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .auth-brand {
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
      background: linear-gradient(135deg, rgba(8, 131, 149, 0.12), rgba(5, 191, 219, 0.2));
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(8, 131, 149, 0.2);
    }

    .brand-img {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }

    .brand-typography {
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

    .auth-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .back-home-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 0.95rem;
      border-radius: 9999px;
      background: var(--color-surface-card, #FFFFFF);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      color: var(--color-text-main, #0F172A);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 700;
      transition: all 0.2s ease;
    }

    .back-home-btn:hover {
      border-color: var(--color-primary-base, #088395);
      color: var(--color-primary-base, #088395);
      transform: translateY(-1px);
    }

    .icon-control-btn {
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

    .icon-control-btn:hover {
      border-color: var(--color-primary-base, #088395);
      color: var(--color-primary-base, #088395);
    }

    .lang-control-btn {
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

    .lang-control-btn:hover {
      border-color: var(--color-primary-base, #088395);
      color: var(--color-primary-base, #088395);
    }

    /* Content Area */
    .auth-content-area {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem 4rem 1.5rem;
      position: relative;
      z-index: 2;
    }

    .auth-card-wrapper {
      width: 100%;
      display: flex;
      justify-content: center;
    }

    /* Footer */
    .auth-footer {
      position: relative;
      z-index: 2;
      padding: 1.5rem;
      border-top: 1px solid var(--color-border-subtle, #E2E8F0);
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(8px);
      font-size: 0.85rem;
      color: var(--color-text-muted, #64748B);
    }

    :host-context([data-theme="dark"]) .auth-footer,
    :host-context(.dark-theme) .auth-footer {
      background: rgba(8, 38, 53, 0.6);
      border-color: rgba(5, 191, 219, 0.12);
    }

    .footer-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .footer-security-chips {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      font-size: 0.8rem;
    }

    @media (max-width: 640px) {
      .auth-content-area {
        padding: 1.5rem 1rem 3rem 1rem;
      }

      .footer-inner {
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
