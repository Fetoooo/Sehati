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
    <div class="auth-wrapper" [class.rtl]="langService.isRtl()">
      <div class="auth-container">
        <!-- Top brand bar -->
        <header class="auth-header">
          <a routerLink="/" class="auth-brand">
            <img src="/sehati_logo.png" alt="Sehati Logo" class="sehati-logo-image" />
            <div class="brand-names">
              <span class="arabic">صِحّتي</span>
              <span class="latin">SEHATI</span>
            </div>
          </a>

          <div class="header-actions">
            <!-- Theme Toggle Button -->
            <button
              class="icon-toggle-btn"
              (click)="themeService.toggleTheme()"
              [title]="themeService.isDark() ? langService.t('themeLight') : langService.t('themeDark')"
              type="button"
            >
              <span class="material-symbols-outlined">
                {{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}
              </span>
            </button>

            <!-- Language Toggle Button -->
            <button
              class="lang-toggle-btn"
              (click)="langService.toggleLanguage()"
              type="button"
            >
              <span class="material-symbols-outlined">translate</span>
              <span>{{ langService.currentLang() === 'en' ? 'العربية' : 'English' }}</span>
            </button>
          </div>
        </header>

        <!-- Main Auth Card Outlet -->
        <main class="auth-card-wrapper">
          <router-outlet></router-outlet>
        </main>

        <!-- Bottom Footer -->
        <footer class="auth-footer">
          <p class="tagline">{{ langService.t('onePatientOneRecord') }}</p>
          <p class="copyright">© 2026 Sehati Smart Healthcare Platform. All rights reserved.</p>
          <div class="footer-links">
            <a routerLink="/preview">{{ langService.t('architectureShowcase') }}</a>
            <span>•</span>
            <a href="https://github.com/Fetoooo/Sehati" target="_blank" rel="noopener">GitHub</a>
          </div>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      background: radial-gradient(circle at 15% 15%, var(--color-primary-surface) 0%, transparent 60%),
                  radial-gradient(circle at 85% 85%, rgba(5, 191, 219, 0.08) 0%, transparent 55%),
                  var(--color-bg-app);
      display: flex;
      justify-content: center;
      padding: 2rem 1.25rem;
      transition: background 0.3s ease;

      &.rtl {
        direction: rtl;

        .brand-names {
          text-align: right;
        }
      }
    }

    .auth-container {
      width: 100%;
      max-width: 540px;
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    .auth-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0.25rem;
    }

    .auth-brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      text-decoration: none;

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
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: var(--color-primary-base);
        }
      }
    }

    .dark-theme .auth-brand .brand-names .arabic {
      color: var(--color-primary-accent);
    }

    .dark-theme .auth-brand .brand-names .latin {
      color: #94A3B8;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .icon-toggle-btn,
    .lang-toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 0.85rem;
      border-radius: var(--radius-pill);
      background: var(--color-surface-card);
      border: 1px solid var(--color-border-subtle);
      color: var(--color-text-main);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--color-primary-base);
        color: var(--color-primary-base);
        transform: translateY(-1px);
      }
    }

    .icon-toggle-btn {
      padding: 0.5rem;
      border-radius: 50%;
    }

    .auth-card-wrapper {
      width: 100%;
    }

    .auth-footer {
      text-align: center;
      font-size: 0.825rem;
      color: var(--color-text-muted);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding-top: 1rem;

      .tagline {
        font-weight: 600;
        color: var(--color-primary-base);
      }

      .footer-links {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;

        a {
          color: var(--color-text-muted);
          text-decoration: none;
          font-weight: 500;

          &:hover {
            color: var(--color-primary-base);
            text-decoration: underline;
          }
        }
      }
    }

    @media (max-width: 640px) {
      .auth-wrapper {
        padding: 1.25rem 1rem;
      }

      .auth-container {
        gap: 1.25rem;
      }
    }
  `]
})
export class AuthLayoutComponent {
  public themeService = inject(ThemeService);
  public langService = inject(LanguageService);
}
