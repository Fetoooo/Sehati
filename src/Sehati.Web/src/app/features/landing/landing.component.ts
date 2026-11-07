import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
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

interface HeroSlide {
  id: number;
  badgeEn: string;
  badgeAr: string;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  accentColor: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-page" [class.rtl]="langService.isRtl()">
      <!-- Background Ambient Glow & Micro-Grid -->
      <div class="ambient-glow glow-top-left"></div>
      <div class="ambient-glow glow-top-right"></div>
      <div class="ambient-glow glow-center"></div>

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

          <!-- Navigation Links (Centered) -->
          <nav class="nav-menu">
            <a href="#capabilities" class="nav-link">{{ langService.isRtl() ? 'المميزات' : 'Capabilities' }}</a>
            <a href="#personas" class="nav-link">{{ langService.isRtl() ? 'الفئات والخدمات' : 'Personas' }}</a>
            <a href="#how-it-works" class="nav-link">{{ langService.isRtl() ? 'كيف تعمل؟' : 'How It Works' }}</a>
            <a href="#faq" class="nav-link">{{ langService.isRtl() ? 'الأسئلة الشائعة' : 'FAQ' }}</a>
            <a routerLink="/preview" class="nav-link showcase-pill">
              <span class="material-symbols-outlined">architecture</span>
              <span>{{ langService.isRtl() ? 'استعراض الهيكلية' : 'Showcase' }}</span>
            </a>
          </nav>

          <!-- Navigation Actions (Left in Arabic RTL / Right in LTR) -->
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
              <span>{{ langService.currentLang() === 'en' ? 'العربية' : 'EN' }}</span>
            </button>

            <!-- Auth Buttons -->
            <ng-container *ngIf="!authService.isAuthenticated(); else authUserActions">
              <a routerLink="/auth/login" class="login-text-btn">
                {{ langService.isRtl() ? 'تسجيل الدخول' : 'Sign In' }}
              </a>
              <a routerLink="/auth/register" class="join-pill-btn">
                <span>{{ langService.isRtl() ? 'انضم مجاناً' : 'Get Started' }}</span>
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
          <a href="#capabilities" class="drawer-item" (click)="isMobileMenuOpen = false">
            {{ langService.isRtl() ? 'المميزات الرقمية' : 'Capabilities' }}
          </a>
          <a href="#personas" class="drawer-item" (click)="isMobileMenuOpen = false">
            {{ langService.isRtl() ? 'الفئات والخدمات' : 'Personas' }}
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
                {{ langService.isRtl() ? 'انضم مجاناً الآن' : 'Get Started Free' }}
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
      <!-- HERO SECTION (Matching User Jsoor Reference Screenshot 1)        -->
      <!-- ================================================================= -->
      <section class="hero-section" id="hero">
        <!-- Floating Medical Status Chips Scattered Across Canvas -->
        <div class="floating-chip chip-1">
          <span class="chip-flag">🩸</span>
          <span class="chip-text">{{ langService.isRtl() ? 'A+ متبرع عام' : 'A+ Universal Donor' }}</span>
        </div>
        <div class="floating-chip chip-2">
          <span class="chip-flag">🪪</span>
          <span class="chip-text">SH-2026-000101</span>
        </div>
        <div class="floating-chip chip-3">
          <span class="chip-flag">❤️</span>
          <span class="chip-text">{{ langService.isRtl() ? '72 bpm نبض سليم' : '72 bpm Normal Pulse' }}</span>
        </div>
        <div class="floating-chip chip-4">
          <span class="chip-flag">🛡️</span>
          <span class="chip-text">{{ langService.isRtl() ? 'إذن الطبيب سارٍ' : 'Consent Active' }}</span>
        </div>
        <div class="floating-chip chip-5">
          <span class="chip-flag">🚨</span>
          <span class="chip-text">{{ langService.isRtl() ? 'QR طوارئ فوري' : 'Instant ER QR' }}</span>
        </div>
        <div class="floating-chip chip-6">
          <span class="chip-flag">📋</span>
          <span class="chip-text">{{ langService.isRtl() ? 'روشتة معتمدة' : 'Verified Rx' }}</span>
        </div>
        <div class="floating-chip chip-7">
          <span class="chip-flag">🔒</span>
          <span class="chip-text">{{ langService.isRtl() ? 'تشفير 256-bit' : '256-Bit Encrypted' }}</span>
        </div>

        <div class="hero-container">
          <!-- Right Column (In RTL Arabic): Main Typography & CTAs -->
          <div class="hero-text-col">
            <!-- Small Top Pill Badge -->
            <div class="hero-top-badge">
              <span class="badge-dot"></span>
              <span class="badge-text">
                {{ langService.isRtl() ? 'المنظومة الوطنية الموحدة للسجلات الصحية' : 'National Digital Health Infrastructure' }}
              </span>
            </div>

            <!-- Big High-Contrast Headline (3 Lines with Color Accent) -->
            <h1 class="hero-headline">
              <span class="headline-line1">{{ langService.isRtl() ? 'ملفك الطبي' : 'Your Unified' }}</span>
              <span class="headline-accent">{{ langService.isRtl() ? 'الموحد' : 'Health Passport' }}</span>
              <span class="headline-line3">{{ langService.isRtl() ? 'ورعايتك الصحية تبدأ هنا' : 'Starts Here' }}</span>
            </h1>

            <!-- Subtitle Description -->
            <p class="hero-subtext">
              {{ langService.isRtl()
                ? 'سجل طبي رقمي موحد يربط بين المستشفيات والعيادات والمعامل وطوارئ الإسعاف بكود صحي وطني. بياناتك ملكك وبأعلى معايير الأمان والخصوصية.'
                : 'A unified digital medical record linking hospitals, clinics, pathology labs, and emergency dispatch under one national code with patient-governed privacy.' }}
            </p>

            <!-- Dual CTA Action Buttons -->
            <div class="hero-cta-wrapper">
              <a routerLink="/auth/register" class="btn-hero-primary">
                <span>{{ langService.isRtl() ? 'أنشئ جوازك الصحي الآن' : 'Claim Your Passport' }}</span>
                <span class="material-symbols-outlined flip-rtl">arrow_forward</span>
              </a>

              <a routerLink="/auth/login" class="btn-hero-secondary">
                <span class="material-symbols-outlined">login</span>
                <span>{{ langService.isRtl() ? 'تسجيل الدخول' : 'Sign In' }}</span>
              </a>
            </div>

            <!-- Social Proof Bar Under CTAs -->
            <div class="hero-trust-bar">
              <span class="trust-caption">
                {{ langService.isRtl() ? 'انضم إلى منظومة الرعاية المعتمدة:' : 'Join accredited medical network:' }}
              </span>
              <div class="trust-mini-chips">
                <span class="t-pill">🇪🇬 مصر</span>
                <span class="t-pill">🏥 120+ منشأة</span>
                <span class="t-pill">🛡️ HIPAA</span>
                <span class="t-pill">⚡ &lt; 2s طوارئ</span>
              </div>
            </div>
          </div>

          <!-- Left Column (In RTL Arabic): 3D Floating Interactive Card Simulator -->
          <div class="hero-card-col">
            <div class="simulator-stack" (mouseenter)="pauseAutoSlide()" (mouseleave)="resumeAutoSlide()">
              <!-- Background Angled Ghost Layer for genuine 3D Depth -->
              <div class="ghost-depth-card"></div>

