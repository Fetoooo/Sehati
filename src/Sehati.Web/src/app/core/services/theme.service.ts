import { Injectable, computed, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';

export type AppTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'sehati_theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private storage = inject(StorageService);

  private themeSignal = signal<AppTheme>(this.getInitialTheme());

  public readonly currentTheme = this.themeSignal.asReadonly();
  public readonly isDark = computed(() => this.themeSignal() === 'dark');

  constructor() {
    this.applyTheme(this.themeSignal());
  }

  private getInitialTheme(): AppTheme {
    const saved = this.storage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    // Default theme is strictly LIGHT as specified by the MedicPro design system
    return 'light';
  }

  public toggleTheme(): void {
    const nextTheme: AppTheme = this.themeSignal() === 'light' ? 'dark' : 'light';
    this.setTheme(nextTheme);
  }

  public setTheme(theme: AppTheme): void {
    this.themeSignal.set(theme);
    this.storage.setItem(THEME_STORAGE_KEY, theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: AppTheme): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        root.classList.add('dark-theme');
        root.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
      } else {
        root.classList.add('light-theme');
        root.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
      }
    }
  }
}
