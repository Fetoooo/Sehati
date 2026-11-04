import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="auth-wrapper" [class.rtl]="currentLang === 'ar'">
      <div class="auth-container">
        <!-- Top brand bar -->
        <header class="auth-header">
          <a routerLink="/" class="auth-brand">
            <div class="brand-logo-mark">
              <span class="material-symbols-outlined logo-icon">vital_signs</span>
            </div>
            <div class="brand-names">
              <span class="arabic">صِحّتي</span>
              <span class="latin">SEHATI</span>
            </div>
          </a>

          <div class="header-actions">
            <button class="lang-toggle-btn" (click)="toggleLanguage()">
              <span class="material-symbols-outlined">translate</span>
              <span>{{ currentLang === 'en' ? 'العربية' : 'English' }}</span>
            </button>
          </div>
        </header>

        <!-- Main Auth Card Outlet -->
        <main class="auth-card-wrapper">
          <router-outlet></router-outlet>
        </main>

        <!-- Bottom Footer -->
        <footer class="auth-footer">
          <p>© 2026 Sehati Smart Healthcare Platform. All rights reserved.</p>
          <div class="footer-links">
            <a routerLink="/preview">Architecture Showcase</a>
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
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 50% 20%, #134e4a 0%, #090d16 65%);
      padding: 1.5rem;
    }

    .auth-container {
      width: 100%;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .auth-header {
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

    .brand-logo-mark {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    .brand-names {
      display: flex;
      align-items: baseline;
      gap: 0.4rem;

      .arabic {
        font-family: var(--font-arabic);
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--primary-400);
      }

      .latin {
        font-weight: 800;
        letter-spacing: 0.1em;
        font-size: 1rem;
        color: var(--text-main);
      }
    }

    .lang-toggle-btn {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      border-radius: 8px;
      padding: 0.4rem 0.75rem;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--primary-500);
        color: var(--primary-300);
      }
    }

    .auth-card-wrapper {
      width: 100%;
    }

    .auth-footer {
      text-align: center;
      font-size: 0.8rem;
      color: var(--text-muted);

      .footer-links {
        margin-top: 0.4rem;
        display: flex;
        justify-content: center;
        gap: 0.5rem;

        a {
          color: var(--primary-400);
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    .rtl {
      direction: rtl;
    }
  `]
})
export class AuthLayoutComponent {
  currentLang: 'en' | 'ar' = 'en';

  toggleLanguage(): void {
    this.currentLang = this.currentLang === 'en' ? 'ar' : 'en';
    document.documentElement.setAttribute('dir', this.currentLang === 'ar' ? 'rtl' : 'ltr');
  }
}