              <!-- Main Foreground Card -->
              <div class="floating-main-card">
                <!-- Top Brand Header inside card -->
                <div class="card-inner-header">
                  <div class="c-brand">
                    <img src="/sehati_logo.png" alt="Sehati" class="c-logo" />
                    <span class="c-name">{{ langService.isRtl() ? 'صِحّتي' : 'SEHATI' }}</span>
                  </div>
                  <div class="c-live-indicator">
                    <span class="live-dot"></span>
                    <span>{{ langService.isRtl() ? 'نظام حي' : 'LIVE SYSTEM' }}</span>
                  </div>
                </div>

                <!-- SLIDE 1: UNIFIED HEALTH PASSPORT -->
                <div class="slide-content-view" *ngIf="activeSlide === 0">
                  <div class="slide-highlight-box theme-orange">
                    <div class="box-top-row">
                      <span class="box-tag">EG {{ langService.isRtl() ? 'المصرية' : 'EGYPT' }}</span>
                      <span class="blood-pill">A+</span>
                    </div>
                    <div class="box-main-title">SH-2026-000101</div>
                    <div class="box-sub">{{ langService.isRtl() ? 'الكود الصحي الموحد' : 'Unified National Health ID' }}</div>
                  </div>

                  <div class="card-meta-list">
                    <div class="meta-row">
                      <span class="m-label">{{ langService.isRtl() ? 'اسم المواطن' : 'Patient Name' }}</span>
                      <strong class="m-value">Ahmed Mahmoud Hassan</strong>
                    </div>
                    <div class="meta-row">
                      <span class="m-label">{{ langService.isRtl() ? 'الرقم القومي' : 'National ID' }}</span>
                      <span class="m-value font-mono">29805121601234</span>
                    </div>
                    <div class="meta-row">
                      <span class="m-label">{{ langService.isRtl() ? 'حالة السجل' : 'Record Status' }}</span>
                      <span class="status-verified-pill">
                        <span class="material-symbols-outlined">verified</span>
                        <span>{{ langService.isRtl() ? 'سجل موثق ونشط' : 'Active & Verified' }}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <!-- SLIDE 2: EMERGENCY RESCUE QR -->
                <div class="slide-content-view" *ngIf="activeSlide === 1">
                  <div class="slide-highlight-box theme-red">
                    <div class="box-top-row">
                      <span class="box-tag">ER {{ langService.isRtl() ? 'طوارئ' : 'EMERGENCY' }}</span>
                      <span class="blood-pill red-bg">CRITICAL</span>
                    </div>
                    <div class="box-main-title">{{ langService.isRtl() ? 'بطاقة الإنقاذ الفوري' : 'Rapid Rescue QR Profile' }}</div>
                    <div class="box-sub">{{ langService.isRtl() ? 'متاح للإسعاف بدون كلمة مرور' : 'Instant anonymous first-responder triage' }}</div>
                  </div>

                  <div class="qr-preview-box">
                    <div class="qr-code-graphic">
                      <span class="material-symbols-outlined qr-icon">qr_code_2</span>
                      <div class="scan-laser-line"></div>
                    </div>
                    <div class="qr-critical-info">
                      <div class="crit-item">
                        <span class="crit-label">{{ langService.isRtl() ? 'فصيلة الدم:' : 'Blood Group:' }}</span>
                        <strong>A+ Positive</strong>
                      </div>
                      <div class="crit-item alert-danger">
                        <span class="crit-label">{{ langService.isRtl() ? 'حساسية دوائية:' : 'Allergy:' }}</span>
                        <strong>بنسلين (Penicillin)</strong>
                      </div>
                      <div class="crit-item">
                        <span class="crit-label">{{ langService.isRtl() ? 'طوارئ ICE:' : 'Emergency ICE:' }}</span>
                        <strong class="font-mono">0101-234-5678</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- SLIDE 3: DIGITAL PRESCRIPTION -->
                <div class="slide-content-view" *ngIf="activeSlide === 2">
                  <div class="slide-highlight-box theme-teal">
                    <div class="box-top-row">
                      <span class="box-tag">RX {{ langService.isRtl() ? 'روشتة معتمدة' : 'CERTIFIED RX' }}</span>
                      <span class="rx-date">2026-11-04</span>
                    </div>
                    <div class="box-main-title">Dr. Sarah Samir Hassan</div>
                    <div class="box-sub">{{ langService.isRtl() ? 'استشاري الباطنة والجهاز الهضمي' : 'Consultant Internal Medicine' }}</div>
                  </div>

                  <div class="rx-meds-box">
                    <div class="med-item">
                      <div class="med-name">Augmentin 1g (Amoxicillin)</div>
                      <div class="med-dose">{{ langService.isRtl() ? 'قرص واحد كل 12 ساعة بعد الأكل لمدة 7 أيام' : '1 tablet every 12 hrs after meals (7 days)' }}</div>
                    </div>
                    <div class="med-item">
                      <div class="med-name">Panadol Extra 500mg</div>
                      <div class="med-dose">{{ langService.isRtl() ? 'قرص عند اللزوم لتخفيف الصداع' : '1 tablet as needed for headache' }}</div>
                    </div>
                    <div class="rx-signature-row">
                      <span class="material-symbols-outlined sig-icon">draw</span>
                      <span class="sig-text">{{ langService.isRtl() ? 'توقيع إلكتروني مشفر بمعيار SHA-256' : 'SHA-256 Digitally Signed & Sealed' }}</span>
                    </div>
                  </div>
                </div>

                <!-- SLIDE 4: LIVE VITALS -->
                <div class="slide-content-view" *ngIf="activeSlide === 3">
                  <div class="slide-highlight-box theme-purple">
                    <div class="box-top-row">
                      <span class="box-tag">VT {{ langService.isRtl() ? 'مؤشرات حيوية' : 'LIVE VITALS' }}</span>
                      <span class="vitals-live-pill">NORMAL</span>
                    </div>
                    <div class="box-main-title">{{ langService.isRtl() ? 'المؤشرات الحيوية اللحظية' : 'Real-time Vital Telemetry' }}</div>
                    <div class="box-sub">{{ langService.isRtl() ? 'تحديث تلقائي من أجهزة الفحص' : 'Synchronized clinical telemetry' }}</div>
                  </div>

                  <div class="vitals-four-grid">
                    <div class="v-card-mini">
                      <span class="v-icon material-symbols-outlined text-red">favorite</span>
                      <div class="v-val">72 bpm</div>
                      <div class="v-lbl">{{ langService.isRtl() ? 'النبض' : 'Pulse' }}</div>
                    </div>
                    <div class="v-card-mini">
                      <span class="v-icon material-symbols-outlined text-teal">vital_signs</span>
                      <div class="v-val">120/80</div>
                      <div class="v-lbl">{{ langService.isRtl() ? 'الضغط' : 'BP (mmHg)' }}</div>
                    </div>
                    <div class="v-card-mini">
                      <span class="v-icon material-symbols-outlined text-amber">bloodtype</span>
                      <div class="v-val">95 mg/dL</div>
                      <div class="v-lbl">{{ langService.isRtl() ? 'السكر' : 'Glucose' }}</div>
                    </div>
                    <div class="v-card-mini">
                      <span class="v-icon material-symbols-outlined text-purple">fitness_center</span>
                      <div class="v-val">22.4</div>
                      <div class="v-lbl">{{ langService.isRtl() ? 'كتلة الجسم' : 'BMI' }}</div>
                    </div>
                  </div>
                </div>

                <!-- Bottom Interactive Pagination Dots (● ○ ○ ○) -->
                <div class="card-pagination-dots">
                  <button
                    *ngFor="let s of heroSlides; let idx = index"
                    type="button"
                    class="dot-btn"
                    [class.active]="activeSlide === idx"
                    (click)="setActiveSlide(idx)"
                    [title]="langService.isRtl() ? s.titleAr : s.titleEn"
                  ></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mouse Scroll Down Indicator at Bottom Center -->
        <a href="#personas" class="scroll-down-indicator">
          <div class="mouse-icon">
            <span class="wheel-dot"></span>
          </div>
          <span class="scroll-text">{{ langService.isRtl() ? 'اكتشف المزيد' : 'Scroll to explore' }}</span>
        </a>
      </section>

