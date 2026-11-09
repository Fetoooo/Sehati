import { Component, inject, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';
import { AuthService } from '../../core/services/auth.service';

interface FaqItem {
  qEn: string;
  qAr: string;
  aEn: string;
  aAr: string;
  open?: boolean;
}

interface PersonaRole {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  headlineEn: string;
  headlineAr: string;
  descEn: string;
  descAr: string;
  color: string;
  icon: string;
  featuresEn: string[];
  featuresAr: string[];
  route: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-page" [class.rtl]="langService.isRtl()">
      <!-- Background Ambient Lighting -->
      <div class="ambient-glow glow-top-right"></div>
      <div class="ambient-glow glow-top-left"></div>

      <!-- Top Navigation Bar -->
      <header class="top-navbar">
        <div class="nav-container">
          <!-- Brand Logo & Name -->
          <a routerLink="/" class="nav-brand">
            <div class="brand-logo-frame">
              <img src="/sehati_logo.png" alt="Sehati Logo" class="brand-img" />
            </div>
            <div class="brand-typography">
              <span class="brand-ar">صِحّتي</span>
              <span class="brand-en">SEHATI</span>
            </div>
          </a>

          <!-- Navigation Links (Streamlined with Dropdown) -->
          <nav class="nav-menu">
            <a href="#hero" class="nav-link">{{ langService.isRtl() ? 'نظرة عامة' : 'Overview' }}</a>
            <a href="#capabilities" class="nav-link">{{ langService.isRtl() ? 'المميزات' : 'Capabilities' }}</a>

            <!-- Combined Explore Dropdown -->
            <div class="nav-dropdown-wrapper" [class.open]="isExploreMenuOpen">
              <button
                type="button"
                class="nav-dropdown-trigger"
                (click)="toggleExploreMenu($event)"
                [attr.aria-expanded]="isExploreMenuOpen"
              >
                <span>{{ langService.isRtl() ? 'استكشف' : 'Explore' }}</span>
                <span class="material-symbols-outlined dropdown-chevron">expand_more</span>
              </button>

              <div class="nav-dropdown-menu" [class.show]="isExploreMenuOpen">
                <a href="#personas" class="dropdown-item" (click)="closeExploreMenu()">
                  <div class="dropdown-item-icon teal">
                    <span class="material-symbols-outlined">badge</span>
                  </div>
                  <div class="dropdown-item-text">
                    <strong class="item-title">{{ langService.isRtl() ? 'الفئات والخدمات' : 'Healthcare Roles' }}</strong>
                    <span class="item-desc">{{ langService.isRtl() ? 'بوابات الأطباء، المرضى، وموظفي الاستقبال' : 'Physician, Patient & Reception Portals' }}</span>
                  </div>
                </a>

                <a href="#how-it-works" class="dropdown-item" (click)="closeExploreMenu()">
                  <div class="dropdown-item-icon blue">
                    <span class="material-symbols-outlined">route</span>
                  </div>
                  <div class="dropdown-item-text">
                    <strong class="item-title">{{ langService.isRtl() ? 'كيف تعمل المنظومة' : 'How It Works' }}</strong>
                    <span class="item-desc">{{ langService.isRtl() ? 'مسار رعاية موحد من 3 خطوات سهلة' : '3-step unified clinical pathway' }}</span>
                  </div>
                </a>

                <a href="#faq" class="dropdown-item" (click)="closeExploreMenu()">
                  <div class="dropdown-item-icon amber">
                    <span class="material-symbols-outlined">help</span>
                  </div>
                  <div class="dropdown-item-text">
                    <strong class="item-title">{{ langService.isRtl() ? 'الأسئلة الشائعة' : 'FAQ & Support' }}</strong>
                    <span class="item-desc">{{ langService.isRtl() ? 'إجابات حول الخصوصية وأمان السجلات' : 'Answers on privacy and security' }}</span>
                  </div>
                </a>

                <div class="dropdown-divider"></div>

                <a routerLink="/preview" class="dropdown-item highlight" (click)="closeExploreMenu()">
                  <div class="dropdown-item-icon accent">
                    <span class="material-symbols-outlined">architecture</span>
                  </div>
                  <div class="dropdown-item-text">
                    <strong class="item-title">{{ langService.isRtl() ? 'استعراض الهيكلية والأنظمة' : 'Architecture Showcase' }}</strong>
                    <span class="item-desc">{{ langService.isRtl() ? 'استعراض كامل لقواعد البيانات والواجهات' : 'Full architecture and API overview' }}</span>
                  </div>
                </a>
              </div>
            </div>
          </nav>

          <!-- Navigation Actions -->
          <div class="nav-actions">
            <!-- Theme Toggle Button -->
            <button
              type="button"
              class="icon-action-btn"
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
              class="lang-action-btn"
              (click)="langService.toggleLanguage()"
            >
              <span class="material-symbols-outlined">translate</span>
              <span>{{ langService.currentLang() === 'en' ? 'العربية' : 'English' }}</span>
            </button>

            <!-- Auth Buttons -->
            <ng-container *ngIf="!authService.isAuthenticated(); else authUserActions">
              <a routerLink="/auth/login" class="login-text-btn">
                {{ langService.isRtl() ? 'تسجيل الدخول' : 'Sign In' }}
              </a>
              <a routerLink="/auth/register" class="join-pill-btn">
                <span>{{ langService.isRtl() ? 'أنشئ حسابك' : 'Get Started' }}</span>
                <span class="material-symbols-outlined flip-rtl">arrow_forward</span>
              </a>
            </ng-container>

            <ng-template #authUserActions>
              <a routerLink="/dashboard" class="join-pill-btn dashboard-pill">
                <span class="material-symbols-outlined">space_dashboard</span>
                <span>{{ langService.isRtl() ? 'لوحة التحكم' : 'Dashboard' }}</span>
              </a>
            </ng-template>

            <!-- Mobile Hamburger Toggle -->
            <button
              type="button"
              class="mobile-toggle-btn"
              (click)="isMobileMenuOpen = !isMobileMenuOpen"
            >
              <span class="material-symbols-outlined">{{ isMobileMenuOpen ? 'close' : 'menu' }}</span>
            </button>
          </div>
        </div>

        <!-- Mobile Drawer -->
        <div class="mobile-drawer" *ngIf="isMobileMenuOpen">
          <a href="#hero" class="drawer-item" (click)="isMobileMenuOpen = false">
            {{ langService.isRtl() ? 'نظرة عامة' : 'Overview' }}
          </a>
          <a href="#capabilities" class="drawer-item" (click)="isMobileMenuOpen = false">
            {{ langService.isRtl() ? 'المميزات الرقمية' : 'Capabilities' }}
          </a>
          <a href="#personas" class="drawer-item" (click)="isMobileMenuOpen = false">
            {{ langService.isRtl() ? 'الفئات والخدمات' : 'Healthcare Roles' }}
          </a>
          <a href="#how-it-works" class="drawer-item" (click)="isMobileMenuOpen = false">
            {{ langService.isRtl() ? 'كيف تعمل المنظومة' : 'How It Works' }}
          </a>
          <a href="#faq" class="drawer-item" (click)="isMobileMenuOpen = false">
            {{ langService.isRtl() ? 'الأسئلة الشائعة' : 'FAQ' }}
          </a>
          <a routerLink="/preview" class="drawer-item" (click)="isMobileMenuOpen = false">
            {{ langService.isRtl() ? 'استعراض الهيكلية والأنظمة' : 'Architecture Showcase' }}
          </a>
          <div class="drawer-buttons">
            <ng-container *ngIf="!authService.isAuthenticated()">
              <a routerLink="/auth/login" class="btn-drawer-outline" (click)="isMobileMenuOpen = false">
                {{ langService.isRtl() ? 'تسجيل الدخول' : 'Sign In' }}
              </a>
              <a routerLink="/auth/register" class="btn-drawer-solid" (click)="isMobileMenuOpen = false">
                {{ langService.isRtl() ? 'إنشاء حساب جديد' : 'Get Started Free' }}
              </a>
            </ng-container>
            <ng-container *ngIf="authService.isAuthenticated()">
              <a routerLink="/dashboard" class="btn-drawer-solid" (click)="isMobileMenuOpen = false">
                {{ langService.isRtl() ? 'الانتقال إلى لوحة التحكم' : 'Go to Dashboard' }}
              </a>
            </ng-container>
          </div>
        </div>
      </header>

      <!-- ================================================================= -->
      <!-- HERO SECTION (Clean, Spacious, Uncluttered, No Overlapping Chips) -->
      <!-- ================================================================= -->
      <section class="hero-section" id="hero">
        <div class="hero-container">
          <!-- Text Column -->
          <div class="hero-text-col">
            <!-- Official National Badge -->
            <div class="hero-national-badge">
              <span class="flag-icon">🇪🇬</span>
              <span class="badge-text">
                {{ langService.isRtl() ? 'المنظومة الوطنية الموحدة للسجلات الصحية في مصر' : 'National Digital Health Infrastructure • Egypt' }}
              </span>
            </div>

            <!-- Clear, Inspiring Headline (No overlapping text) -->
            <h1 class="hero-headline">
              <span class="headline-part-1">{{ langService.isRtl() ? 'رعايتك الصحية، في سجل رقمي' : 'One Patient, One Record,' }}</span>
              <span class="headline-accent">{{ langService.isRtl() ? 'موحد ومدى الحياة' : 'Better Healthcare' }}</span>
            </h1>

            <!-- Subtitle Description -->
            <p class="hero-subtext">
              {{ langService.isRtl()
                ? 'منصة صحتي تنهي تشتت السجلات الطبية الورقية، وتربط بين المستشفيات والعيادات والمعامل وطوارئ الإسعاف بكود صحي موحد، تحت تحكمك الكامل وبأعلى معايير الخصوصية.'
                : 'Sehati terminates fragmented paper records by unifying hospitals, clinics, pathology labs, and emergency dispatch under one lifelong digital health passport with patient-governed privacy.' }}
            </p>

            <!-- Dual CTAs -->
            <div class="hero-cta-wrapper">
              <a routerLink="/auth/register" class="btn-hero-primary">
                <span>{{ langService.isRtl() ? 'إصدار جوازك الطبي الموحد' : 'Claim Your Health Passport' }}</span>
                <span class="material-symbols-outlined flip-rtl">arrow_forward</span>
              </a>

              <a routerLink="/preview" class="btn-hero-secondary">
                <span class="material-symbols-outlined">play_circle</span>
                <span>{{ langService.isRtl() ? 'تجربة المنظومة الحية' : 'Explore Live Showcase' }}</span>
              </a>
            </div>

            <!-- Structured Trust Metrics Bar (Neat, Solid, Not Overlapping) -->
            <div class="hero-trust-metrics">
              <div class="metric-pill">
                <span class="metric-icon material-symbols-outlined">badge</span>
                <div class="metric-info">
                  <strong>SH-YYYY-NNNNNN</strong>
                  <span>{{ langService.isRtl() ? 'كود طبي وطني مركزي' : 'Unified Lifetime ID' }}</span>
                </div>
              </div>
              <div class="metric-pill">
                <span class="metric-icon material-symbols-outlined text-red">emergency</span>
                <div class="metric-info">
                  <strong>&lt; 2s</strong>
                  <span>{{ langService.isRtl() ? 'استجابة طوارئ فورية' : 'Rapid ER QR Retrieval' }}</span>
                </div>
              </div>
              <div class="metric-pill">
                <span class="metric-icon material-symbols-outlined text-teal">shield</span>
                <div class="metric-info">
                  <strong>Zero-Trust</strong>
                  <span>{{ langService.isRtl() ? 'أذونات خصوصية يتحكم بها المريض' : 'Patient-Governed Consent' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Hero Visual: The Official Egyptian Smart Health Passport Terminal -->
          <div class="hero-visual-col">
            <div class="passport-terminal-card">
              <!-- Passport Card Header -->
              <div class="terminal-header">
                <div class="t-brand">
                  <img src="/sehati_logo.png" alt="Sehati" class="t-logo" />
                  <div>
                    <div class="t-title-ar">{{ langService.isRtl() ? 'جمهورية مصر العربية • صِحّتي' : 'Arab Republic of Egypt • SEHATI' }}</div>
                    <div class="t-title-en">SMART HEALTH PASSPORT</div>
                  </div>
                </div>
                <div class="t-chip-nfc">
                  <div class="smart-chip-icon"></div>
                  <span class="material-symbols-outlined nfc-icon">contactless</span>
                </div>
              </div>

              <!-- Interactive Passport Screen Tabs -->
              <div class="terminal-nav-tabs">
                <button
                  type="button"
                  class="t-tab-btn"
                  [class.active]="activePassportTab === 0"
                  (click)="activePassportTab = 0"
                >
                  <span class="material-symbols-outlined">badge</span>
                  <span>{{ langService.isRtl() ? 'الجواز الطبي' : 'Passport' }}</span>
                </button>
                <button
                  type="button"
                  class="t-tab-btn"
                  [class.active]="activePassportTab === 1"
                  (click)="activePassportTab = 1"
                >
                  <span class="material-symbols-outlined text-red">emergency</span>
                  <span>{{ langService.isRtl() ? 'طوارئ QR' : 'ER QR' }}</span>
                </button>
                <button
                  type="button"
                  class="t-tab-btn"
                  [class.active]="activePassportTab === 2"
                  (click)="activePassportTab = 2"
                >
                  <span class="material-symbols-outlined text-teal">clinical_notes</span>
                  <span>{{ langService.isRtl() ? 'روشتة رقمية' : 'E-Rx' }}</span>
                </button>
                <button
                  type="button"
                  class="t-tab-btn"
                  [class.active]="activePassportTab === 3"
                  (click)="activePassportTab = 3"
                >
                  <span class="material-symbols-outlined text-purple">vital_signs</span>
                  <span>{{ langService.isRtl() ? 'المؤشرات' : 'Vitals' }}</span>
                </button>
              </div>

              <!-- SCREEN 0: UNIFIED HEALTH PASSPORT -->
              <div class="terminal-screen" *ngIf="activePassportTab === 0">
                <div class="id-banner-block">
                  <div class="id-code-wrap">
                    <span class="id-label">{{ langService.isRtl() ? 'الكود الصحي الموحد' : 'UNIFIED HEALTH CODE' }}</span>
                    <strong class="id-number font-mono">SH-2026-000101</strong>
                  </div>
                  <span class="blood-group-badge">A+</span>
                </div>

                <div class="patient-profile-grid">
                  <div class="p-field">
                    <span class="f-lbl">{{ langService.isRtl() ? 'اسم المواطن' : 'CITIZEN NAME' }}</span>
                    <strong class="f-val">Ahmed Mahmoud Hassan</strong>
                  </div>
                  <div class="p-field">
                    <span class="f-lbl">{{ langService.isRtl() ? 'الرقم القومي' : 'NATIONAL ID' }}</span>
                    <strong class="f-val font-mono">29805121601234</strong>
                  </div>
                  <div class="p-field">
                    <span class="f-lbl">{{ langService.isRtl() ? 'تاريخ الميلاد' : 'DATE OF BIRTH' }}</span>
                    <span class="f-val">12 Jun 1988</span>
                  </div>
                  <div class="p-field">
                    <span class="f-lbl">{{ langService.isRtl() ? 'حالة السجل' : 'STATUS' }}</span>
                    <span class="f-val verified-tag">
                      <span class="material-symbols-outlined">verified</span>
                      <span>ACTIVE & VERIFIED</span>
                    </span>
                  </div>
                </div>

                <div class="terminal-footer-bar">
                  <div class="encryption-badge">
                    <span class="material-symbols-outlined">lock</span>
                    <span>AES-256 ENCRYPTED</span>
                  </div>
                  <div class="consent-status-badge">
                    <span class="material-symbols-outlined">verified_user</span>
                    <span>CONSENT: ACTIVE</span>
                  </div>
                </div>
              </div>

              <!-- SCREEN 1: EMERGENCY RESCUE QR -->
              <div class="terminal-screen" *ngIf="activePassportTab === 1">
                <div class="er-rescue-banner">
                  <span class="material-symbols-outlined er-alert-icon">e911_emergency</span>
                  <div>
                    <strong>{{ langService.isRtl() ? 'بطاقة الإنقاذ السريع لطواقم الإسعاف' : 'First Responder Triage Profile' }}</strong>
                    <p>{{ langService.isRtl() ? 'متاح فوراً دون كلمة مرور لإنقاذ الحياة' : 'Immediate anonymous access during trauma & triage' }}</p>
                  </div>
                </div>

                <div class="er-content-layout">
                  <div class="qr-visual-box">
                    <span class="material-symbols-outlined qr-big-icon">qr_code_2</span>
                    <span class="qr-scan-label">{{ langService.isRtl() ? 'امسح للإسعاف' : 'SCAN TO RESCUE' }}</span>
                  </div>
                  <div class="er-critical-details">
                    <div class="er-detail-item">
                      <span class="lbl">{{ langService.isRtl() ? 'فصيلة الدم:' : 'Blood Group:' }}</span>
                      <strong class="val blood-red">A+ Positive</strong>
                    </div>
                    <div class="er-detail-item allergy-alert">
                      <span class="lbl">{{ langService.isRtl() ? 'حساسية دوائية حرجة:' : 'Severe Drug Allergy:' }}</span>
                      <strong class="val">بنسلين (Penicillin)</strong>
                    </div>
                    <div class="er-detail-item">
                      <span class="lbl">{{ langService.isRtl() ? 'طوارئ الأقارب (ICE):' : 'Emergency Contact:' }}</span>
                      <strong class="val font-mono">0101-234-5678</strong>
                    </div>
                  </div>
                </div>
              </div>

              <!-- SCREEN 2: DIGITAL PRESCRIPTION -->
              <div class="terminal-screen" *ngIf="activePassportTab === 2">
                <div class="rx-header-banner">
                  <div>
                    <span class="rx-doc-name">Dr. Sarah Samir Hassan</span>
                    <span class="rx-doc-spec">{{ langService.isRtl() ? 'استشاري الباطنة والجهاز الهضمي' : 'Consultant Internal Medicine' }}</span>
                  </div>
                  <span class="rx-pill-tag">VERIFIED E-RX</span>
                </div>

                <div class="rx-medicines-list">
                  <div class="rx-med-card">
                    <div class="med-name">Augmentin 1g (Amoxicillin)</div>
                    <div class="med-instructions">{{ langService.isRtl() ? 'قرص واحد كل 12 ساعة بعد الأكل لمدة 7 أيام' : '1 tablet every 12 hrs after meals (7 days)' }}</div>
                  </div>
                  <div class="rx-med-card">
                    <div class="med-name">Panadol Extra 500mg</div>
                    <div class="med-instructions">{{ langService.isRtl() ? 'قرص عند اللزوم لتخفيف الصداع' : '1 tablet as needed for headache' }}</div>
                  </div>
                </div>

                <div class="rx-signature-seal">
                  <span class="material-symbols-outlined">draw</span>
                  <span>{{ langService.isRtl() ? 'موقعة إلكترونياً بمعيار SHA-256 • صيدليات مصر المعتمدة' : 'SHA-256 Digitally Signed & Sealed' }}</span>
                </div>
              </div>

              <!-- SCREEN 3: LIVE VITALS -->
              <div class="terminal-screen" *ngIf="activePassportTab === 3">
                <div class="vitals-header-banner">
                  <span class="vitals-pulse-dot"></span>
                  <strong>{{ langService.isRtl() ? 'المؤشرات الحيوية المتزامنة لحظياً' : 'Live Synchronized Clinical Telemetry' }}</strong>
                </div>

                <div class="vitals-matrix-grid">
                  <div class="vital-tile">
                    <span class="material-symbols-outlined v-icon red">favorite</span>
                    <span class="v-value">72 bpm</span>
                    <span class="v-label">{{ langService.isRtl() ? 'نبض سليم' : 'Heart Rate' }}</span>
                  </div>
                  <div class="vital-tile">
                    <span class="material-symbols-outlined v-icon teal">vital_signs</span>
                    <span class="v-value">120/80</span>
                    <span class="v-label">{{ langService.isRtl() ? 'ضغط الدم (mmHg)' : 'Blood Pressure' }}</span>
                  </div>
                  <div class="vital-tile">
                    <span class="material-symbols-outlined v-icon amber">bloodtype</span>
                    <span class="v-value">95 mg/dL</span>
                    <span class="v-label">{{ langService.isRtl() ? 'سكر عشوائي' : 'Glucose' }}</span>
                  </div>
                  <div class="vital-tile">
                    <span class="material-symbols-outlined v-icon purple">fitness_center</span>
                    <span class="v-value">22.4</span>
                    <span class="v-label">{{ langService.isRtl() ? 'كتلة الجسم (BMI)' : 'BMI (Normal)' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================================================================= -->
      <!-- HEALTHCARE ROLES & WORKSPACES EXPLORER                            -->
      <!-- ================================================================= -->
      <section class="roles-section" id="personas">
        <div class="section-container">
          <div class="section-title-block">
            <span class="section-tag-pill">{{ langService.isRtl() ? 'واجهات متخصصة' : 'Role-Based Workspaces' }}</span>
            <h2 class="section-headline">
              {{ langService.isRtl() ? 'منظومة واحدة متكاملة لكل أطراف الرعاية الصحية' : 'One Integrated Platform for All Healthcare Actors' }}
            </h2>
            <p class="section-subheadline">
              {{ langService.isRtl()
                ? 'واجهات مصممة باحترافية لتناسب كل طرف في المنظومة: المواطن، الأطباء، المستشفيات، طواقم الطوارئ، والصيدليات.'
                : 'Tailored workspaces engineered for clinical speed, patient empowerment, and instant emergency triage.' }}
            </p>
          </div>

          <!-- Role Selector Navigation Tabs -->
          <div class="roles-nav-bar">
            <button
              *ngFor="let role of rolesList"
              type="button"
              class="role-pill-btn"
              [class.active]="selectedRole.id === role.id"
              [style.--role-color]="role.color"
              (click)="selectedRole = role"
            >
              <span class="material-symbols-outlined">{{ role.icon }}</span>
              <span>{{ langService.isRtl() ? role.nameAr : role.nameEn }}</span>
            </button>
          </div>

          <!-- Active Role Showcase Console -->
          <div class="role-console-card">
            <!-- Left: Clinical Details -->
            <div class="console-info-col">
              <span class="console-role-tag" [style.background]="selectedRole.color + '18'" [style.color]="selectedRole.color">
                <span class="material-symbols-outlined">{{ selectedRole.icon }}</span>
                <span>{{ langService.isRtl() ? selectedRole.nameAr : selectedRole.nameEn }}</span>
              </span>

              <h3 class="console-title">{{ langService.isRtl() ? selectedRole.headlineAr : selectedRole.headlineEn }}</h3>
              <p class="console-desc">{{ langService.isRtl() ? selectedRole.descAr : selectedRole.descEn }}</p>

              <div class="console-bullets-list">
                <div class="bullet-row" *ngFor="let f of (langService.isRtl() ? selectedRole.featuresAr : selectedRole.featuresEn)">
                  <span class="material-symbols-outlined check-mark" [style.color]="selectedRole.color">check_circle</span>
                  <span>{{ f }}</span>
                </div>
              </div>

              <div class="console-action-row">
                <a [routerLink]="selectedRole.route" class="btn-console-launch" [style.background]="selectedRole.color">
                  <span class="material-symbols-outlined">launch</span>
                  <span>{{ langService.isRtl() ? 'الدخول إلى بوابة ' + selectedRole.nameAr : 'Launch ' + selectedRole.nameEn + ' Workspace' }}</span>
                </a>
              </div>
            </div>

            <!-- Right: Role Workspace Mockup -->
            <div class="console-preview-col">
              <div class="mockup-frame">
                <div class="mockup-top-bar">
                  <span class="dot red"></span>
                  <span class="dot yellow"></span>
                  <span class="dot green"></span>
                  <span class="mockup-url">sehati.gov.eg{{ selectedRole.route }}</span>
                </div>
                <div class="mockup-body">
                  <div class="mockup-hero-icon" [style.background]="selectedRole.color + '18'" [style.color]="selectedRole.color">
                    <span class="material-symbols-outlined">{{ selectedRole.icon }}</span>
                  </div>
                  <h4>{{ langService.isRtl() ? selectedRole.headlineAr : selectedRole.headlineEn }}</h4>
                  <p>{{ langService.isRtl() ? 'واجهة مهيأة بأحدث معايير الأمان وسرعة الإنجاز السريري' : 'Engineered for high-throughput clinical performance' }}</p>
                  <div class="mockup-tags">
                    <span>ARABIC RTL</span>
                    <span>LIGHT / DARK</span>
                    <span>AES-256</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================================================================= -->
      <!-- HOW IT WORKS STEP-BY-STEP WORKFLOW                                -->
      <!-- ================================================================= -->
      <section class="how-it-works-section" id="how-it-works">
        <div class="section-container">
          <div class="section-title-block">
            <span class="section-tag-pill">{{ langService.isRtl() ? 'خطوات الاستخدام' : 'Simple 3-Step Journey' }}</span>
            <h2 class="section-headline">
              {{ langService.isRtl() ? 'كيف تعمل منظومة صحتي في 3 خطوات بسيطة؟' : 'How Sehati Empowers Healthcare In 3 Simple Steps' }}
            </h2>
            <p class="section-subheadline">
              {{ langService.isRtl()
                ? 'تجربة رقمية ميسرة للمواطن تبدأ من التسجيل وحتى المتابعة الطبية الشاملة.'
                : 'A seamless journey from registration to lifelong medical records and clinical follow-ups.' }}
            </p>
          </div>

          <div class="steps-grid">
            <div class="step-card">
              <div class="step-watermark">01</div>
              <div class="step-icon-box teal">
                <span class="material-symbols-outlined">badge</span>
              </div>
              <h3 class="step-title">{{ langService.isRtl() ? 'أنشئ حسابك واستلم كودك الموحد' : 'Claim Your Lifetime Unified ID' }}</h3>
              <p class="step-desc">
                {{ langService.isRtl()
                  ? 'سجّل ببياناتك القومية في أقل من دقيقة لتوليد كود صحتي الموحد، وتفعيل بطاقة الطوارئ الذكية.'
                  : 'Sign up in under 60 seconds with your national ID to generate your lifetime health passport and emergency rescue QR.' }}
              </p>
            </div>

            <div class="step-card">
              <div class="step-watermark">02</div>
              <div class="step-icon-box orange">
                <span class="material-symbols-outlined">shield_person</span>
              </div>
              <h3 class="step-title">{{ langService.isRtl() ? 'احجز واكشف وامنح الإذن لطبيبك' : 'Book & Grant Doctor Consent' }}</h3>
              <p class="step-desc">
                {{ langService.isRtl()
                  ? 'احجز موعدك بالعيادة وامنح طبيبك تصريح الاطلاع على تاريخك المرضي وفحوصاتك السابقة لتقديم أدق تشخيص.'
                  : 'Schedule clinic visits and grant your attending physician time-limited access to your comprehensive clinical history.' }}
              </p>
            </div>

            <div class="step-card">
              <div class="step-watermark">03</div>
              <div class="step-icon-box purple">
                <span class="material-symbols-outlined">clinical_notes</span>
              </div>
              <h3 class="step-title">{{ langService.isRtl() ? 'سجل طبي رقمي وروشتاتك في جيبك' : 'Lifelong Health Chart In Your Pocket' }}</h3>
              <p class="step-desc">
                {{ langService.isRtl()
                  ? 'استلم الروشتات الرقمية ونتائج التحاليل فوراً على هاتفك دون قلق من فقدان التقارير الورقية أبداً.'
                  : 'Access certified digital prescriptions, lab test reports, and imaging scans anytime on any device with zero paperwork.' }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ================================================================= -->
      <!-- PLATFORM CAPABILITIES GRID                                        -->
      <!-- ================================================================= -->
      <section class="capabilities-section" id="capabilities">
        <div class="section-container">
          <div class="section-title-block">
            <span class="section-tag-pill">{{ langService.isRtl() ? 'المميزات السريرية' : 'Core Capabilities' }}</span>
            <h2 class="section-headline">
              {{ langService.isRtl() ? 'بنية تحتية طبية رقمية متطورة' : 'Next-Generation Healthcare Architecture' }}
            </h2>
            <p class="section-subheadline">
              {{ langService.isRtl()
                ? 'حلول برمجية متقدمة تنهي عهد الدفاتر الورقية وتضمن الأمان التام لمعلومات المرضى.'
                : 'Advanced healthcare primitives ensuring record integrity, zero-trust consent, and instant emergency response.' }}
            </p>
          </div>

          <div class="capabilities-grid">
            <div class="cap-card">
              <div class="cap-icon-box teal">
                <span class="material-symbols-outlined">badge</span>
              </div>
              <h3 class="cap-title">{{ langService.isRtl() ? 'الكود الصحي الموحد (Unified ID)' : 'Unified Health Passport' }}</h3>
              <p class="cap-desc">
                {{ langService.isRtl()
                  ? 'رقم طبي مركزي موحد بصيغة (SH-YYYY-NNNNNN) يربط كافة كشوفاتك، روشتاتك، وتحاليلك عبر جميع المنشآت الطبية مدى الحياة.'
                  : 'A lifetime health code (SH-YYYY-NNNNNN) synchronizing visits, prescriptions, labs, and scans across all providers nationwide.' }}
              </p>
            </div>

            <div class="cap-card">
              <div class="cap-icon-box ocean">
                <span class="material-symbols-outlined">shield_lock</span>
              </div>
              <h3 class="cap-title">{{ langService.isRtl() ? 'محرك الأذونات والخصوصية' : 'Zero-Trust Consent Engine' }}</h3>
              <p class="cap-desc">
                {{ langService.isRtl()
                  ? 'المريض هو المالك الوحيد لبياناته؛ يمنح الأطباء حق الاطلاع أو الإضافة لفترات محددة مع إمكانية الإلغاء الفوري بضغطة واحدة.'
                  : 'Zero-trust governance where patients grant time-limited permissions to doctors with instant one-click revocation.' }}
              </p>
            </div>

            <div class="cap-card">
              <div class="cap-icon-box red">
                <span class="material-symbols-outlined">emergency</span>
              </div>
              <h3 class="cap-title">{{ langService.isRtl() ? 'بطاقة الإنقاذ السريع (QR)' : 'Rapid ER Rescue Profile' }}</h3>
              <p class="cap-desc">
                {{ langService.isRtl()
                  ? 'رمز استجابة سريع يتيح لأطقم الإسعاف معرفة فصيلة الدم والحساسيات الحرجة وجهات الاتصال فوراً في الحوادث دون كلمة مرور.'
                  : 'Instant anonymous triage profile giving paramedics immediate access to blood type, severe allergies, and emergency contacts in under 2s.' }}
              </p>
            </div>

            <div class="cap-card">
              <div class="cap-icon-box mint">
                <span class="material-symbols-outlined">clinical_notes</span>
              </div>
              <h3 class="cap-title">{{ langService.isRtl() ? 'عيادة الطبيب والروشتة الرقمية' : 'Doctor Encounter & E-Rx Builder' }}</h3>
              <p class="cap-desc">
                {{ langService.isRtl()
                  ? 'توثيق سريري فوري مع قياس المؤشرات الحيوية وحساب كتلة الجسم (BMI)، وتصنيف الأمراض (ICD-10)، وإصدار روشتات إلكترونية معتمدة.'
                  : 'Fast clinical notes, automatic BMI calculation, ICD-10 diagnostic coding, and tamper-proof digital prescriptions with digital signature.' }}
              </p>
            </div>

            <div class="cap-card">
              <div class="cap-icon-box amber">
                <span class="material-symbols-outlined">reduce_capacity</span>
              </div>
              <h3 class="cap-title">{{ langService.isRtl() ? 'تنظيم طوابير الحجز والكشف' : 'Live Clinic Queue Orchestration' }}</h3>
              <p class="cap-desc">
                {{ langService.isRtl()
                  ? 'جدولة مواعيد دقيقة تمنع التضارب وحجز المواعيد المزدوجة، مع إدارة طابور الانتظار وتوزيع الأرقام اللحظية بغرف الكشف.'
                  : 'Intelligent scheduling with collision prevention and live token queues coordinating waiting lounges with examination rooms.' }}
              </p>
            </div>

            <div class="cap-card">
              <div class="cap-icon-box purple">
                <span class="material-symbols-outlined">policy</span>
              </div>
              <h3 class="cap-title">{{ langService.isRtl() ? 'سجل العمليات والرقابة الأمنية' : 'Forensic Immutable Audit Trail' }}</h3>
              <p class="cap-desc">
                {{ langService.isRtl()
                  ? 'تسجيل أمني غير قابل للتعديل (WORM) لكل محاولة قراءة أو كتابة أو تعديل للسجلات الطبية وفقاً لمعايير HIPAA و GDPR الصارمة.'
                  : 'Cryptographically accountable audit log recording every single view, modification, and access attempt with timestamp and client IP.' }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ================================================================= -->
      <!-- FAQ SECTION (Accordion)                                           -->
      <!-- ================================================================= -->
      <section class="faq-section" id="faq">
        <div class="section-container">
          <div class="section-title-block">
            <span class="section-tag-pill">{{ langService.isRtl() ? 'الأسئلة الشائعة' : 'FAQ' }}</span>
            <h2 class="section-headline">
              {{ langService.isRtl() ? 'كل ما تحتاج لمعرفته عن منصة صحتي' : 'Frequently Asked Questions' }}
            </h2>
            <p class="section-subheadline">
              {{ langService.isRtl()
                ? 'إجابات مباشرة وموثوقة حول الأمان، خصوصية البيانات، واستخدام بطاقة الطوارئ.'
                : 'Clear answers about security, patient consent, and platform usage.' }}
            </p>
          </div>

          <div class="faq-accordion-list">
            <div
              *ngFor="let item of faqList; let i = index"
              class="faq-card-item"
              [class.open]="item.open"
              (click)="toggleFaq(i)"
            >
              <div class="faq-question-row">
                <span class="faq-q-text">{{ langService.isRtl() ? item.qAr : item.qEn }}</span>
                <span class="material-symbols-outlined expand-icon">
                  {{ item.open ? 'remove' : 'add' }}
                </span>
              </div>
              <div class="faq-answer-panel" *ngIf="item.open">
                <p>{{ langService.isRtl() ? item.aAr : item.aEn }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================================================================= -->
      <!-- CALL TO ACTION BANNER                                             -->
      <!-- ================================================================= -->
      <section class="cta-banner-section">
        <div class="section-container">
          <div class="cta-modern-box">
            <div class="cta-inner-content">
              <span class="cta-mini-tag">{{ langService.isRtl() ? 'رعاية صحية موحدة' : 'SMART HEALTHCARE' }}</span>
              <h2 class="cta-main-title">
                {{ langService.isRtl() ? 'هل أنت مستعد لتجربة مستقبل الرعاية الصحية في مصر؟' : 'Ready to Experience the Future of Unified Healthcare?' }}
              </h2>
              <p class="cta-subtext">
                {{ langService.isRtl()
                  ? 'انضم الآن إلى منظومة صحتي واستمتع بسجل طبي موحد مدى الحياة تحت أمان كامل وبدون أوراق.'
                  : 'Join thousands of citizens and accredited healthcare providers under one unified medical cloud.' }}
              </p>
              <div class="cta-buttons-row">
                <a routerLink="/auth/register" class="btn-cta-primary">
                  <span>{{ langService.isRtl() ? 'أنشئ حسابك مجاناً الآن' : 'Create Your Free Account' }}</span>
                  <span class="material-symbols-outlined flip-rtl">arrow_forward</span>
                </a>
                <a routerLink="/auth/login" class="btn-cta-secondary">
                  <span>{{ langService.isRtl() ? 'تسجيل الدخول' : 'Sign In' }}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================================================================= -->
      <!-- FOOTER (NO GITHUB LINK, CLEAN ENTERPRISE STRUCTURE)               -->
      <!-- ================================================================= -->
      <footer class="landing-footer">
        <div class="footer-container">
          <div class="footer-top-grid">
            <!-- Brand Column -->
            <div class="footer-col-brand">
              <div class="f-brand">
                <img src="/sehati_logo.png" alt="Sehati" class="f-logo" />
                <div class="f-titles">
                  <span class="f-ar">صِحّتي</span>
                  <span class="f-en">SEHATI PLATFORM</span>
                </div>
              </div>
              <p class="f-desc">
                {{ langService.isRtl()
                  ? 'المنظومة الوطنية الموحدة للسجلات الصحية في جمهورية مصر العربية. مريض واحد، سجل طبي موحد، رعاية صحية أفضل.'
                  : 'The national centralized digital infrastructure linking patient health passports, polyclinics, and emergency triage in Egypt.' }}
              </p>
              <div class="f-egypt-pill">
                <span>🇪🇬 Arab Republic of Egypt • 2026</span>
              </div>
            </div>

            <!-- Portals Column -->
            <div class="footer-col-links">
              <h4>{{ langService.isRtl() ? 'بوابات النظام' : 'Portals' }}</h4>
              <ul>
                <li><a routerLink="/passport">{{ langService.isRtl() ? 'جواز صحتي الطبي' : 'Patient Passport' }}</a></li>
                <li><a routerLink="/doctor/queue">{{ langService.isRtl() ? 'عيادة الطبيب والروشتة' : 'Doctor Consultation' }}</a></li>
                <li><a routerLink="/receptionist">{{ langService.isRtl() ? 'مكتب الاستقبال والطوابير' : 'Reception Desk' }}</a></li>
                <li><a routerLink="/clinic/admin">{{ langService.isRtl() ? 'إدارة المنشأة والعيادة' : 'Clinic Admin' }}</a></li>
                <li><a routerLink="/admin/audit">{{ langService.isRtl() ? 'سجل العمليات الأمني' : 'Security Audit Trail' }}</a></li>
              </ul>
            </div>

            <!-- Quick Links -->
            <div class="footer-col-links">
              <h4>{{ langService.isRtl() ? 'خدمات سريعة' : 'Quick Access' }}</h4>
              <ul>
                <li><a routerLink="/auth/login">{{ langService.isRtl() ? 'تسجيل الدخول' : 'Sign In' }}</a></li>
                <li><a routerLink="/auth/register">{{ langService.isRtl() ? 'إنشاء حساب جديد' : 'Register Account' }}</a></li>
                <li><a routerLink="/preview">{{ langService.isRtl() ? 'استعراض الهيكلية والأنظمة' : 'Architecture Showcase' }}</a></li>
                <li><a routerLink="/emergency">{{ langService.isRtl() ? 'طوارئ QR السريعة' : 'Emergency Rescue QR' }}</a></li>
              </ul>
            </div>

            <!-- Legal & Support (Replaces GitHub) -->
            <div class="footer-col-links">
              <h4>{{ langService.isRtl() ? 'الدعم والخصوصية' : 'Legal & Support' }}</h4>
              <ul>
                <li><a href="#faq">{{ langService.isRtl() ? 'الأسئلة الشائعة' : 'FAQ' }}</a></li>
                <li><a href="#hero">{{ langService.isRtl() ? 'سياسة الخصوصية وأمان البيانات' : 'Privacy Policy' }}</a></li>
                <li><a href="#hero">{{ langService.isRtl() ? 'الشروط والأحكام' : 'Terms of Service' }}</a></li>
                <li><a href="#hero">{{ langService.isRtl() ? 'مركز المساعدة والدعم الفني' : 'Help & Support' }}</a></li>
              </ul>
            </div>
          </div>

          <div class="footer-bottom-bar">
            <p>© 2026 Sehati Smart Healthcare Platform. All rights reserved.</p>
            <div class="footer-trust-tags">
              <span>HIPAA Compliant</span>
              <span>•</span>
              <span>AES-256 Encrypted</span>
              <span>•</span>
              <span>Zero-Trust Architecture</span>
            </div>
          </div>
        </div>
      </footer>

      <!-- Floating Emergency Rescue Button -->
      <a routerLink="/emergency" class="floating-rescue-fab" [title]="langService.isRtl() ? 'طوارئ الإسعاف والإنقاذ السريع' : 'Emergency Quick Rescue'">
        <span class="material-symbols-outlined fab-icon">emergency</span>
      </a>
    </div>
  `,
  styles: [`
    /* ==========================================================================
       SEHATI WORLD-CLASS HEALTHCARE LANDING PAGE
       Clean, spacious, high-contrast, zero overlapping chips
       ========================================================================== */

    .landing-page {
      position: relative;
      min-height: 100vh;
      background-color: var(--color-bg-app, #F8FAFC);
      color: var(--color-text-main, #0F172A);
      font-family: var(--font-latin, 'Plus Jakarta Sans', sans-serif);
      overflow-x: hidden;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    .landing-page.rtl {
      direction: rtl;
      font-family: var(--font-arabic, 'Cairo', sans-serif);

      .flip-rtl {
        transform: rotate(180deg);
      }
    }

    /* Ambient Glow */
    .ambient-glow {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      filter: blur(120px);
      z-index: 0;
      opacity: 0.55;
    }

    .glow-top-right {
      top: -80px;
      right: 5%;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(8, 131, 149, 0.15) 0%, transparent 70%);
    }

    .glow-top-left {
      top: -60px;
      left: 5%;
      width: 450px;
      height: 450px;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%);
    }

    /* TOP NAVBAR */
    .top-navbar {
      position: sticky;
      top: 0;
      width: 100%;
      z-index: 100;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--color-border-subtle, #E2E8F0);
      transition: all 0.3s ease;
    }

    :host-context([data-theme="dark"]) .top-navbar,
    :host-context(.dark-theme) .top-navbar {
      background: rgba(8, 38, 53, 0.92);
      border-bottom-color: rgba(5, 191, 219, 0.14);
    }

    .nav-container {
      max-width: 1300px;
      margin: 0 auto;
      padding: 0.9rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: inherit;
    }

    .brand-logo-frame {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(8, 131, 149, 0.12), rgba(5, 191, 219, 0.22));
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(8, 131, 149, 0.15);
      border: 1px solid rgba(8, 131, 149, 0.2);
    }

    .brand-img {
      width: 26px;
      height: 26px;
      object-fit: contain;
    }

    .brand-typography {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }

    .brand-ar {
      font-size: 1.3rem;
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

    .nav-menu {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .nav-link {
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--color-text-muted, #64748B);
      transition: color 0.2s ease;
      padding: 0.35rem 0.5rem;
      border-radius: 8px;
    }

    .nav-link:hover {
      color: var(--color-primary-base, #088395);
    }

    /* Streamlined Dropdown Navigation */
    .nav-dropdown-wrapper {
      position: relative;
    }

    .nav-dropdown-trigger {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: transparent;
      border: none;
      font-family: inherit;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--color-text-muted, #64748B);
      cursor: pointer;
      padding: 0.35rem 0.65rem;
      border-radius: 9999px;
      transition: all 0.2s ease;
    }

    .nav-dropdown-trigger:hover,
    .nav-dropdown-wrapper.open .nav-dropdown-trigger {
      color: var(--color-primary-base, #088395);
      background: rgba(8, 131, 149, 0.08);
    }

    .dropdown-chevron {
      font-size: 1.2rem;
      transition: transform 0.25s ease;
    }

    .nav-dropdown-wrapper.open .dropdown-chevron {
      transform: rotate(180deg);
    }

    .nav-dropdown-menu {
      position: absolute;
      top: calc(100% + 0.65rem);
      inset-inline-start: 50%;
      transform: translateX(-50%) translateY(8px);
      width: 320px;
      background: var(--color-surface-card, #FFFFFF);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      border-radius: 18px;
      padding: 0.65rem;
      box-shadow: 0 16px 40px -10px rgba(10, 77, 104, 0.18), 0 4px 12px rgba(0, 0, 0, 0.04);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 100;
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
    }

    .landing-page.rtl .nav-dropdown-menu {
      transform: translateX(50%) translateY(8px);
    }

    .nav-dropdown-wrapper:hover .nav-dropdown-menu,
    .nav-dropdown-menu.show {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      transform: translateX(-50%) translateY(0);
    }

    .landing-page.rtl .nav-dropdown-wrapper:hover .nav-dropdown-menu,
    .landing-page.rtl .nav-dropdown-menu.show {
      transform: translateX(50%) translateY(0);
    }

    :host-context([data-theme="dark"]) .nav-dropdown-menu,
    :host-context(.dark-theme) .nav-dropdown-menu {
      background: rgba(8, 38, 53, 0.98);
      border-color: rgba(5, 191, 219, 0.25);
      box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.7);
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.65rem 0.75rem;
      border-radius: 12px;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
    }

    .dropdown-item:hover {
      background: rgba(8, 131, 149, 0.08);
      transform: translateX(-2px);
    }

    .landing-page.rtl .dropdown-item:hover {
      transform: translateX(2px);
    }

    :host-context([data-theme="dark"]) .dropdown-item:hover,
    :host-context(.dark-theme) .dropdown-item:hover {
      background: rgba(5, 191, 219, 0.12);
    }

    .dropdown-item-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .dropdown-item-icon.teal {
      background: rgba(8, 131, 149, 0.12);
      color: #088395;
    }

    .dropdown-item-icon.blue {
      background: rgba(2, 132, 199, 0.12);
      color: #0284C7;
    }

    .dropdown-item-icon.amber {
      background: rgba(217, 119, 6, 0.12);
      color: #D97706;
    }

    .dropdown-item-icon.accent {
      background: linear-gradient(135deg, rgba(8, 131, 149, 0.2), rgba(5, 191, 219, 0.3));
      color: #088395;
    }

    :host-context([data-theme="dark"]) .dropdown-item-icon.accent,
    :host-context(.dark-theme) .dropdown-item-icon.accent {
      color: #05BFDB;
    }

    .dropdown-item-icon .material-symbols-outlined {
      font-size: 1.25rem;
    }

    .dropdown-item-text {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      line-height: 1.2;
    }

    .item-title {
      font-size: 0.9rem;
      font-weight: 800;
      color: var(--color-text-main, #0F172A);
    }

    .item-desc {
      font-size: 0.74rem;
      color: var(--color-text-muted, #64748B);
    }

    .dropdown-divider {
      height: 1px;
      background: var(--color-border-subtle, #E2E8F0);
      margin: 0.35rem 0.5rem;
    }

    :host-context([data-theme="dark"]) .dropdown-divider,
    :host-context(.dark-theme) .dropdown-divider {
      background: rgba(5, 191, 219, 0.15);
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .icon-action-btn {
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
      transition: all 0.2s ease;
    }

    .icon-action-btn:hover {
      border-color: var(--color-primary-base, #088395);
      color: var(--color-primary-base, #088395);
    }

    .lang-action-btn {
      height: 40px;
      padding: 0 0.9rem;
      border-radius: 9999px;
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      background: var(--color-surface-card, #FFFFFF);
      color: var(--color-text-main, #0F172A);
      font-size: 0.88rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .lang-action-btn:hover {
      border-color: var(--color-primary-base, #088395);
      color: var(--color-primary-base, #088395);
    }

    .login-text-btn {
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--color-text-main, #0F172A);
      padding: 0.5rem 0.85rem;
      transition: color 0.2s ease;
    }

    .login-text-btn:hover {
      color: var(--color-primary-base, #088395);
    }

    .join-pill-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.65rem 1.4rem;
      background: var(--color-primary-base, #088395);
      color: #FFFFFF;
      font-size: 0.95rem;
      font-weight: 700;
      border-radius: 9999px;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(8, 131, 149, 0.28);
      transition: all 0.25s ease;
    }

    .join-pill-btn:hover {
      background: var(--color-primary-dark, #0A4D68);
      transform: translateY(-1px);
    }

    .join-pill-btn.dashboard-pill {
      background: linear-gradient(135deg, #088395, #0A4D68);
    }

    .mobile-toggle-btn {
      display: none;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      background: transparent;
      color: inherit;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .mobile-drawer {
      display: none;
    }

    /* ================================================================= */
    /* HERO SECTION                                                      */
    /* ================================================================= */
    .hero-section {
      padding: 4rem 1.5rem 5rem 1.5rem;
      max-width: 1300px;
      margin: 0 auto;
      position: relative;
      z-index: 2;
    }

    .hero-container {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      align-items: center;
      gap: 3.5rem;
    }

    .hero-text-col {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .hero-national-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.45rem 1.1rem;
      border-radius: 9999px;
      background: rgba(8, 131, 149, 0.08);
      border: 1px solid rgba(8, 131, 149, 0.22);
      color: var(--color-primary-base, #088395);
      font-size: 0.88rem;
      font-weight: 700;
      width: fit-content;
    }

    :host-context([data-theme="dark"]) .hero-national-badge,
    :host-context(.dark-theme) .hero-national-badge {
      background: rgba(5, 191, 219, 0.12);
      border-color: rgba(5, 191, 219, 0.3);
      color: #05BFDB;
    }

    .flag-icon {
      font-size: 1.15rem;
    }

    .hero-headline {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 3.4rem;
      font-weight: 900;
      line-height: 1.2;
      color: var(--color-text-main, #0F172A);
      letter-spacing: -0.5px;
      margin: 0;
    }

    .landing-page.rtl .hero-headline {
      font-family: var(--font-arabic, 'Cairo', sans-serif);
      line-height: 1.3;
    }

    .headline-accent {
      color: var(--color-primary-base, #088395);
      background: linear-gradient(120deg, #088395, #05BFDB);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    :host-context([data-theme="dark"]) .headline-accent,
    :host-context(.dark-theme) .headline-accent {
      background: linear-gradient(120deg, #05BFDB, #38BDF8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-subtext {
      font-size: 1.15rem;
      line-height: 1.85;
      color: var(--color-text-muted, #64748B);
      max-width: 580px;
      margin: 0;
    }

    .hero-cta-wrapper {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      margin-top: 0.5rem;
    }

    .btn-hero-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.95rem 2.25rem;
      background: var(--color-primary-base, #088395);
      color: #FFFFFF;
      font-size: 1.05rem;
      font-weight: 800;
      border-radius: 9999px;
      text-decoration: none;
      box-shadow: 0 8px 25px rgba(8, 131, 149, 0.35);
      transition: all 0.25s ease;
    }

    .btn-hero-primary:hover {
      background: var(--color-primary-dark, #0A4D68);
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(8, 131, 149, 0.45);
    }

    .btn-hero-secondary {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.95rem 1.85rem;
      background: var(--color-surface-card, #FFFFFF);
      color: var(--color-text-main, #0F172A);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      font-size: 1.05rem;
      font-weight: 700;
      border-radius: 9999px;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
      transition: all 0.25s ease;
    }

    .btn-hero-secondary:hover {
      border-color: var(--color-primary-base, #088395);
      color: var(--color-primary-base, #088395);
      transform: translateY(-2px);
    }

    /* Structured Trust Metrics (Neat and solid) */
    .hero-trust-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-top: 1rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--color-border-subtle, #E2E8F0);
    }

    .metric-pill {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .metric-icon {
      font-size: 1.75rem;
      color: var(--color-primary-base, #088395);
    }

    .metric-info {
      display: flex;
      flex-direction: column;
      line-height: 1.25;
    }

    .metric-info strong {
      font-size: 0.95rem;
      color: var(--color-text-main, #0F172A);
    }

    .metric-info span {
      font-size: 0.78rem;
      color: var(--color-text-muted, #64748B);
    }

    /* ================================================================= */
    /* HERO VISUAL: SMART HEALTH PASSPORT TERMINAL CARD                   */
    /* ================================================================= */
    .hero-visual-col {
      display: flex;
      justify-content: center;
    }

    .passport-terminal-card {
      width: 100%;
      max-width: 480px;
      background: var(--color-surface-card, #FFFFFF);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      border-radius: 28px;
      padding: 1.85rem;
      box-shadow: 0 20px 45px -10px rgba(8, 131, 149, 0.12), 0 4px 14px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      gap: 1.35rem;
      transition: all 0.3s ease;
    }

    :host-context([data-theme="dark"]) .passport-terminal-card,
    :host-context(.dark-theme) .passport-terminal-card {
      background: #082635;
      border-color: rgba(5, 191, 219, 0.22);
      box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.6);
    }

    .terminal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--color-border-subtle, #E2E8F0);
    }

    .t-brand {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .t-logo {
      width: 28px;
      height: 28px;
      object-fit: contain;
    }

    .t-title-ar {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--color-primary-dark, #0A4D68);
    }

    :host-context([data-theme="dark"]) .t-title-ar,
    :host-context(.dark-theme) .t-title-ar {
      color: #05BFDB;
    }

    .t-title-en {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: var(--color-text-muted, #64748B);
    }

    .t-chip-nfc {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .smart-chip-icon {
      width: 28px;
      height: 22px;
      border-radius: 4px;
      background: linear-gradient(135deg, #F59E0B, #D97706);
      border: 1px solid #B45309;
    }

    .nfc-icon {
      font-size: 1.4rem;
      color: var(--color-text-muted, #64748B);
    }

    /* Screen Selector Tabs */
    .terminal-nav-tabs {
      display: flex;
      background: rgba(8, 131, 149, 0.05);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      border-radius: 14px;
      padding: 0.25rem;
      gap: 0.25rem;
    }

    .t-tab-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      padding: 0.55rem 0.35rem;
      border-radius: 10px;
      border: none;
      background: transparent;
      color: var(--color-text-muted, #64748B);
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .t-tab-btn:hover {
      color: var(--color-primary-base, #088395);
    }

    .t-tab-btn.active {
      background: var(--color-surface-card, #FFFFFF);
      color: var(--color-primary-base, #088395);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    :host-context([data-theme="dark"]) .t-tab-btn.active,
    :host-context(.dark-theme) .t-tab-btn.active {
      background: #0B3347;
      color: #05BFDB;
    }

    .terminal-screen {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Screen 0: Health Passport */
    .id-banner-block {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(8, 131, 149, 0.06);
      border: 1px solid rgba(8, 131, 149, 0.18);
      border-radius: 16px;
      padding: 1rem 1.25rem;
    }

    .id-code-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .id-label {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 1px;
      color: var(--color-text-muted, #64748B);
    }

    .id-number {
      font-size: 1.45rem;
      font-weight: 900;
      color: var(--color-primary-dark, #0A4D68);
      letter-spacing: 0.5px;
    }

    :host-context([data-theme="dark"]) .id-number,
    :host-context(.dark-theme) .id-number {
      color: #05BFDB;
    }

    .blood-group-badge {
      font-size: 1.25rem;
      font-weight: 900;
      background: #EF4444;
      color: #FFFFFF;
      padding: 0.35rem 0.85rem;
      border-radius: 12px;
      box-shadow: 0 4px 10px rgba(239, 68, 68, 0.25);
    }

    .patient-profile-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .p-field {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .f-lbl {
      font-size: 0.75rem;
      color: var(--color-text-muted, #64748B);
    }

    .f-val {
      font-size: 0.95rem;
      font-weight: 700;
    }

    .verified-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: #059669;
      font-size: 0.8rem;
    }

    .verified-tag .material-symbols-outlined {
      font-size: 1.1rem;
    }

    .terminal-footer-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border-subtle, #E2E8F0);
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--color-text-muted, #64748B);
    }

    .encryption-badge,
    .consent-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .consent-status-badge {
      color: #059669;
    }

    /* Screen 1: Emergency QR */
    .er-rescue-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.25);
      border-radius: 14px;
      padding: 0.85rem 1rem;
      color: #DC2626;
      font-size: 0.85rem;
    }

    .er-alert-icon {
      font-size: 1.75rem;
      flex-shrink: 0;
    }

    .er-rescue-banner p {
      margin: 0;
      font-size: 0.75rem;
      opacity: 0.9;
    }

    .er-content-layout {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .qr-visual-box {
      width: 108px;
      height: 108px;
      background: #FFFFFF;
      border: 2px solid #EF4444;
      border-radius: 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: #0F172A;
      padding: 0.35rem 0.25rem;
      box-sizing: border-box;
      overflow: hidden;
    }

    .qr-big-icon {
      font-size: 3.25rem;
      line-height: 1;
      margin-bottom: 2px;
    }

    .qr-scan-label {
      font-size: 0.58rem;
      font-weight: 800;
      letter-spacing: 0.3px;
      color: #DC2626;
      text-transform: uppercase;
      text-align: center;
      white-space: nowrap;
      line-height: 1.1;
      display: block;
    }

    .er-critical-details {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
      font-size: 0.88rem;
    }

    .er-detail-item {
      display: flex;
      flex-direction: column;
    }

    .er-detail-item .lbl {
      font-size: 0.75rem;
      color: var(--color-text-muted, #64748B);
    }

    .er-detail-item.allergy-alert .val {
      color: #DC2626;
      font-weight: 800;
    }

    /* Screen 2: Prescription */
    .rx-header-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(8, 131, 149, 0.06);
      border-radius: 12px;
      padding: 0.75rem 1rem;
    }

    .rx-doc-name {
      display: block;
      font-weight: 800;
      font-size: 0.92rem;
    }

    .rx-doc-spec {
      font-size: 0.75rem;
      color: var(--color-text-muted, #64748B);
    }

    .rx-pill-tag {
      font-size: 0.72rem;
      font-weight: 800;
      background: var(--color-primary-base, #088395);
      color: #FFFFFF;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
    }

    .rx-medicines-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .rx-med-card {
      background: rgba(8, 131, 149, 0.04);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      border-radius: 12px;
      padding: 0.65rem 0.85rem;
    }

    .med-name {
      font-weight: 800;
      font-size: 0.9rem;
    }

    .med-instructions {
      font-size: 0.78rem;
      color: var(--color-text-muted, #64748B);
      margin-top: 0.15rem;
    }

    .rx-signature-seal {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.78rem;
      color: #059669;
      font-weight: 700;
    }

    /* Screen 3: Vitals */
    .vitals-header-banner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--color-text-muted, #64748B);
    }

    .vitals-pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 8px #10B981;
    }

    .vitals-matrix-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.85rem;
    }

    .vital-tile {
      background: rgba(8, 131, 149, 0.04);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      border-radius: 14px;
      padding: 0.85rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .v-icon { font-size: 1.5rem; }
    .v-icon.red { color: #EF4444; }
    .v-icon.teal { color: #088395; }
    .v-icon.amber { color: #F59E0B; }
    .v-icon.purple { color: #8B5CF6; }

    .v-value {
      font-size: 1.25rem;
      font-weight: 900;
    }

    .v-label {
      font-size: 0.75rem;
      color: var(--color-text-muted, #64748B);
    }

    .font-mono {
      font-family: monospace;
    }

    /* ================================================================= */
    /* ROLES & WORKSPACES EXPLORER                                       */
    /* ================================================================= */
    .roles-section {
      padding: 6rem 1.5rem;
      background: rgba(255, 255, 255, 0.5);
      border-top: 1px solid var(--color-border-subtle, #E2E8F0);
      border-bottom: 1px solid var(--color-border-subtle, #E2E8F0);
    }

    :host-context([data-theme="dark"]) .roles-section,
    :host-context(.dark-theme) .roles-section {
      background: rgba(8, 38, 53, 0.4);
    }

    .section-container {
      max-width: 1240px;
      margin: 0 auto;
    }

    .section-title-block {
      text-align: center;
      margin-bottom: 3rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    .section-tag-pill {
      display: inline-block;
      padding: 0.35rem 1rem;
      background: rgba(8, 131, 149, 0.08);
      border: 1px solid rgba(8, 131, 149, 0.2);
      border-radius: 9999px;
      color: var(--color-primary-base, #088395);
      font-size: 0.85rem;
      font-weight: 800;
      letter-spacing: 1px;
    }

    .section-headline {
      font-size: 2.75rem;
      font-weight: 900;
      color: var(--color-text-main, #0F172A);
      letter-spacing: -0.5px;
      line-height: 1.25;
      margin: 0;
    }

    .section-subheadline {
      font-size: 1.1rem;
      line-height: 1.75;
      color: var(--color-text-muted, #64748B);
      max-width: 680px;
      margin: 0;
    }

    .roles-nav-bar {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.65rem;
      margin-bottom: 2.5rem;
    }

    .role-pill-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.65rem 1.15rem;
      border-radius: 9999px;
      border: 1.5px solid var(--color-border-subtle, #E2E8F0);
      background: var(--color-surface-card, #FFFFFF);
      color: var(--color-text-main, #0F172A);
      font-size: 0.92rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.25s ease;
    }

    :host-context([data-theme="dark"]) .role-pill-btn,
    :host-context(.dark-theme) .role-pill-btn {
      background: #082635;
      border-color: rgba(5, 191, 219, 0.2);
    }

    .role-pill-btn:hover {
      border-color: var(--role-color, #088395);
      color: var(--role-color, #088395);
      transform: translateY(-2px);
    }

    .role-pill-btn.active {
      background: var(--role-color, #088395);
      border-color: var(--role-color, #088395);
      color: #FFFFFF;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
    }

    .role-console-card {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 3rem;
      align-items: center;
      background: var(--color-surface-card, #FFFFFF);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      border-radius: 28px;
      padding: 3rem;
      box-shadow: 0 16px 40px -10px rgba(8, 131, 149, 0.1);
    }

    :host-context([data-theme="dark"]) .role-console-card,
    :host-context(.dark-theme) .role-console-card {
      background: #082635;
      border-color: rgba(5, 191, 219, 0.22);
    }

    .console-info-col {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .console-role-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.35rem 0.95rem;
      border-radius: 9999px;
      font-size: 0.88rem;
      font-weight: 800;
      width: fit-content;
    }

    .console-title {
      font-size: 2rem;
      font-weight: 900;
      color: var(--color-text-main, #0F172A);
      letter-spacing: -0.5px;
      margin: 0;
      line-height: 1.3;
    }

    .console-desc {
      font-size: 1.05rem;
      line-height: 1.75;
      color: var(--color-text-muted, #64748B);
      margin: 0;
    }

    .console-bullets-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin: 0.5rem 0;
    }

    .bullet-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-size: 0.95rem;
      font-weight: 600;
    }

    .check-mark {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .btn-console-launch {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      padding: 0.85rem 1.85rem;
      border-radius: 9999px;
      color: #FFFFFF;
      font-size: 0.95rem;
      font-weight: 800;
      text-decoration: none;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
      transition: all 0.25s ease;
      width: fit-content;
    }

    .btn-console-launch:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
    }

    .console-preview-col {
      display: flex;
      justify-content: center;
    }

    .mockup-frame {
      width: 100%;
      max-width: 400px;
      background: var(--color-bg-app, #F8FAFC);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    }

    :host-context([data-theme="dark"]) .mockup-frame,
    :host-context(.dark-theme) .mockup-frame {
      background: #031B26;
      border-color: rgba(5, 191, 219, 0.2);
    }

    .mockup-top-bar {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.65rem 1rem;
      background: rgba(0, 0, 0, 0.03);
      border-bottom: 1px solid var(--color-border-subtle, #E2E8F0);
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .dot.red { background: #EF4444; }
    .dot.yellow { background: #F59E0B; }
    .dot.green { background: #10B981; }

    .mockup-url {
      font-size: 0.72rem;
      font-family: monospace;
      color: var(--color-text-muted, #64748B);
      margin-inline-start: auto;
    }

    .mockup-body {
      padding: 2.5rem 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .mockup-hero-icon {
      width: 64px;
      height: 64px;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .mockup-hero-icon .material-symbols-outlined {
      font-size: 2.25rem;
    }

    .mockup-body h4 {
      font-size: 1.15rem;
      font-weight: 800;
      margin: 0;
    }

    .mockup-body p {
      font-size: 0.85rem;
      color: var(--color-text-muted, #64748B);
      margin: 0;
    }

    .mockup-tags {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .mockup-tags span {
      font-size: 0.72rem;
      font-weight: 800;
      padding: 0.2rem 0.6rem;
      background: rgba(8, 131, 149, 0.08);
      border-radius: 6px;
      color: var(--color-primary-base, #088395);
    }

    /* ================================================================= */
    /* HOW IT WORKS SECTION                                              */
    /* ================================================================= */
    .how-it-works-section {
      padding: 6rem 1.5rem;
    }

    .steps-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }

    .step-card {
      position: relative;
      background: var(--color-surface-card, #FFFFFF);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      border-radius: 24px;
      padding: 2.5rem 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: all 0.3s ease;
      overflow: hidden;
    }

    :host-context([data-theme="dark"]) .step-card,
    :host-context(.dark-theme) .step-card {
      background: #082635;
      border-color: rgba(5, 191, 219, 0.16);
    }

    .step-card:hover {
      transform: translateY(-4px);
      border-color: var(--color-primary-base, #088395);
      box-shadow: 0 16px 35px -10px rgba(8, 131, 149, 0.15);
    }

    .step-watermark {
      position: absolute;
      top: 1rem;
      right: 1.5rem;
      font-size: 3.5rem;
      font-weight: 900;
      color: rgba(8, 131, 149, 0.08);
      font-family: monospace;
      line-height: 1;
    }

    .landing-page.rtl .step-watermark {
      right: auto;
      left: 1.5rem;
    }

    .step-icon-box {
      width: 50px;
      height: 50px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .step-icon-box.teal { background: rgba(8, 131, 149, 0.12); color: #088395; }
    .step-icon-box.orange { background: rgba(245, 158, 11, 0.12); color: #D97706; }
    .step-icon-box.purple { background: rgba(139, 92, 246, 0.12); color: #8B5CF6; }

    .step-icon-box .material-symbols-outlined {
      font-size: 1.75rem;
    }

    .step-title {
      font-size: 1.25rem;
      font-weight: 800;
      margin: 0;
      line-height: 1.35;
    }

    .step-desc {
      font-size: 0.95rem;
      line-height: 1.75;
      color: var(--color-text-muted, #64748B);
      margin: 0;
    }

    /* ================================================================= */
    /* CAPABILITIES GRID                                                 */
    /* ================================================================= */
    .capabilities-section {
      padding: 6rem 1.5rem;
      background: rgba(255, 255, 255, 0.5);
    }

    :host-context([data-theme="dark"]) .capabilities-section,
    :host-context(.dark-theme) .capabilities-section {
      background: rgba(8, 38, 53, 0.3);
    }

    .capabilities-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.75rem;
    }

    .cap-card {
      background: var(--color-surface-card, #FFFFFF);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      border-radius: 20px;
      padding: 2.25rem 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      transition: all 0.3s ease;
    }

    :host-context([data-theme="dark"]) .cap-card,
    :host-context(.dark-theme) .cap-card {
      background: #082635;
      border-color: rgba(5, 191, 219, 0.16);
    }

    .cap-card:hover {
      transform: translateY(-3px);
      border-color: var(--color-primary-base, #088395);
      box-shadow: 0 12px 28px -5px rgba(8, 131, 149, 0.12);
    }

    .cap-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    .cap-icon-box.teal { background: rgba(8, 131, 149, 0.1); color: #088395; }
    .cap-icon-box.ocean { background: rgba(10, 77, 104, 0.1); color: #0A4D68; }
    .cap-icon-box.red { background: rgba(239, 68, 68, 0.1); color: #DC2626; }
    .cap-icon-box.mint { background: rgba(5, 191, 219, 0.15); color: #088395; }
    .cap-icon-box.amber { background: rgba(245, 158, 11, 0.1); color: #D97706; }
    .cap-icon-box.purple { background: rgba(139, 92, 246, 0.1); color: #8B5CF6; }

    .cap-icon-box .material-symbols-outlined {
      font-size: 1.65rem;
    }

    .cap-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--color-text-main, #0F172A);
      margin: 0;
    }

    .cap-desc {
      font-size: 0.92rem;
      line-height: 1.7;
      color: var(--color-text-muted, #64748B);
      margin: 0;
    }

    /* ================================================================= */
    /* FAQ SECTION (Accordion)                                           */
    /* ================================================================= */
    .faq-section {
      padding: 6rem 1.5rem;
    }

    .faq-accordion-list {
      max-width: 860px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .faq-card-item {
      background: var(--color-surface-card, #FFFFFF);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      border-radius: 16px;
      padding: 1.35rem 1.75rem;
      cursor: pointer;
      transition: all 0.25s ease;
    }

    :host-context([data-theme="dark"]) .faq-card-item,
    :host-context(.dark-theme) .faq-card-item {
      background: #082635;
      border-color: rgba(5, 191, 219, 0.15);
    }

    .faq-card-item:hover {
      border-color: var(--color-primary-base, #088395);
    }

    .faq-card-item.open {
      border-color: var(--color-primary-base, #088395);
      box-shadow: 0 8px 24px rgba(8, 131, 149, 0.08);
    }

    .faq-question-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .faq-q-text {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--color-text-main, #0F172A);
    }

    .expand-icon {
      font-size: 1.35rem;
      color: var(--color-primary-base, #088395);
    }

    .faq-answer-panel {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border-subtle, #E2E8F0);
      font-size: 0.95rem;
      line-height: 1.75;
      color: var(--color-text-muted, #64748B);
    }

    /* ================================================================= */
    /* CTA BANNER                                                        */
    /* ================================================================= */
    .cta-banner-section {
      padding: 4rem 1.5rem;
    }

    .cta-modern-box {
      background: linear-gradient(135deg, #0A4D68 0%, #088395 50%, #05BFDB 100%);
      border-radius: 32px;
      padding: 4.5rem 2.5rem;
      color: #FFFFFF;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(8, 131, 149, 0.4);
    }

    .cta-inner-content {
      max-width: 720px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
    }

    .cta-mini-tag {
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 2px;
      background: rgba(255, 255, 255, 0.15);
      padding: 0.35rem 0.95rem;
      border-radius: 9999px;
    }

    .cta-main-title {
      font-size: 2.6rem;
      font-weight: 900;
      line-height: 1.25;
      margin: 0;
    }

    .cta-subtext {
      font-size: 1.15rem;
      line-height: 1.75;
      opacity: 0.92;
      margin: 0;
    }

    .cta-buttons-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: center;
      margin-top: 0.75rem;
    }

    .btn-cta-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.95rem 2.25rem;
      background: #FFFFFF;
      color: #0A4D68;
      font-size: 1.05rem;
      font-weight: 800;
      border-radius: 9999px;
      text-decoration: none;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      transition: all 0.25s ease;
    }

    .btn-cta-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
    }

    .btn-cta-secondary {
      display: inline-flex;
      align-items: center;
      padding: 0.95rem 2rem;
      background: rgba(255, 255, 255, 0.15);
      color: #FFFFFF;
      border: 1px solid rgba(255, 255, 255, 0.35);
      font-size: 1.05rem;
      font-weight: 700;
      border-radius: 9999px;
      text-decoration: none;
      transition: all 0.25s ease;
    }

    .btn-cta-secondary:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: translateY(-2px);
    }

    /* ================================================================= */
    /* FOOTER                                                            */
    /* ================================================================= */
    .landing-footer {
      background: var(--color-surface-card, #FFFFFF);
      border-top: 1px solid var(--color-border-subtle, #E2E8F0);
      padding: 4.5rem 1.5rem 2.5rem 1.5rem;
    }

    :host-context([data-theme="dark"]) .landing-footer,
    :host-context(.dark-theme) .landing-footer {
      background: #031B26;
      border-color: rgba(5, 191, 219, 0.14);
    }

    .footer-container {
      max-width: 1240px;
      margin: 0 auto;
    }

    .footer-top-grid {
      display: grid;
      grid-template-columns: 1.6fr 1fr 1fr 1fr;
      gap: 2.5rem;
      margin-bottom: 3.5rem;
    }

    .footer-col-brand {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .f-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .f-logo {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }

    .f-titles {
      display: flex;
      flex-direction: column;
    }

    .f-ar {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--color-primary-dark, #0A4D68);
    }

    :host-context([data-theme="dark"]) .f-ar,
    :host-context(.dark-theme) .f-ar {
      color: #05BFDB;
    }

    .f-en {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: var(--color-text-muted, #64748B);
    }

    .f-desc {
      font-size: 0.95rem;
      line-height: 1.7;
      color: var(--color-text-muted, #64748B);
      max-width: 440px;
      margin: 0;
    }

    .f-egypt-pill {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--color-text-muted, #64748B);
    }

    .footer-col-links h4 {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--color-text-main, #0F172A);
      margin-bottom: 1.25rem;
    }

    .footer-col-links ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .footer-col-links a {
      text-decoration: none;
      font-size: 0.92rem;
      color: var(--color-text-muted, #64748B);
      transition: color 0.2s ease;
    }

    .footer-col-links a:hover {
      color: var(--color-primary-base, #088395);
    }

    .footer-bottom-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 2rem;
      border-top: 1px solid var(--color-border-subtle, #E2E8F0);
      font-size: 0.88rem;
      color: var(--color-text-muted, #64748B);
      flex-wrap: wrap;
      gap: 1rem;
    }

    .footer-trust-tags {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      font-weight: 600;
    }

    /* Floating Emergency FAB */
    .floating-rescue-fab {
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 99;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #059669;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(5, 150, 105, 0.4);
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .landing-page.rtl .floating-rescue-fab {
      left: 24px;
      right: auto;
    }

    .floating-rescue-fab:hover {
      transform: scale(1.1);
      box-shadow: 0 12px 30px rgba(5, 150, 105, 0.55);
      background: #047857;
    }

    .fab-icon {
      font-size: 1.85rem;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .hero-container {
        grid-template-columns: 1fr;
        gap: 3rem;
      }

      .hero-trust-metrics {
        grid-template-columns: 1fr;
      }

      .role-console-card {
        grid-template-columns: 1fr;
      }

      .steps-grid,
      .capabilities-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .footer-top-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .nav-menu {
        display: none;
      }

      .mobile-toggle-btn {
        display: flex;
      }

      .mobile-drawer {
        display: flex;
        flex-direction: column;
        padding: 1.25rem;
        background: var(--color-surface-card, #FFFFFF);
        border-top: 1px solid var(--color-border-subtle, #E2E8F0);
        gap: 0.85rem;
      }

      :host-context([data-theme="dark"]) .mobile-drawer,
      :host-context(.dark-theme) .mobile-drawer {
        background: #082635;
      }

      .drawer-item {
        text-decoration: none;
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-text-main, #0F172A);
        padding: 0.5rem 0;
      }

      .drawer-buttons {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
        margin-top: 0.5rem;
      }

      .btn-drawer-outline {
        display: block;
        text-align: center;
        padding: 0.75rem;
        border: 1px solid var(--color-border-subtle, #E2E8F0);
        border-radius: 9999px;
        text-decoration: none;
        font-weight: 700;
        color: inherit;
      }

      .btn-drawer-solid {
        display: block;
        text-align: center;
        padding: 0.75rem;
        background: var(--color-primary-base, #088395);
        color: #FFFFFF;
        border-radius: 9999px;
        text-decoration: none;
        font-weight: 700;
      }

      .hero-headline {
        font-size: 2.5rem;
      }

      .steps-grid,
      .capabilities-grid,
      .footer-top-grid {
        grid-template-columns: 1fr;
      }

      .role-console-card {
        padding: 1.75rem;
      }
    }
  `]
})
export class LandingComponent implements OnInit, OnDestroy {
  themeService = inject(ThemeService);
  langService = inject(LanguageService);
  authService = inject(AuthService);

  isMobileMenuOpen = false;
  isExploreMenuOpen = false;
  activePassportTab = 0;
  private tabInterval: any;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.nav-dropdown-wrapper')) {
      this.isExploreMenuOpen = false;
    }
  }

  toggleExploreMenu(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.isExploreMenuOpen = !this.isExploreMenuOpen;
  }

  closeExploreMenu(): void {
    this.isExploreMenuOpen = false;
  }

  rolesList: PersonaRole[] = [
    {
      id: 'patient',
      code: 'EG',
      nameEn: 'Citizen & Patient',
      nameAr: 'المريض والمواطن',
      headlineEn: 'Your Complete Health Record In Your Pocket',
      headlineAr: 'ملفك الطبي وسجلاتك بين يديك أينما كنت',
      descEn: 'Full ownership of your consultations, prescriptions, lab results, and instant emergency QR rescue profile.',
      descAr: 'تحكم كامل في سجلاتك الطبية، مواعيدك، وروشتاتك الرقمية مع بطاقة إنقاذ ذكية للطوارئ.',
      color: '#088395',
      icon: 'person',
      featuresEn: [
        'Unified National ID (SH-2026-XXXXXX)',
        'Zero-trust consent granting & revoking',
        'Certified digital prescriptions archive'
      ],
      featuresAr: [
        'كود صحي موحد يربط كافة المنشآت الطبية مدى الحياة',
        'محرك أذونات يمنحك التحكم الكامل في من يرى بياناتك',
        'أرشيف رقمي دائم للروشتات والتحاليل والأشعة'
      ],
      route: '/passport'
    },
    {
      id: 'doctor',
      code: 'MD',
      nameEn: 'Doctors & Specialists',
      nameAr: 'الأطباء والاستشاريون',
      headlineEn: 'Smart Clinical Practice & Digital Rx',
      headlineAr: 'عيادة سريرية ذكية وروشتات رقمية معتمدة',
      descEn: 'Instant patient history lookup with granted consent, structured encounter notes, ICD-10 coding, and tamper-proof prescriptions.',
      descAr: 'الاطلاع على التاريخ المرضي بعد إذن المريض، كشوفات سريعة، تشخيص ICD-10، وروشتات إلكترونية معتمدة.',
      color: '#10B981',
      icon: 'stethoscope',
      featuresEn: [
        'Real-time tokenized patient queue',
        'Automated BMI & vitals tracking',
        'Digitally signed tamper-proof prescriptions'
      ],
      featuresAr: [
        'طابور كشف ذكي منظم بالأرقام اللحظية',
        'قياس المؤشرات الحيوية وحساب كتلة الجسم آلياً',
        'إصدار روشتات رقمية مشفرة بتوقيع الطبيب'
      ],
      route: '/doctor/queue'
    },
    {
      id: 'clinic',
      code: 'CL',
      nameEn: 'Clinics & Hospitals',
      nameAr: 'العيادات والمستشفيات',
      headlineEn: 'Orchestrated Healthcare Operations',
      headlineAr: 'إدارة متكاملة للمنشأة والعيادات',
      descEn: 'Manage multi-specialty polyclinics, doctor schedules, room allocations, and patient flows without double booking.',
      descAr: 'تنظيم مواعيد العيادات، توزيع غرف الكشف، وإدارة الطاقة الاستيعابية بدقة فائقة وبدون تضارب.',
      color: '#F59E0B',
      icon: 'local_hospital',
      featuresEn: [
        'Collision-free appointment matrix',
        'Automated token generation for desks',
        'Clinic analytics & attendance metrics'
      ],
      featuresAr: [
        'جدولة مواعيد دقيقة تمنع الحجز المزدوج',
        'توليد أرقام انتظار ذكية لمكاتب الاستقبال',
        'تقارير تحليلية ومؤشرات أداء لحظية للعيادة'
      ],
      route: '/clinic/admin'
    },
    {
      id: 'paramedic',
      code: 'ER',
      nameEn: 'Paramedics & Ambulance',
      nameAr: 'طواقم الإسعاف والطوارئ',
      headlineEn: 'Rapid Rescue In Critical Seconds',
      headlineAr: 'إنقاذ فوري في الثواني الحرجة',
      descEn: 'Instant scan of emergency QR to retrieve blood group, severe drug allergies, and emergency ICE contacts anonymously.',
      descAr: 'مسح فوري لرمز QR لمعرفة فصيلة الدم، الحساسيات الدوائية الحرجة، وجهات اتصال الطوارئ دون كلمة مرور.',
      color: '#EF4444',
      icon: 'emergency',
      featuresEn: [
        'Under 2 seconds QR retrieval',
        'Critical allergy red alerts (Penicillin, etc.)',
        'One-tap ICE family emergency phone calls'
      ],
      featuresAr: [
        'استرجاع الملف الحرج في أقل من ثانيتين',
        'تنبيهات فورية للحساسيات القاتلة كالبنسلين',
        'اتصال فوري بأقارب المريض المسجلين كطوارئ'
      ],
      route: '/emergency'
    },
    {
      id: 'receptionist',
      code: 'RC',
      nameEn: 'Receptionists & Desk',
      nameAr: 'موظفو الاستقبال',
      headlineEn: 'Frictionless Patient Check-in',
      headlineAr: 'تسجيل دخول سريع وتنظيم صالات الانتظار',
      descEn: 'Verify patient identity with National ID, book immediate appointments, issue live token numbers, and manage waiting lounges.',
      descAr: 'التحقق الفوري من هوية المريض بالرقم القومي، حجز كشف فوري، وإصدار أرقام الانتظار للشاشات.',
      color: '#8B5CF6',
      icon: 'support_agent',
      featuresEn: [
        'National ID quick search in milliseconds',
        'Automated token issuance to exam rooms',
        'Live waiting room screen broadcasting'
      ],
      featuresAr: [
        'بحث فوري بالرقم القومي خلال أجزاء من الثانية',
        'توزيع الكشوفات على أطباء النوبتجية آلياً',
        'عرض الأرقام المناداة على شاشات الانتظار'
      ],
      route: '/receptionist'
    },
    {
      id: 'admin',
      code: 'AD',
      nameEn: 'Governance & Audit',
      nameAr: 'إدارة المنظومة والامتثال',
      headlineEn: 'Forensic Audit Trail & Zero Trust',
      headlineAr: 'رقابة أمنية صارمة وسجل غير قابل للتعديل',
      descEn: 'Comprehensive audit logging of every query, view, edit, and access attempt across the national healthcare network.',
      descAr: 'تسجيل غير قابل للتلاعب (WORM) لكل عملية دخول أو استعراض أو تعديل للسجلات الطبية لضمان النزاهة التامة.',
      color: '#475569',
      icon: 'admin_panel_settings',
      featuresEn: [
        'Cryptographic WORM audit log',
        'IP geolocation & anomaly detection',
        'Compliance reports for HIPAA and national law'
      ],
      featuresAr: [
        'سجل أمني مشفر غير قابل للمسح أو التعديل',
        'رصد محاولات الدخول المشبوهة وتحديد الموقع الجغرافي',
        'تقارير امتثال دورية وفقاً للقانون واللوائح'
      ],
      route: '/admin/audit'
    }
  ];

  selectedRole: PersonaRole = this.rolesList[0];

  faqList: FaqItem[] = [
    {
      qEn: 'What is Sehati platform and how does it protect my medical data?',
      qAr: 'ما هي منصة صحتي وكيف تحمي بياناتي وسجلاتي الطبية؟',
      aEn: 'Sehati is Egypt’s unified digital health infrastructure. Every citizen receives a unique health code. Data is protected with AES-256 encryption, and only healthcare providers you explicitly authorize can view your records.',
      aAr: 'صحتي هي المنظومة الوطنية الموحدة للسجلات الصحية في مصر. يحصل كل مواطن على كود صحي موحد، وتشفر البيانات بمعيار AES-256 ولا يمكن لأي طبيب الاطلاع عليها إلا بعد منحك الإذن الصريح له.',
      open: true
    },
    {
      qEn: 'How does the Emergency Rescue QR work during accidents?',
      qAr: 'كيف يعمل رمز طوارئ الإنقاذ السريع في حالات الحوادث والإسعاف؟',
      aEn: 'Each patient has an emergency profile accessible via a unique QR code. First responders can scan it to immediately read blood group, allergies, and emergency phone numbers without needing your account password.',
      aAr: 'يمتلك كل مواطن بطاقة طوارئ برمز QR. في حالات الحوادث، يستطيع المسعف مسح الرمز فوراً للتعرف على فصيلة دمك، الحساسيات القاتلة كالبنسلين، وأرقام الطوارئ لأقاربك في أقل من ثانيتين وبدون كلمة مرور.',
      open: false
    },
    {
      qEn: 'Can I revoke a doctor’s access to my records after an examination?',
      qAr: 'هل يمكنني إلغاء إذن الطبيب بالاطلاع على ملفي بعد انتهاء الكشف؟',
      aEn: 'Yes, completely! You have 100% control over consent. You can set time-limited access (e.g., 24 hours, 7 days) or immediately revoke permission at any second with a single click from your patient passport.',
      aAr: 'نعم بالتأكيد! أنت المالك الوحيد لبياناتك؛ يمكنك تحديد مدة الإذن (مثل 24 ساعة أو 7 أيام)، أو إلغائه فوراً بضغطة زر واحدة من لوحة تحكم جوازك الصحي في أي وقت.',
      open: false
    },
    {
      qEn: 'How do electronic prescriptions work at pharmacies?',
      qAr: 'كيف تعمل الروشتات الإلكترونية عند صرف العلاج من الصيدلية؟',
      aEn: 'After the doctor saves the prescription, it is digitally signed and saved directly to your profile. The pharmacist scans your prescription QR to verify its authenticity and mark it as dispensed to prevent reuse.',
      aAr: 'بمجرد أن يحرر الطبيب الروشتة، يتم توقيعها إلكترونياً وتظهر فوراً على هاتفك. يقوم الصيدلي بمسح كود الروشتة للتأكد من أصالتها وصرف الجرعات بدقة، ثم يتم إغلاقها لمنع إعادة صرفها.',
      open: false
    },
    {
      qEn: 'Is Sehati free for Egyptian citizens?',
      qAr: 'هل استخدام منصة صحتي مجاني للمواطنين؟',
      aEn: 'Yes! Creating your account, generating your unified medical passport, and utilizing the emergency rescue profile is completely free for all citizens.',
      aAr: 'نعم! إنشاء الحساب وإصدار جواز صحتي الطبي الموحد وبطاقة طوارئ الإنقاذ متاح مجاناً تماماً لكافة المواطنين.',
      open: false
    }
  ];

  ngOnInit(): void {
    this.startTabCycle();
  }

  ngOnDestroy(): void {
    this.stopTabCycle();
  }

  startTabCycle(): void {
    this.stopTabCycle();
    this.tabInterval = setInterval(() => {
      this.activePassportTab = (this.activePassportTab + 1) % 4;
    }, 6000);
  }

  stopTabCycle(): void {
    if (this.tabInterval) {
      clearInterval(this.tabInterval);
      this.tabInterval = null;
    }
  }

  toggleFaq(index: number): void {
    this.faqList[index].open = !this.faqList[index].open;
  }
}