      <!-- ================================================================= -->
      <!-- PERSONAS / ROLE SHOWCASE (Matching User Jsoor Reference Image 2)   -->
      <!-- ================================================================= -->
      <section class="personas-section" id="personas">
        <div class="section-container">
          <!-- Section Centered Header -->
          <div class="section-title-block">
            <span class="section-tag-pill">{{ langService.isRtl() ? 'الفئات والخدمات' : 'Personas & Workspaces' }}</span>
            <h2 class="section-headline">
              {{ langService.isRtl() ? 'منظومة واحدة تجمع كل أطراف الرعاية الصحية' : 'One Unified Platform for All Healthcare Actors' }}
            </h2>
            <p class="section-subheadline">
              {{ langService.isRtl() ? 'واجهات متخصصة ومصممة بدقة لتلبية احتياجات الأطباء، المرضى، المستشفيات، وطواقم الطوارئ.' : 'Tailor-made portals built for clinical efficiency, patient empowerment, and instant emergency response.' }}
            </p>
          </div>

          <!-- Showcase Interactive Layout: Preview Card on Left & Colored Pill Badges on Right -->
          <div class="persona-interactive-layout">
            <!-- Dynamic Preview Card (Left in Arabic RTL / Right in LTR) -->
            <div class="persona-display-card">
              <div class="display-card-inner">
                <!-- Large Role Code Watermark (EG / MD / ER etc.) -->
                <div class="card-code-watermark" [style.color]="selectedPersona.color">
                  {{ selectedPersona.code }}
                </div>

                <!-- Big Main Title in Role Accent Color -->
                <h3 class="display-main-title" [style.color]="selectedPersona.color">
                  {{ langService.isRtl() ? selectedPersona.headlineAr : selectedPersona.headlineEn }}
                </h3>

                <!-- Subtitle Badge -->
                <div class="display-role-sub">
                  <span class="material-symbols-outlined">{{ selectedPersona.icon }}</span>
                  <span>{{ langService.isRtl() ? selectedPersona.nameAr : selectedPersona.nameEn }}</span>
                </div>

                <!-- Description -->
                <p class="display-description">
                  {{ langService.isRtl() ? selectedPersona.descAr : selectedPersona.descEn }}
                </p>

                <!-- Key Feature Bullets -->
                <div class="display-features-grid">
                  <div class="feat-item" *ngFor="let f of (langService.isRtl() ? selectedPersona.featuresAr : selectedPersona.featuresEn)">
                    <span class="material-symbols-outlined check-bullet" [style.color]="selectedPersona.color">check_circle</span>
                    <span>{{ f }}</span>
                  </div>
                </div>

                <!-- Action Button to Launch Workspace -->
                <div class="display-card-actions">
                  <a [routerLink]="selectedPersona.route" class="btn-role-action" [style.background]="selectedPersona.color">
                    <span class="material-symbols-outlined">launch</span>
                    <span>{{ langService.isRtl() ? 'الدخول إلى بوابة ' + selectedPersona.nameAr : 'Open ' + selectedPersona.nameEn + ' Portal' }}</span>
                  </a>
                </div>
              </div>
            </div>

            <!-- Grid of Colored Badge Pills (Matching Reference Image 2) -->
            <div class="persona-pills-grid">
              <button
                *ngFor="let p of personaList"
                type="button"
                class="persona-pill-item"
                [class.active]="selectedPersona.id === p.id"
                [style.--pill-color]="p.color"
                (click)="selectedPersona = p"
              >
                <span class="pill-code">{{ p.code }}</span>
                <span class="pill-name">{{ langService.isRtl() ? p.nameAr : p.nameEn }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ================================================================= -->
      <!-- HOW IT WORKS SECTION (Numbered Workflow 01, 02, 03)               -->
      <!-- ================================================================= -->
      <section class="how-it-works-section" id="how-it-works">
        <div class="section-container">
          <div class="section-title-block">
            <span class="section-tag-pill">{{ langService.isRtl() ? 'خطوات الاستخدام' : 'How It Works' }}</span>
            <h2 class="section-headline">
              {{ langService.isRtl() ? 'كيف تعمل منظومة صحتي في 3 خطوات بسيطة؟' : 'How Sehati Empowers Healthcare In 3 Simple Steps' }}
            </h2>
            <p class="section-subheadline">
              {{ langService.isRtl() ? 'تجربة رقمية سلسة تبدأ من تسجيل بياناتك وحتى استلام العلاج والمتابعة المستمرة.' : 'A frictionless journey from single-sign-on verification to lifelong medical records and medication management.' }}
            </p>
          </div>

          <div class="steps-container-grid">
            <!-- Step 1 -->
            <div class="step-modern-card">
              <div class="step-top-number">01</div>
              <div class="step-card-body">
                <div class="step-icon-frame teal">
                  <span class="material-symbols-outlined">badge</span>
                </div>
                <h3 class="step-card-title">{{ langService.isRtl() ? 'أنشئ حسابك واستلم كودك الموحد' : 'Claim Your Unified ID' }}</h3>
                <p class="step-card-text">
                  {{ langService.isRtl()
                    ? 'سجّل ببياناتك القومية في أقل من دقيقة لتوليد كود صحتي الموحد، وربط سجلاتك الطبية وبطاقة الطوارئ الذكية.'
                    : 'Sign up with your national ID in under 60 seconds to generate your unified health passport and emergency QR.' }}
                </p>
              </div>
            </div>

            <!-- Step 2 -->
            <div class="step-modern-card">
              <div class="step-top-number">02</div>
              <div class="step-card-body">
                <div class="step-icon-frame orange">
                  <span class="material-symbols-outlined">shield_person</span>
                </div>
                <h3 class="step-card-title">{{ langService.isRtl() ? 'احجز واكشف وامنح الإذن لطبيبك' : 'Book & Grant Doctor Permission' }}</h3>
                <p class="step-card-text">
                  {{ langService.isRtl()
                    ? 'احجز موعدك بالعيادة وامنح طبيبك تصريح الاطلاع على تاريخك المرضي وفحوصاتك السابقة لتقديم أدق تشخيص علاجي.'
                    : 'Schedule clinic visits and grant your attending physician time-limited access to your comprehensive clinical history.' }}
                </p>
              </div>
            </div>

            <!-- Step 3 -->
            <div class="step-modern-card">
              <div class="step-top-number">03</div>
              <div class="step-card-body">
                <div class="step-icon-frame purple">
                  <span class="material-symbols-outlined">clinical_notes</span>
                </div>
                <h3 class="step-card-title">{{ langService.isRtl() ? 'سجل طبي متكامل وروشتاتك في جيبك' : 'Lifelong Health Chart in Your Pocket' }}</h3>
                <p class="step-card-text">
                  {{ langService.isRtl()
                    ? 'استلم الروشتات الرقمية ونتائج التحاليل فوراً على هاتفك الذكي دون قلق من فقدان التقارير الورقية أبداً.'
                    : 'Access certified digital prescriptions, lab test reports, and imaging scans anytime on any device with zero paperwork.' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================================================================= -->
      <!-- CAPABILITIES SECTION (Grid of Core Medical Primitives)             -->
      <!-- ================================================================= -->
      <section class="capabilities-section" id="capabilities">
        <div class="section-container">
          <div class="section-title-block">
            <span class="section-tag-pill">{{ langService.isRtl() ? 'المميزات السريرية' : 'Clinical Primitives' }}</span>
            <h2 class="section-headline">
              {{ langService.isRtl() ? 'بنية تحتية طبية رقمية متطورة' : 'Next-Generation Healthcare Architecture' }}
            </h2>
            <p class="section-subheadline">
              {{ langService.isRtl() ? 'حلول تقنية تنهي عهد الدفاتر الورقية وتضمن الأمان التام لمعلومات المرضى.' : 'Engineered to eliminate paper fragmentation while enforcing strict patient privacy and high-speed clinical workflows.' }}
            </p>
          </div>

          <div class="cap-grid-cards">
            <!-- Cap 1 -->
            <div class="cap-feature-box">
              <div class="cap-box-icon teal">
                <span class="material-symbols-outlined">badge</span>
              </div>
              <h3 class="cap-box-title">{{ langService.isRtl() ? 'الكود الصحي الموحد (Unified ID)' : 'Unified Health Passport' }}</h3>
              <p class="cap-box-desc">
                {{ langService.isRtl()
                  ? 'رقم طبي مركزي موحد بصيغة (SH-YYYY-NNNNNN) يربط كافة كشوفاتك، روشتاتك، وتحاليلك عبر جميع المنشآت الطبية مدى الحياة.'
                  : 'A unique lifetime health code (SH-YYYY-NNNNNN) synchronizing visits, prescriptions, labs, and scans across all providers nationwide.' }}
              </p>
            </div>

            <!-- Cap 2 -->
            <div class="cap-feature-box">
              <div class="cap-box-icon ocean">
                <span class="material-symbols-outlined">shield_lock</span>
              </div>
              <h3 class="cap-box-title">{{ langService.isRtl() ? 'محرك الأذونات والخصوصية' : 'Dynamic Zero-Trust Consent' }}</h3>
              <p class="cap-box-desc">
                {{ langService.isRtl()
                  ? 'المريض هو المالك الوحيد لبياناته؛ يمنح الأطباء حق الاطلاع أو الإضافة لفترات محددة مع إمكانية الإلغاء الفوري بضغطة واحدة.'
                  : 'Zero-trust governance where patients grant time-limited permissions to doctors with instant one-click revocation.' }}
              </p>
            </div>

            <!-- Cap 3 -->
            <div class="cap-feature-box">
              <div class="cap-box-icon red">
                <span class="material-symbols-outlined">emergency</span>
              </div>
              <h3 class="cap-box-title">{{ langService.isRtl() ? 'بطاقة الإنقاذ السريع (QR)' : 'Rapid ER Rescue Profile' }}</h3>
              <p class="cap-box-desc">
                {{ langService.isRtl()
                  ? 'رمز استجابة سريع يتيح لأطقم الإسعاف معرفة فصيلة الدم والحساسيات الحرجة وجهات الاتصال فوراً في الحوادث دون كلمة مرور.'
                  : 'Instant anonymous triage profile giving paramedics immediate access to blood type, severe allergies, and emergency contacts in under 2 seconds.' }}
              </p>
            </div>

            <!-- Cap 4 -->
            <div class="cap-feature-box">
              <div class="cap-box-icon mint">
                <span class="material-symbols-outlined">clinical_notes</span>
              </div>
              <h3 class="cap-box-title">{{ langService.isRtl() ? 'عيادة الطبيب والروشتة الرقمية' : 'Doctor Encounter & E-Rx Builder' }}</h3>
              <p class="cap-box-desc">
                {{ langService.isRtl()
                  ? 'توثيق سريري فوري مع قياس المؤشرات الحيوية وحساب كتلة الجسم (BMI)، وتصنيف الأمراض (ICD-10)، وإصدار روشتات إلكترونية معتمدة.'
                  : 'Fast clinical notes, automatic BMI calculation, ICD-10 diagnostic coding, and tamper-proof digital prescriptions with electronic signature.' }}
              </p>
            </div>

            <!-- Cap 5 -->
            <div class="cap-feature-box">
              <div class="cap-box-icon amber">
                <span class="material-symbols-outlined">reduce_capacity</span>
              </div>
              <h3 class="cap-box-title">{{ langService.isRtl() ? 'تنظيم طوابير الحجز والكشف' : 'Live Clinic Queue Orchestration' }}</h3>
              <p class="cap-box-desc">
                {{ langService.isRtl()
                  ? 'جدولة مواعيد دقيقة تمنع التضارب وحجز المواعيد المزدوجة، مع إدارة طابور الانتظار وتوزيع الأرقام اللحظية بغرف الكشف.'
                  : 'Intelligent scheduling with collision prevention and live token queues coordinating waiting lounges with examination rooms.' }}
              </p>
            </div>

            <!-- Cap 6 -->
            <div class="cap-feature-box">
              <div class="cap-box-icon purple">
                <span class="material-symbols-outlined">policy</span>
              </div>
              <h3 class="cap-box-title">{{ langService.isRtl() ? 'سجل العمليات والرقابة الأمنية' : 'Forensic Immutable Audit Trail' }}</h3>
              <p class="cap-box-desc">
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
            <span class="section-tag-pill">{{ langService.isRtl() ? 'الأسئلة الأكثر تكراراً' : 'FAQ' }}</span>
            <h2 class="section-headline">
              {{ langService.isRtl() ? 'كل ما تحتاج لمعرفته عن منصة صحتي' : 'Frequently Asked Questions' }}
            </h2>
            <p class="section-subheadline">
              {{ langService.isRtl() ? 'إجابات واضحة ومباشرة حول الأمان، طريقة التسجيل، والخدمات المتاحة.' : 'Clear answers about security, access control, and platform usage.' }}
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
              <span class="cta-mini-tag">{{ langService.isRtl() ? 'رعاية صحية ذكية' : 'SMART HEALTHCARE' }}</span>
              <h2 class="cta-main-title">
                {{ langService.isRtl() ? 'هل أنت مستعد لتجربة مستقبل الرعاية الصحية في مصر؟' : 'Ready to Experience the Future of Unified Healthcare?' }}
              </h2>
              <p class="cta-subtext">
                {{ langService.isRtl()
                  ? 'انضم الآن إلى أكثر من 100,000 مواطن واستمتع بسجل طبي موحد مدى الحياة تحت أمان كامل.'
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
      <!-- FOOTER                                                            -->
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
              <h4>{{ langService.isRtl() ? 'روابط سريعة' : 'Quick Links' }}</h4>
              <ul>
                <li><a routerLink="/auth/login">{{ langService.isRtl() ? 'تسجيل الدخول' : 'Sign In' }}</a></li>
                <li><a routerLink="/auth/register">{{ langService.isRtl() ? 'إنشاء حساب جديد' : 'Register Account' }}</a></li>
                <li><a routerLink="/preview">{{ langService.isRtl() ? 'استعراض الهيكلية' : 'Architecture Showcase' }}</a></li>
                <li><a routerLink="/emergency">{{ langService.isRtl() ? 'طوارئ QR' : 'Emergency Rescue QR' }}</a></li>
                <li><a href="https://github.com/Fetoooo/Sehati" target="_blank" rel="noopener">GitHub Repository</a></li>
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
              <span>GDPR Certified</span>
            </div>
          </div>
        </div>
      </footer>

      <!-- Floating Rescue Button at Bottom Corner (Like Reference Image 1) -->
      <a routerLink="/emergency" class="floating-rescue-fab" [title]="langService.isRtl() ? 'طوارئ الإسعاف والإنقاذ السريع' : 'Emergency Quick Rescue'">
        <span class="material-symbols-outlined fab-icon">emergency</span>
      </a>
    </div>
  `,
  styles: [`
    /* ==========================================================================
       SEHATI REIMAGINED LANDING PAGE STYLES (Light Default, Crisp & Organized)
       Inspired by clean modern layout, micro-grid canvas & playful floating chips
       ========================================================================== */

    .landing-page {
      position: relative;
      min-height: 100vh;
      background-color: var(--color-bg-app, #FAFCFB);
      /* Subtle, delicate micro-grid pattern matching user screenshot 1 */
      background-image: 
        linear-gradient(to right, rgba(8, 131, 149, 0.045) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(8, 131, 149, 0.045) 1px, transparent 1px);
      background-size: 36px 36px;
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

    /* Ambient Pastel Lighting Glows */
    .ambient-glow {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      filter: blur(100px);
      z-index: 0;
      opacity: 0.65;
    }

    .glow-top-left {
      top: -100px;
      left: 5%;
      width: 480px;
      height: 480px;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0) 70%);
    }

    .glow-top-right {
      top: -60px;
      right: 5%;
      width: 520px;
      height: 520px;
      background: radial-gradient(circle, rgba(8, 131, 149, 0.14) 0%, rgba(5, 191, 219, 0) 70%);
    }

    .glow-center {
      top: 45%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(8, 131, 149, 0.06) 0%, transparent 70%);
    }

    /* TOP NAVBAR */
    .top-navbar {
      position: sticky;
      top: 0;
      width: 100%;
      z-index: 100;
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(8, 131, 149, 0.08);
      transition: all 0.3s ease;
    }

    :host-context([data-theme="dark"]) .top-navbar,
    :host-context(.dark-theme) .top-navbar {
      background: rgba(8, 38, 53, 0.88);
      border-bottom: 1px solid rgba(5, 191, 219, 0.12);
    }

    .nav-container {
      max-width: 1300px;
      margin: 0 auto;
      padding: 0.85rem 1.5rem;
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
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(8, 131, 149, 0.1), rgba(5, 191, 219, 0.18));
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(8, 131, 149, 0.15);
      border: 1px solid rgba(8, 131, 149, 0.2);
    }

    .brand-img {
      width: 28px;
      height: 28px;
      object-fit: contain;
    }

    .brand-typography {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }

    .brand-ar {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--color-primary-dark, #0A4D68);
      letter-spacing: -0.5px;
    }

    :host-context([data-theme="dark"]) .brand-ar,
    :host-context(.dark-theme) .brand-ar {
      color: #05BFDB;
    }

    .brand-en {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 2px;
      color: var(--color-text-muted, #64748B);
    }

    .nav-menu {
      display: flex;
      align-items: center;
      gap: 1.75rem;
    }

    .nav-link {
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--color-text-muted, #64748B);
      transition: color 0.2s ease;
      position: relative;
      padding: 0.25rem 0;
    }

    .nav-link:hover {
      color: var(--color-primary-base, #088395);
    }

    .nav-link.showcase-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(8, 131, 149, 0.08);
      color: var(--color-primary-base, #088395);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.85rem;
    }

    .nav-link.showcase-pill:hover {
      background: rgba(8, 131, 149, 0.14);
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
      transform: translateY(-1px);
    }

    .lang-action-btn {
      height: 40px;
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
      border-radius: 8px;
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
      box-shadow: 0 6px 20px rgba(8, 131, 149, 0.38);
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
      position: relative;
      padding: 3.5rem 1.5rem 4rem 1.5rem;
      max-width: 1300px;
      margin: 0 auto;
      min-height: calc(100vh - 80px);
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .hero-container {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      align-items: center;
      gap: 3.5rem;
      position: relative;
      z-index: 2;
    }

    .hero-text-col {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 1.35rem;
    }

    .landing-page.rtl .hero-text-col {
      align-items: flex-start;
    }

    .hero-top-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      padding: 0.45rem 1rem;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #059669;
      font-size: 0.85rem;
      font-weight: 700;
    }

    :host-context([data-theme="dark"]) .hero-top-badge,
    :host-context(.dark-theme) .hero-top-badge {
      background: rgba(16, 185, 129, 0.15);
      border-color: rgba(16, 185, 129, 0.4);
      color: #10B981;
    }

    .badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 8px #10B981;
      animation: pulse 2s infinite ease-in-out;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.2); }
    }

    /* Multi-line headline with color highlight */
    .hero-headline {
      display: flex;
      flex-direction: column;
      font-size: 3.6rem;
      font-weight: 900;
      line-height: 1.18;
      letter-spacing: -0.5px;
      color: var(--color-text-main, #0F172A);
      margin: 0;
    }

    .landing-page.rtl .hero-headline {
      font-family: var(--font-arabic, 'Cairo', sans-serif);
      font-weight: 900;
    }

    .headline-line1 {
      color: var(--color-text-main, #0F172A);
    }

    .headline-accent {
      color: #D97706; /* Striking warm gold/amber matching Jsoor reference highlight */
      background: linear-gradient(120deg, #D97706, #F59E0B);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: inline-block;
      font-size: 3.9rem;
    }

    .headline-line3 {
      color: var(--color-primary-dark, #0A4D68);
    }

    :host-context([data-theme="dark"]) .headline-line3,
    :host-context(.dark-theme) .headline-line3 {
      color: #05BFDB;
    }

    .hero-subtext {
      font-size: 1.12rem;
      line-height: 1.85;
      color: var(--color-text-muted, #64748B);
      max-width: 540px;
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
      padding: 0.95rem 2rem;
      background: var(--color-primary-base, #088395);
      color: #FFFFFF;
      font-size: 1.05rem;
      font-weight: 700;
      border-radius: 9999px;
      text-decoration: none;
      box-shadow: 0 8px 24px rgba(8, 131, 149, 0.35);
      transition: all 0.25s ease;
    }

    .btn-hero-primary:hover {
      background: var(--color-primary-dark, #0A4D68);
      box-shadow: 0 12px 30px rgba(8, 131, 149, 0.45);
      transform: translateY(-2px);
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
      box-shadow: 0 6px 18px rgba(8, 131, 149, 0.12);
    }

    .hero-trust-bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-top: 0.75rem;
      font-size: 0.85rem;
      color: var(--color-text-muted, #64748B);
    }

    .trust-mini-chips {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .t-pill {
      padding: 0.25rem 0.65rem;
      background: rgba(8, 131, 149, 0.06);
      border: 1px solid rgba(8, 131, 149, 0.12);
      border-radius: 9999px;
      font-weight: 700;
      font-size: 0.8rem;
    }

    /* ================================================================= */
    /* FLOATING STATUS CHIPS (Scattered Gracefully Across Canvas)        */
    /* ================================================================= */
    .floating-chip {
      position: absolute;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.5rem 0.95rem;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(8, 131, 149, 0.16);
      border-radius: 9999px;
      box-shadow: 0 8px 24px rgba(8, 131, 149, 0.1);
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--color-text-main, #0F172A);
      animation: floatChip 4.5s ease-in-out infinite alternate;
      pointer-events: none;
      user-select: none;
    }

    :host-context([data-theme="dark"]) .floating-chip,
    :host-context(.dark-theme) .floating-chip {
      background: rgba(8, 38, 53, 0.92);
      border-color: rgba(5, 191, 219, 0.25);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
    }

    .chip-1 { top: 12%; right: 48%; animation-delay: 0s; }
    .chip-2 { top: 22%; left: 8%; animation-delay: 1.2s; }
    .chip-3 { top: 38%; right: 46%; animation-delay: 2.1s; }
    .chip-4 { bottom: 24%; left: 12%; animation-delay: 0.8s; }
    .chip-5 { bottom: 32%; right: 44%; animation-delay: 1.8s; }
    .chip-6 { bottom: 14%; left: 45%; animation-delay: 2.6s; }
    .chip-7 { top: 8%; left: 42%; animation-delay: 1.5s; }

    @keyframes floatChip {
      0% { transform: translateY(0px) rotate(0deg); }
      100% { transform: translateY(-12px) rotate(1deg); }
    }

    /* ================================================================= */
    /* 3D FLOATING HERO CARD SIMULATOR (Layered Depth Card)              */
    /* ================================================================= */
    .hero-card-col {
      display: flex;
      justify-content: center;
      position: relative;
    }

    .simulator-stack {
      position: relative;
      width: 100%;
      max-width: 440px;
    }

    /* Ghost layer behind creating depth */
    .ghost-depth-card {
      position: absolute;
      top: -14px;
      left: -14px;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(8, 131, 149, 0.15), rgba(5, 191, 219, 0.08));
      border: 1px solid rgba(8, 131, 149, 0.2);
      border-radius: 32px;
      transform: rotate(-3deg);
      z-index: 1;
      pointer-events: none;
    }

    .floating-main-card {
      position: relative;
      z-index: 2;
      background: var(--color-surface-card, #FFFFFF);
      border: 1px solid rgba(8, 131, 149, 0.15);
      border-radius: 32px;
      padding: 1.75rem;
      box-shadow: 0 20px 45px -10px rgba(8, 131, 149, 0.18), 0 10px 20px -5px rgba(0, 0, 0, 0.04);
      transition: all 0.3s ease;
    }

    :host-context([data-theme="dark"]) .floating-main-card,
    :host-context(.dark-theme) .floating-main-card {
      background: #082635;
      border-color: rgba(5, 191, 219, 0.25);
      box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.6);
    }

    .card-inner-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--color-border-subtle, #E2E8F0);
      margin-bottom: 1.25rem;
    }

    .c-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .c-logo {
      width: 22px;
      height: 22px;
      object-fit: contain;
    }

    .c-name {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--color-primary-dark, #0A4D68);
    }

    :host-context([data-theme="dark"]) .c-name,
    :host-context(.dark-theme) .c-name {
      color: #05BFDB;
    }

    .c-live-indicator {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 1px;
      color: #059669;
      background: rgba(16, 185, 129, 0.1);
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
    }

    .live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10B981;
      animation: pulse 1.5s infinite;
    }

    /* Highlight inner box styled like reference orange card */
    .slide-highlight-box {
      border-radius: 20px;
      padding: 1.25rem;
      margin-bottom: 1.25rem;
      border: 2px solid;
    }

    .slide-highlight-box.theme-orange {
      background: rgba(245, 158, 11, 0.06);
      border-color: #F59E0B;
    }

    .slide-highlight-box.theme-red {
      background: rgba(239, 68, 68, 0.06);
      border-color: #EF4444;
    }

    .slide-highlight-box.theme-teal {
      background: rgba(8, 131, 149, 0.06);
      border-color: #088395;
    }

    .slide-highlight-box.theme-purple {
      background: rgba(139, 92, 246, 0.06);
      border-color: #8B5CF6;
    }

    .box-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .box-tag {
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 1px;
      color: var(--color-text-muted, #64748B);
    }

    .blood-pill {
      font-size: 0.85rem;
      font-weight: 900;
      background: #EF4444;
      color: #FFFFFF;
      padding: 0.15rem 0.55rem;
      border-radius: 6px;
    }

    .blood-pill.red-bg {
      background: #DC2626;
      font-size: 0.75rem;
      letter-spacing: 1px;
    }

    .box-main-title {
      font-size: 1.5rem;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: var(--color-text-main, #0F172A);
      margin-bottom: 0.25rem;
    }

    .box-sub {
      font-size: 0.85rem;
      color: var(--color-text-muted, #64748B);
    }

    .card-meta-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .meta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.9rem;
    }

    .m-label {
      color: var(--color-text-muted, #64748B);
    }

    .m-value {
      font-weight: 700;
    }

    .font-mono {
      font-family: monospace;
      letter-spacing: 0.5px;
    }

    .status-verified-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: #059669;
      background: rgba(16, 185, 129, 0.1);
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .status-verified-pill .material-symbols-outlined {
      font-size: 1rem;
    }

    /* QR Slide specifics */
    .qr-preview-box {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .qr-code-graphic {
      position: relative;
      width: 90px;
      height: 90px;
      background: #FFFFFF;
      border: 2px solid #EF4444;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }

    .qr-icon {
      font-size: 4rem;
      color: #0F172A;
    }

    .scan-laser-line {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: #EF4444;
      box-shadow: 0 0 8px #EF4444;
      animation: scanLaser 2s linear infinite;
    }

    @keyframes scanLaser {
      0% { top: 0%; }
      50% { top: 100%; }
      100% { top: 0%; }
    }

    .qr-critical-info {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      font-size: 0.85rem;
    }

    .crit-item {
      display: flex;
      gap: 0.4rem;
    }

    .crit-item.alert-danger strong {
      color: #DC2626;
    }

    /* RX Slide specifics */
    .rx-meds-box {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .med-item {
      background: rgba(8, 131, 149, 0.04);
      padding: 0.6rem 0.85rem;
      border-radius: 10px;
      border-left: 3px solid #088395;
    }

    .landing-page.rtl .med-item {
      border-left: none;
      border-right: 3px solid #088395;
    }

    .med-name {
      font-weight: 800;
      font-size: 0.88rem;
    }

    .med-dose {
      font-size: 0.78rem;
      color: var(--color-text-muted, #64748B);
    }

    .rx-signature-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.78rem;
      color: #059669;
      font-weight: 700;
      margin-top: 0.25rem;
    }

    .sig-icon {
      font-size: 1rem;
    }

    /* Vitals Slide specifics */
    .vitals-four-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .v-card-mini {
      background: rgba(8, 131, 149, 0.04);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      border-radius: 14px;
      padding: 0.75rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.2rem;
    }

    .v-val {
      font-size: 1.15rem;
      font-weight: 800;
    }

    .v-lbl {
      font-size: 0.75rem;
      color: var(--color-text-muted, #64748B);
    }

    .text-red { color: #EF4444; }
    .text-teal { color: #088395; }
    .text-amber { color: #F59E0B; }
    .text-purple { color: #8B5CF6; }

    /* Interactive Pagination Dots (● ○ ○ ○) */
    .card-pagination-dots {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.65rem;
      margin-top: 1.5rem;
      padding-top: 0.85rem;
      border-top: 1px solid var(--color-border-subtle, #E2E8F0);
    }

    .dot-btn {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: none;
      background: var(--color-border-subtle, #E2E8F0);
      cursor: pointer;
      transition: all 0.25s ease;
      padding: 0;
    }

    .dot-btn:hover {
      background: var(--color-primary-accent, #05BFDB);
      transform: scale(1.2);
    }

    .dot-btn.active {
      width: 28px;
      border-radius: 9999px;
      background: #F59E0B; /* Warm orange dot matching reference */
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
    }

    /* Scroll Down Indicator */
    .scroll-down-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      margin-top: 2rem;
      text-decoration: none;
      color: var(--color-text-muted, #64748B);
      font-size: 0.85rem;
      font-weight: 700;
      transition: color 0.2s ease;
      z-index: 2;
    }

    .scroll-down-indicator:hover {
      color: var(--color-primary-base, #088395);
    }

    .mouse-icon {
      width: 22px;
      height: 36px;
      border: 2px solid currentColor;
      border-radius: 12px;
      display: flex;
      justify-content: center;
      padding-top: 6px;
    }

    .wheel-dot {
      width: 4px;
      height: 8px;
      background: currentColor;
      border-radius: 2px;
      animation: mouseScroll 1.8s infinite ease-in-out;
    }

    @keyframes mouseScroll {
      0% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(12px); opacity: 0; }
    }

    /* ================================================================= */
    /* PERSONAS & ROLES SECTION (Matching Reference Image 2)             */
    /* ================================================================= */
    .personas-section {
      padding: 6rem 1.5rem;
      position: relative;
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(10px);
      border-top: 1px solid rgba(8, 131, 149, 0.06);
      border-bottom: 1px solid rgba(8, 131, 149, 0.06);
    }

    :host-context([data-theme="dark"]) .personas-section,
    :host-context(.dark-theme) .personas-section {
      background: rgba(8, 38, 53, 0.4);
    }

    .section-container {
      max-width: 1240px;
      margin: 0 auto;
    }

    .section-title-block {
      text-align: center;
      margin-bottom: 3.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    .section-tag-pill {
      display: inline-block;
      padding: 0.35rem 0.95rem;
      background: rgba(8, 131, 149, 0.08);
      border: 1px solid rgba(8, 131, 149, 0.18);
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
      line-height: 1.7;
      color: var(--color-text-muted, #64748B);
      max-width: 680px;
      margin: 0;
    }

    /* Showcase Layout: Preview Card on Left & Colored Pill Badges on Right */
    .persona-interactive-layout {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 3rem;
      align-items: center;
    }

    /* Dynamic Preview Card */
    .persona-display-card {
      position: relative;
      background: var(--color-surface-card, #FFFFFF);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      border-radius: 28px;
      padding: 2.75rem 2.25rem;
      box-shadow: 0 15px 35px -5px rgba(8, 131, 149, 0.08);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    :host-context([data-theme="dark"]) .persona-display-card,
    :host-context(.dark-theme) .persona-display-card {
      background: #082635;
      border-color: rgba(5, 191, 219, 0.2);
    }

    .display-card-inner {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1.25rem;
    }

    .card-code-watermark {
      font-size: 4.5rem;
      font-weight: 900;
      letter-spacing: 2px;
      opacity: 0.9;
      line-height: 1;
    }

    .display-main-title {
      font-size: 2.25rem;
      font-weight: 900;
      letter-spacing: -0.5px;
      line-height: 1.25;
      margin: 0;
    }

    .display-role-sub {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--color-text-muted, #64748B);
    }

    .display-description {
      font-size: 1.05rem;
      line-height: 1.75;
      color: var(--color-text-muted, #64748B);
      max-width: 480px;
      margin: 0;
    }

    .display-features-grid {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      text-align: right;
      width: 100%;
      max-width: 420px;
      margin: 0.5rem 0;
    }

    .landing-page:not(.rtl) .display-features-grid {
      text-align: left;
    }

    .feat-item {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      font-size: 0.92rem;
      font-weight: 600;
      color: var(--color-text-main, #0F172A);
    }

    .check-bullet {
      font-size: 1.2rem;
    }

    .display-card-actions {
      margin-top: 0.5rem;
    }

    .btn-role-action {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      padding: 0.85rem 1.85rem;
      border-radius: 9999px;
      color: #FFFFFF;
      font-size: 0.95rem;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
      transition: all 0.25s ease;
    }

    .btn-role-action:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
    }

    /* Grid of Colored Badge Pills (Matching Reference Image 2) */
    .persona-pills-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.85rem;
    }

    .persona-pill-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.65rem;
      padding: 0.85rem 1.15rem;
      background: var(--color-surface-card, #FFFFFF);
      border: 2px solid var(--pill-color, #088395);
      border-radius: 9999px;
      color: var(--pill-color, #088395);
      font-size: 0.95rem;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.03);
      transition: all 0.25s ease;
    }

    :host-context([data-theme="dark"]) .persona-pill-item,
    :host-context(.dark-theme) .persona-pill-item {
      background: #082635;
    }

    .persona-pill-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
      background: rgba(8, 131, 149, 0.05);
    }

    .persona-pill-item.active {
      background: var(--pill-color, #088395);
      color: #FFFFFF;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
      transform: scale(1.02);
    }

    .pill-code {
      font-size: 0.78rem;
      font-weight: 900;
      letter-spacing: 1px;
      opacity: 0.85;
    }

    .pill-name {
      font-size: 0.95rem;
    }

    /* ================================================================= */
    /* HOW IT WORKS SECTION (Numbered Workflow 01, 02, 03)               */
    /* ================================================================= */
    .how-it-works-section {
      padding: 6rem 1.5rem;
    }

    .steps-container-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }

    .step-modern-card {
      position: relative;
      background: var(--color-surface-card, #FFFFFF);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      border-radius: 24px;
      padding: 2.25rem 1.75rem;
      box-shadow: 0 10px 25px -5px rgba(8, 131, 149, 0.06);
      transition: all 0.3s ease;
      overflow: hidden;
    }

    :host-context([data-theme="dark"]) .step-modern-card,
    :host-context(.dark-theme) .step-modern-card {
      background: #082635;
      border-color: rgba(5, 191, 219, 0.15);
    }

    .step-modern-card:hover {
      transform: translateY(-4px);
      border-color: var(--color-primary-base, #088395);
      box-shadow: 0 18px 35px -10px rgba(8, 131, 149, 0.15);
    }

    .step-top-number {
      font-size: 3.5rem;
      font-weight: 900;
      color: rgba(8, 131, 149, 0.12);
      line-height: 1;
      margin-bottom: 0.75rem;
      font-family: monospace;
    }

    .step-card-body {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .step-icon-frame {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    .step-icon-frame.teal {
      background: rgba(8, 131, 149, 0.1);
      color: #088395;
    }

    .step-icon-frame.orange {
      background: rgba(245, 158, 11, 0.1);
      color: #D97706;
    }

    .step-icon-frame.purple {
      background: rgba(139, 92, 246, 0.1);
      color: #8B5CF6;
    }

    .step-card-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--color-text-main, #0F172A);
      margin: 0;
    }

    .step-card-text {
      font-size: 0.95rem;
      line-height: 1.7;
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

    .cap-grid-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.75rem;
    }

    .cap-feature-box {
      background: var(--color-surface-card, #FFFFFF);
      border: 1px solid var(--color-border-subtle, #E2E8F0);
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    :host-context([data-theme="dark"]) .cap-feature-box,
    :host-context(.dark-theme) .cap-feature-box {
      background: #082635;
      border-color: rgba(5, 191, 219, 0.15);
    }

    .cap-feature-box:hover {
      transform: translateY(-3px);
      border-color: var(--color-primary-base, #088395);
      box-shadow: 0 12px 28px -5px rgba(8, 131, 149, 0.12);
    }

    .cap-box-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    .cap-box-icon.teal { background: rgba(8, 131, 149, 0.1); color: #088395; }
    .cap-box-icon.ocean { background: rgba(10, 77, 104, 0.1); color: #0A4D68; }
    .cap-box-icon.red { background: rgba(239, 68, 68, 0.1); color: #DC2626; }
    .cap-box-icon.mint { background: rgba(5, 191, 219, 0.15); color: #088395; }
    .cap-box-icon.amber { background: rgba(245, 158, 11, 0.1); color: #D97706; }
    .cap-box-icon.purple { background: rgba(139, 92, 246, 0.1); color: #8B5CF6; }

    .cap-box-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--color-text-main, #0F172A);
      margin: 0;
    }

    .cap-box-desc {
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
      padding: 1.25rem 1.75rem;
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
      font-size: 1.08rem;
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
      padding: 4rem 2.5rem;
      color: #FFFFFF;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(8, 131, 149, 0.4);
      position: relative;
      overflow: hidden;
    }

    .cta-inner-content {
      position: relative;
      z-index: 2;
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
      font-size: 2.5rem;
      font-weight: 900;
      line-height: 1.25;
      margin: 0;
    }

    .cta-subtext {
      font-size: 1.1rem;
      line-height: 1.7;
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
      border-color: rgba(5, 191, 219, 0.12);
    }

    .footer-container {
      max-width: 1240px;
      margin: 0 auto;
    }

    .footer-top-grid {
      display: grid;
      grid-template-columns: 1.6fr 1fr 1fr;
      gap: 3rem;
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

    /* Floating Emergency FAB Button (Bottom Corner) */
    .floating-rescue-fab {
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 99;
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: #059669; /* Emergency rescue emerald/teal */
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
      transform: scale(1.12);
      box-shadow: 0 12px 30px rgba(5, 150, 105, 0.55);
      background: #047857;
    }

    .fab-icon {
      font-size: 1.75rem;
    }

    /* ================================================================= */
    /* RESPONSIVE MEDIA QUERIES (Mobile, Tablet, Desktop)               */
    /* ================================================================= */
    @media (max-width: 1024px) {
      .hero-container {
        grid-template-columns: 1fr;
        gap: 3rem;
        text-align: center;
      }

      .hero-text-col {
        align-items: center;
      }

      .landing-page.rtl .hero-text-col {
        align-items: center;
      }

      .hero-subtext {
        max-width: 100%;
      }

      .hero-cta-wrapper {
        justify-content: center;
      }

      .hero-trust-bar {
        justify-content: center;
      }

      .persona-interactive-layout {
        grid-template-columns: 1fr;
      }

      .steps-container-grid,
      .cap-grid-cards {
        grid-template-columns: repeat(2, 1fr);
      }

      .footer-top-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 820px) {
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
        font-size: 2.6rem;
      }

      .headline-accent {
        font-size: 2.9rem;
      }

      .floating-chip {
        display: none; /* Hide floating scatter chips on mobile to prevent clutter */
      }

      .persona-pills-grid {
        grid-template-columns: 1fr;
      }

      .steps-container-grid,
      .cap-grid-cards {
        grid-template-columns: 1fr;
      }

      .footer-top-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LandingComponent implements OnInit, OnDestroy {
  themeService = inject(ThemeService);
  langService = inject(LanguageService);
  authService = inject(AuthService);

  isMobileMenuOpen = false;
  activeSlide = 0;
  private slideInterval: any;

  heroSlides: HeroSlide[] = [
    {
      id: 0,
      badgeEn: 'PASSPORT',
      badgeAr: 'جواز صحتي',
      titleEn: 'Unified Medical Passport',
      titleAr: 'جواز صحتي الموحد',
      subtitleEn: 'Lifetime Health ID',
      subtitleAr: 'الكود الطبي المركزي',
      accentColor: '#F59E0B'
    },
    {
      id: 1,
      badgeEn: 'EMERGENCY',
      badgeAr: 'طوارئ',
      titleEn: 'Instant ER Rescue QR',
      titleAr: 'رمز طوارئ الإنقاذ',
      subtitleEn: 'Triage without password',
      subtitleAr: 'متاح للإسعاف فوراً',
      accentColor: '#EF4444'
    },
    {
      id: 2,
      badgeEn: 'E-RX',
      badgeAr: 'روشتة رقمية',
      titleEn: 'Certified Digital Rx',
      titleAr: 'الروشتة الإلكترونية',
      subtitleEn: 'SHA-256 Signed',
      subtitleAr: 'توقيع إلكتروني معتمد',
      accentColor: '#088395'
    },
    {
      id: 3,
      badgeEn: 'VITALS',
      badgeAr: 'مؤشرات حيوية',
      titleEn: 'Realtime Telemetry',
      titleAr: 'المؤشرات الحيوية',
      subtitleEn: 'Live Vitals & BMI',
      subtitleAr: 'نبض وضغط وسكر لحظي',
      accentColor: '#8B5CF6'
    }
  ];

  personaList: PersonaRole[] = [
    {
      id: 'patient',
      code: 'EG',
      nameEn: 'Citizen & Patient',
      nameAr: 'المريض والمواطن',
      headlineEn: 'Your Complete Health Record In Your Pocket',
      headlineAr: 'ملفك الطبي بين يديك أينما كنت',
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
        'كود صحي موحد يربط كافة المنشآت الطبية',
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
      headlineAr: 'عيادة سريرية ذكية وروشتات معتمدة',
      descEn: 'Instant patient history lookup with granted consent, structured encounter notes, ICD-10 coding, and tamper-proof prescriptions.',
      descAr: 'الاطلاع على التاريخ المرضي بعد إذن المريض، كشوفات سريعة، تشخيص ICD-10، وروشتات إلكترونية.',
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
      headlineAr: 'إدارة متكاملة للمنشأة الطبية',
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
      id: 'labs',
      code: 'LB',
      nameEn: 'Pathology Labs & Scans',
      nameAr: 'معامل التحاليل والأشعة',
      headlineEn: 'Direct Diagnostic Cloud Sync',
      headlineAr: 'ربط مباشر لنتائج التحاليل والفحوصات',
      descEn: 'Upload certified lab reports and radiology images directly to patient timeline with automated doctor notifications.',
      descAr: 'رفع تقارير التحاليل وصور الأشعة مباشرة على السجل الطبي للمريض مع إشعار الطبيب المعالج فوراً.',
      color: '#06B6D4',
      icon: 'biotech',
      featuresEn: [
        'Digital PDF and DICOM imaging attachment',
        'Automated abnormal value flagging',
        'Permanent lifelong diagnostic archive'
      ],
      featuresAr: [
        'ربط التقارير الرقمية وصور الأشعة مباشرة',
        'تمييز القيم الحرجة وتنبيه الطبيب تلقائياً',
        'سجل تشخيصي دائم لا يضيع بمرور السنوات'
      ],
      route: '/passport'
    },
    {
      id: 'pharmacy',
      code: 'RX',
      nameEn: 'Certified Pharmacies',
      nameAr: 'الصيدليات المعتمدة',
      headlineEn: 'Tamper-Proof Prescription Dispensing',
      headlineAr: 'صرف الروشتات الرقمية بدون أخطاء',
      descEn: 'Verify doctor signature, inspect dosages, and mark medications as dispensed preventing double redemption and drug conflicts.',
      descAr: 'التحقق من صحة الروشتة وتوقيع الطبيب، وصرف الجرعات بدقة مع منع تكرار الصرف غير القانوني.',
      color: '#EC4899',
      icon: 'medication',
      featuresEn: [
        'Barcode / QR verification of prescriptions',
        'Real-time drug-drug interaction warning',
        'Single-use redemption tracking'
      ],
      featuresAr: [
        'فحص كود الروشتة بالباركود للتأكد من أصالتها',
        'تنبيه فوري عند وجود تعارض بين الأدوية',
        'إغلاق الروشتة فور الصرف لمنع التكرار'
      ],
      route: '/passport'
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

  selectedPersona: PersonaRole = this.personaList[0];

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
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  startAutoSlide(): void {
    this.stopAutoSlide();
    this.slideInterval = setInterval(() => {
      this.activeSlide = (this.activeSlide + 1) % this.heroSlides.length;
    }, 5000);
  }

  stopAutoSlide(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.slideInterval = null;
    }
  }

  pauseAutoSlide(): void {
    this.stopAutoSlide();
  }

  resumeAutoSlide(): void {
    this.startAutoSlide();
  }

  setActiveSlide(index: number): void {
    this.activeSlide = index;
    this.startAutoSlide();
  }

  toggleFaq(index: number): void {
    this.faqList[index].open = !this.faqList[index].open;
  }
}
