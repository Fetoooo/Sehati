import { Component, inject, signal } from '@angular/core';
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

interface PortalRole {
  id: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  badgeEn: string;
  badgeAr: string;
  descEn: string;
  descAr: string;
  featuresEn: string[];
  featuresAr: string[];
  route: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-wrapper" [class.rtl]="langService.isRtl()">
      <!-- Sticky Navigation Bar -->
      <header class="landing-navbar">
        <div class="nav-container">
          <!-- Logo & Brand -->
          <a routerLink="/" class="nav-brand">
            <div class="logo-circle">
              <img src="/sehati_logo.png" alt="Sehati Logo" class="brand-logo" />
            </div>
            <div class="brand-text">
              <span class="arabic">صِحّتي</span>
              <span class="latin">SEHATI</span>
            </div>
          </a>

          <!-- Desktop Navigation Menu -->
          <nav class="desktop-menu">
            <a href="#overview" class="menu-link">{{ langService.isRtl() ? 'نظرة عامة' : 'Overview' }}</a>
            <a href="#capabilities" class="menu-link">{{ langService.isRtl() ? 'المميزات' : 'Capabilities' }}</a>
            <a href="#how-it-works" class="menu-link">{{ langService.isRtl() ? 'كيف تعمل' : 'How It Works' }}</a>
            <a href="#portals" class="menu-link">{{ langService.isRtl() ? 'البوابات' : 'Portals' }}</a>
            <a routerLink="/preview" class="menu-link showcase-pill">
              <span class="material-symbols-outlined">architecture</span>
              <span>{{ langService.isRtl() ? 'استعراض الهيكلية' : 'Architecture Demo' }}</span>
            </a>
          </nav>

          <!-- Top Actions (Theme, Lang, Sign In, Register) -->
          <div class="nav-actions">
            <!-- Theme Toggle -->
            <button
              class="icon-btn"
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
              class="lang-pill-btn"
              (click)="langService.toggleLanguage()"
              type="button"
            >
              <span class="material-symbols-outlined">translate</span>
              <span>{{ langService.currentLang() === 'en' ? 'العربية' : 'English' }}</span>
            </button>

            <!-- Auth Buttons -->
            <ng-container *ngIf="!authService.isAuthenticated(); else authUserActions">
              <a routerLink="/auth/login" class="btn btn-ghost login-btn">
                {{ langService.isRtl() ? 'تسجيل الدخول' : 'Sign In' }}
              </a>
              <a routerLink="/auth/register" class="btn btn-primary register-btn">
                <span class="material-symbols-outlined">person_add</span>
                <span>{{ langService.isRtl() ? 'إنشاء حساب جديد' : 'Get Started' }}</span>
              </a>
            </ng-container>

            <ng-template #authUserActions>
              <a routerLink="/dashboard" class="btn btn-primary dashboard-btn">
                <span class="material-symbols-outlined">space_dashboard</span>
                <span>{{ langService.isRtl() ? 'لوحة التحكم' : 'Dashboard' }}</span>
              </a>
            </ng-template>

            <!-- Mobile Hamburger Button -->
            <button class="mobile-toggle-btn" (click)="isMobileMenuOpen = !isMobileMenuOpen" type="button">
              <span class="material-symbols-outlined">{{ isMobileMenuOpen ? 'close' : 'menu' }}</span>
            </button>
          </div>
        </div>

        <!-- Mobile Drawer Menu -->
        <div class="mobile-drawer" *ngIf="isMobileMenuOpen">
          <a href="#overview" class="drawer-link" (click)="isMobileMenuOpen = false">
            {{ langService.isRtl() ? 'نظرة عامة' : 'Overview' }}
          </a>
          <a href="#capabilities" class="drawer-link" (click)="isMobileMenuOpen = false">
            {{ langService.isRtl() ? 'المميزات الرقمية' : 'Capabilities' }}
          </a>
          <a href="#how-it-works" class="drawer-link" (click)="isMobileMenuOpen = false">
            {{ langService.isRtl() ? 'كيف تعمل المنظومة' : 'How It Works' }}
          </a>
          <a href="#portals" class="drawer-link" (click)="isMobileMenuOpen = false">
            {{ langService.isRtl() ? 'بوابات النظام' : 'Portals' }}
          </a>
          <a routerLink="/preview" class="drawer-link" (click)="isMobileMenuOpen = false">
            {{ langService.isRtl() ? 'استعراض الهيكلية والأنظمة' : 'Architecture Showcase' }}
          </a>
          <div class="drawer-actions">
            <ng-container *ngIf="!authService.isAuthenticated()">
              <a routerLink="/auth/login" class="btn btn-secondary w-full" (click)="isMobileMenuOpen = false">
                {{ langService.isRtl() ? 'تسجيل الدخول' : 'Sign In' }}
              </a>
              <a routerLink="/auth/register" class="btn btn-primary w-full" (click)="isMobileMenuOpen = false">
                {{ langService.isRtl() ? 'إنشاء حساب جديد' : 'Get Started' }}
              </a>
            </ng-container>
            <ng-container *ngIf="authService.isAuthenticated()">
              <a routerLink="/dashboard" class="btn btn-primary w-full" (click)="isMobileMenuOpen = false">
                {{ langService.isRtl() ? 'الانتقال إلى لوحة التحكم' : 'Go to Dashboard' }}
              </a>
            </ng-container>
          </div>
        </div>
      </header>

      <!-- HERO SECTION -->
      <section id="overview" class="hero-section">
        <div class="hero-ambient-glow"></div>
        <div class="hero-container">
          <!-- Left Hero Text & CTAs -->
          <div class="hero-content">
            <div class="national-badge">
              <span class="flag-icon">🇪🇬</span>
              <span class="badge-text">
                {{ langService.isRtl() ? 'المنظومة الرقمية الموحدة للسجلات الصحية في مصر' : 'National Digital Health Infrastructure • Egypt' }}
              </span>
            </div>

            <h1 class="hero-headline">
              <span class="headline-primary">{{ langService.isRtl() ? 'مريض واحد، سجل طبي واحد،' : 'One Patient, One Medical History,' }}</span>
              <span class="headline-accent">{{ langService.isRtl() ? 'رعاية صحية أفضل.' : 'Better Healthcare.' }}</span>
            </h1>

            <p class="hero-subheading">
              {{ langService.isRtl() 
                ? 'منصة صحتي تنهي تشتت السجلات الطبية الورقية، وتربط بين المستشفيات والعيادات والمعامل وطوارئ الإسعاف بكود صحي موحد وأذونات خصوصية يتحكم بها المريض بالكامل.'
                : 'Sehati terminates fragmented paper records by unifying hospitals, polyclinics, pathology labs, and emergency dispatch under one standardized health passport with patient-governed consent.' }}
            </p>

            <div class="hero-cta-group">
              <a routerLink="/auth/register" class="btn btn-primary btn-lg pulse-glow">
                <span class="material-symbols-outlined">badge</span>
                <span>{{ langService.isRtl() ? 'إصدار جوازك الطبي الموحد' : 'Claim Your Health Passport' }}</span>
              </a>

              <a routerLink="/preview" class="btn btn-secondary btn-lg">
                <span class="material-symbols-outlined">play_circle</span>
                <span>{{ langService.isRtl() ? 'تجربة المنظومة الحية' : 'Explore Live Showcase' }}</span>
              </a>
            </div>

            <!-- Trust Bar -->
            <div class="trust-metrics-bar">
              <div class="metric-item">
                <span class="metric-num">100%</span>
                <span class="metric-lbl">{{ langService.isRtl() ? 'رقمي بالكامل بدون ورق' : 'Paperless Clinical EHR' }}</span>
              </div>
              <div class="metric-divider"></div>
              <div class="metric-item">
                <span class="metric-num">&lt; 2s</span>
                <span class="metric-lbl">{{ langService.isRtl() ? 'استجابة سريعة لطوارئ QR' : 'Emergency QR Retrieval' }}</span>
              </div>
              <div class="metric-divider"></div>
              <div class="metric-item">
                <span class="metric-num">23</span>
                <span class="metric-lbl">{{ langService.isRtl() ? 'كيان طبي موحد ومترابط' : 'Normalized Health Entities' }}</span>
              </div>
            </div>
          </div>

          <!-- Right Hero Visual: 3D Holographic Passport Card Simulation -->
          <div class="hero-visual">
            <div class="card-stack-container">
              <!-- Background Glow Orb -->
              <div class="glow-orb"></div>

              <!-- Main Floating MedicPro Card -->
              <div class="medic-passport-card">
                <div class="passport-header">
                  <div class="passport-brand">
                    <img src="/sehati_logo.png" alt="Logo" class="p-logo" />
                    <div>
                      <div class="p-title-ar">جمهورية مصر العربية - صِحّتي</div>
                      <div class="p-title-en">SEHATI UNIFIED MEDICAL PASSPORT</div>
                    </div>
                  </div>
                  <div class="blood-group-tag">A+</div>
                </div>

                <div class="passport-id-banner">
                  <div class="chip-graphic"></div>
                  <div class="id-number">SH-2026-000101</div>
                </div>

                <div class="passport-details-grid">
                  <div class="p-field">
                    <span class="f-label">{{ langService.isRtl() ? 'اسم المريض' : 'PATIENT NAME' }}</span>
                    <span class="f-val">Ahmed Mahmoud Hassan</span>
                  </div>
                  <div class="p-field">
                    <span class="f-label">{{ langService.isRtl() ? 'الرقم القومي' : 'NATIONAL ID' }}</span>
                    <span class="f-val">29805121601234</span>
                  </div>
                  <div class="p-field">
                    <span class="f-label">{{ langService.isRtl() ? 'تاريخ الميلاد' : 'DATE OF BIRTH' }}</span>
                    <span class="f-val">12 Jun 1988</span>
                  </div>
                  <div class="p-field">
                    <span class="f-label">{{ langService.isRtl() ? 'حالة السجل' : 'STATUS' }}</span>
                    <span class="f-val verified">
                      <span class="material-symbols-outlined">verified</span>
                      ACTIVE & VERIFIED
                    </span>
                  </div>
                </div>

                <!-- Floating Vitals Pulse Strip -->
                <div class="vitals-strip">
                  <div class="v-pulse-item">
                    <span class="material-symbols-outlined v-icon ecg">ecg_heart</span>
                    <span class="v-val">72 bpm</span>
                  </div>
                  <div class="v-pulse-item">
                    <span class="material-symbols-outlined v-icon bp">vital_signs</span>
                    <span class="v-val">120/80 mmHg</span>
                  </div>
                  <div class="v-pulse-item">
                    <span class="material-symbols-outlined v-icon alert">warning</span>
                    <span class="v-val allergy">Allergy: Penicillin</span>
                  </div>
                </div>

                <!-- Bottom Bar: QR Code Simulation -->
                <div class="passport-footer">
                  <div class="qr-mini-badge">
                    <span class="material-symbols-outlined">qr_code_2</span>
                    <span>EMERGENCY RESCUE QR</span>
                  </div>
                  <div class="encryption-tag">
                    <span class="material-symbols-outlined">lock</span>
                    <span>256-BIT ENCRYPTED</span>
                  </div>
                </div>
              </div>

              <!-- Floating Doctor Consent Tag -->
              <div class="floating-consent-tag">
                <div class="consent-avatar">
                  <span class="material-symbols-outlined">stethoscope</span>
                </div>
                <div class="consent-meta">
                  <span class="c-title">{{ langService.isRtl() ? 'تم منح الإذن للطبيب' : 'Active Doctor Consent' }}</span>
                  <span class="c-sub">Dr. Sarah Smith • 30 Days</span>
                </div>
                <span class="c-status">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CAPABILITIES SECTION -->
      <section id="capabilities" class="capabilities-section">
        <div class="section-container">
          <div class="section-header text-center">
            <span class="section-tag">{{ langService.isRtl() ? 'مميزات المنظومة' : 'PLATFORM CAPABILITIES' }}</span>
            <h2 class="section-title">
              {{ langService.isRtl() ? 'رعاية صحية ذكية ومتكاملة في منصة واحدة' : 'Next-Generation Healthcare Cloud Architecture' }}
            </h2>
            <p class="section-subtitle">
              {{ langService.isRtl() 
                ? 'حلول تقنية متقدمة تضمن دقة السجلات، خصوصية المريض، وسرعة إنقاذ الحياة في الطوارئ.' 
                : 'Advanced medical primitives ensuring patient record integrity, zero-trust consent, and instant emergency intervention.' }}
            </p>
          </div>

          <div class="capabilities-grid">
            <!-- Card 1: Unified ID -->
            <div class="cap-card">
              <div class="cap-icon-box teal">
                <span class="material-symbols-outlined">badge</span>
              </div>
              <h3 class="cap-title">{{ langService.isRtl() ? 'الكود الصحي الموحد (Unified ID)' : 'Unified Health Passport' }}</h3>
              <p class="cap-desc">
                {{ langService.isRtl() 
                  ? 'رقم طبي مركزي بصيغة (SH-YYYY-NNNNNN) يربط كافة كشوفاتك، روشتاتك، وتحاليلك عبر جميع العيادات والمستشفيات مدى الحياة.' 
                  : 'A thread-safe unique ID (SH-YYYY-NNNNNN) synchronizing visits, prescriptions, labs, and scans across all providers nationwide.' }}
              </p>
            </div>

            <!-- Card 2: Zero-Trust Consent -->
            <div class="cap-card">
              <div class="cap-icon-box ocean">
                <span class="material-symbols-outlined">shield_lock</span>
              </div>
              <h3 class="cap-title">{{ langService.isRtl() ? 'محرك الأذونات والخصوصية' : 'Dynamic Patient-Owned Consent' }}</h3>
              <p class="cap-desc">
                {{ langService.isRtl() 
                  ? 'المريض هو المالك الوحيد لبياناته؛ يمنح الأطباء حق الاطلاع أو الإضافة لفترات محددة مع إمكانية الإلغاء الفوري بضغطة واحدة.' 
                  : 'Zero-trust governance where patients grant time-limited permissions to doctors with instant one-click revocation.' }}
              </p>
            </div>

            <!-- Card 3: Emergency QR -->
            <div class="cap-card">
              <div class="cap-icon-box red">
                <span class="material-symbols-outlined">emergency</span>
              </div>
              <h3 class="cap-title">{{ langService.isRtl() ? 'بطاقة الإنقاذ السريع (QR)' : 'Rapid ER Rescue Profile' }}</h3>
              <p class="cap-desc">
                {{ langService.isRtl() 
                  ? 'رمز استجابة سريع يتيح لأطقم الإسعاف والطوارئ معرفة فصيلة الدم والحساسيات الحرجة وجهات الاتصال فوراً دون الحاجة لتسجيل دخول.' 
                  : 'Instant anonymous triage profile giving first responders immediate access to blood type, severe allergies, and emergency contacts.' }}
              </p>
            </div>

            <!-- Card 4: Doctor Workspace & Rx -->
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

            <!-- Card 5: Clinic Orchestration -->
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

            <!-- Card 6: Immutable Audit Trail -->
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

      <!-- HOW IT WORKS STEP-BY-STEP -->
      <section id="how-it-works" class="how-section">
        <div class="section-container">
          <div class="section-header text-center">
            <span class="section-tag">{{ langService.isRtl() ? 'خطوات الاستخدام' : 'SEAMLESS WORKFLOW' }}</span>
            <h2 class="section-title">
              {{ langService.isRtl() ? 'كيف تعمل منظومة صحتي في 3 خطوات بسيطة؟' : 'How Sehati Empowers Healthcare In 3 Steps' }}
            </h2>
          </div>

          <div class="steps-grid">
            <div class="step-card">
              <div class="step-number">01</div>
              <h4 class="step-title">{{ langService.isRtl() ? 'أنشئ حسابك واستلم كودك الموحد' : 'Create Account & Claim Unified ID' }}</h4>
              <p class="step-desc">
                {{ langService.isRtl() 
                  ? 'سجّل ببياناتك القومية في أقل من دقيقة لتوليد كود صحتي الموحد، وربط سجلاتك الطبية وبطاقة الطوارئ الذكية.' 
                  : 'Sign up in under 60 seconds with your national ID to generate your unified health passport and emergency rescue QR.' }}
              </p>
            </div>

            <div class="step-card">
              <div class="step-number">02</div>
              <h4 class="step-title">{{ langService.isRtl() ? 'احجز واكشف وامنح الإذن لطبيبك' : 'Book & Grant Doctor Permission' }}</h4>
              <p class="step-desc">
                {{ langService.isRtl() 
                  ? 'احجز موعدك بالعيادة وامنح طبيبك تصريح الاطلاع على فحوصاتك وتاريخك المرضي لتقديم أدق تشخيص علاجي.' 
                  : 'Schedule clinic visits and grant your attending physician secure access to your comprehensive clinical history.' }}
              </p>
            </div>

            <div class="step-card">
              <div class="step-number">03</div>
              <h4 class="step-title">{{ langService.isRtl() ? 'سجل طبي رقمي وروشتاتك في جيبك' : 'Lifelong Health Chart in Your Pocket' }}</h4>
              <p class="step-desc">
                {{ langService.isRtl() 
                  ? 'استلم الروشتات الرقمية ونتائج التحاليل فوراً على هاتفك دون قلق من فقدان التقارير الورقية أبداً.' 
                  : 'Access certified digital prescriptions, lab test reports, and imaging scans anytime on any device with zero paperwork.' }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- PORTALS & PERSONAS TABBED SHOWCASE -->
      <section id="portals" class="portals-section">
        <div class="section-container">
          <div class="section-header text-center">
            <span class="section-tag">{{ langService.isRtl() ? 'بوابات النظام المتخصصة' : 'TAILORED PORTALS' }}</span>
            <h2 class="section-title">
              {{ langService.isRtl() ? 'واجهات متخصصة لكل فاعل في المنظومة الصحية' : 'Purpose-Built Interfaces for Every Healthcare Role' }}
            </h2>
          </div>

          <!-- Role Select Tabs -->
          <div class="portal-nav-tabs">
            <button
              *ngFor="let role of rolesList"
              class="p-tab-btn"
              [class.active]="selectedRole.id === role.id"
              (click)="selectedRole = role"
            >
              <span class="material-symbols-outlined">{{ role.icon }}</span>
              <span>{{ langService.isRtl() ? role.nameAr : role.nameEn }}</span>
            </button>
          </div>

          <!-- Active Role Display Card -->
          <div class="portal-display-card">
            <div class="display-left">
              <span class="role-badge">{{ langService.isRtl() ? selectedRole.badgeAr : selectedRole.badgeEn }}</span>
              <h3 class="display-title">{{ langService.isRtl() ? selectedRole.nameAr : selectedRole.nameEn }}</h3>
              <p class="display-desc">{{ langService.isRtl() ? selectedRole.descAr : selectedRole.descEn }}</p>

              <div class="feature-bullets">
                <div class="bullet-item" *ngFor="let f of (langService.isRtl() ? selectedRole.featuresAr : selectedRole.featuresEn)">
                  <span class="material-symbols-outlined check-icon">check_circle</span>
                  <span>{{ f }}</span>
                </div>
              </div>

              <div class="display-actions">
                <a [routerLink]="selectedRole.route" class="btn btn-primary">
                  <span class="material-symbols-outlined">launch</span>
                  <span>{{ langService.isRtl() ? 'الدخول إلى هذه البوابة' : 'Open Portal Workspace' }}</span>
                </a>
              </div>
            </div>

            <div class="display-right">
              <div class="screen-preview-mockup">
                <div class="mockup-header">
                  <span class="circle red"></span>
                  <span class="circle yellow"></span>
                  <span class="circle green"></span>
                  <span class="mockup-title">sehati.gov.eg{{ selectedRole.route }}</span>
                </div>
                <div class="mockup-body">
                  <div class="preview-hero-icon">
                    <span class="material-symbols-outlined">{{ selectedRole.icon }}</span>
                  </div>
                  <h4>{{ langService.isRtl() ? selectedRole.nameAr : selectedRole.nameEn }}</h4>
                  <p>{{ langService.isRtl() ? 'واجهة تفاعلية مهيأة وفق أحدث معايير الأمان وتجربة المستخدم' : 'Interactive interface engineered with MedicPro clinical standards' }}</p>
                  <div class="mockup-pill-row">
                    <span class="mock-tag">LIGHT / DARK</span>
                    <span class="mock-tag">ARABIC RTL</span>
                    <span class="mock-tag">RESPONSIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CALL TO ACTION BANNER -->
      <section class="cta-section">
        <div class="cta-container">
          <div class="cta-card">
            <div class="cta-content">
              <h2 class="cta-title">
                {{ langService.isRtl() ? 'هل أنت مستعد لتجربة مستقبل الرعاية الصحية في مصر؟' : 'Ready to Experience the Future of Unified Healthcare?' }}
              </h2>
              <p class="cta-subtitle">
                {{ langService.isRtl() 
                  ? 'انضم الآن إلى منظومة صحتي واستمتع بسجل طبي رقمي موحد مدى الحياة.' 
                  : 'Join Sehati today and experience a lifelong, secure, paperless health record.' }}
              </p>
              <div class="cta-buttons">
                <a routerLink="/auth/register" class="btn btn-white btn-lg">
                  <span class="material-symbols-outlined">person_add</span>
                  <span>{{ langService.isRtl() ? 'إنشاء حساب جديد مجاناً' : 'Get Started Free' }}</span>
                </a>
                <a routerLink="/auth/login" class="btn btn-outline-white btn-lg">
                  <span class="material-symbols-outlined">login</span>
                  <span>{{ langService.isRtl() ? 'تسجيل الدخول' : 'Sign In to Portal' }}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer class="landing-footer">
        <div class="footer-container">
          <div class="footer-top">
            <div class="footer-brand-col">
              <div class="footer-logo">
                <img src="/sehati_logo.png" alt="Sehati Logo" class="f-logo" />
                <div class="f-text">
                  <span class="ar">صِحّتي</span>
                  <span class="en">SEHATI</span>
                </div>
              </div>
              <p class="footer-mission">
                {{ langService.t('onePatientOneRecord') }}
              </p>
              <div class="footer-meta-pill">
                <span>🇪🇬 Arab Republic of Egypt</span>
              </div>
            </div>

            <div class="footer-links-col">
              <h4>{{ langService.isRtl() ? 'بوابات النظام' : 'Portals' }}</h4>
              <ul>
                <li><a routerLink="/passport">{{ langService.isRtl() ? 'جواز صحتي الطبي' : 'Patient Passport' }}</a></li>
                <li><a routerLink="/doctor/queue">{{ langService.isRtl() ? 'عيادة الطبيب وطابور الكشف' : 'Doctor Consultation' }}</a></li>
                <li><a routerLink="/receptionist">{{ langService.isRtl() ? 'مكتب الاستقبال' : 'Reception Desk' }}</a></li>
                <li><a routerLink="/clinic/admin">{{ langService.isRtl() ? 'إدارة المنشأة والعيادة' : 'Clinic Admin' }}</a></li>
                <li><a routerLink="/admin/audit">{{ langService.isRtl() ? 'سجل العمليات الأمني' : 'Security Audit Trail' }}</a></li>
              </ul>
            </div>

            <div class="footer-links-col">
              <h4>{{ langService.isRtl() ? 'روابط سريعة' : 'Quick Links' }}</h4>
              <ul>
                <li><a routerLink="/auth/login">{{ langService.isRtl() ? 'تسجيل الدخول' : 'Sign In' }}</a></li>
                <li><a routerLink="/auth/register">{{ langService.isRtl() ? 'إنشاء حساب جديد' : 'Register Account' }}</a></li>
                <li><a routerLink="/preview">{{ langService.isRtl() ? 'استعراض الهيكلية' : 'Architecture Demo' }}</a></li>
                <li><a routerLink="/emergency">{{ langService.isRtl() ? 'طوارئ QR' : 'Emergency Rescue QR' }}</a></li>
                <li><a href="https://github.com/Fetoooo/Sehati" target="_blank" rel="noopener">GitHub Repository</a></li>
              </ul>
            </div>
          </div>

          <div class="footer-bottom">
            <p>© 2026 Sehati Smart Healthcare Platform. All rights reserved.</p>
            <div class="footer-badges">
              <span>HIPAA Compliant</span>
              <span>•</span>
              <span>AES-256 Encrypted</span>
              <span>•</span>
              <span>ISO 27001 Standard</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .landing-wrapper {
      min-height: 100vh;
      background-color: var(--color-bg-app);
      color: var(--color-text-main);
      overflow-x: hidden;
      font-family: var(--font-primary);
    }

    /* RTL Support */
    .landing-wrapper.rtl {
      direction: rtl;
      font-family: var(--font-arabic);

      .desktop-menu .menu-link {
        font-family: var(--font-arabic);
      }

      .hero-headline {
        font-family: var(--font-arabic);
      }
    }

    /* Sticky Navigation */
    .landing-navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--color-border-subtle);
      transition: all 0.3s ease;

      .nav-container {
        max-width: 1280px;
        margin: 0 auto;
        padding: 0.85rem 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
      }
    }

    :host-context([data-theme="dark"]) .landing-navbar {
      background: rgba(15, 23, 42, 0.85);
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      text-decoration: none;

      .logo-circle {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: #fff;
        padding: 4px;
        box-shadow: var(--shadow-sm);
        display: flex;
        align-items: center;
        justify-content: center;

        .brand-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      .brand-text {
        display: flex;
        flex-direction: column;

        .arabic {
          font-family: var(--font-arabic);
          font-size: 1.15rem;
          font-weight: 900;
          color: var(--color-primary-deep);
          line-height: 1.1;
        }

        .latin {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.15em;
          color: var(--color-primary-ocean);
        }
      }
    }

    .desktop-menu {
      display: flex;
      align-items: center;
      gap: 1.5rem;

      .menu-link {
        color: var(--color-text-muted);
        text-decoration: none;
        font-weight: 600;
        font-size: 0.92rem;
        transition: color 0.2s;

        &:hover {
          color: var(--color-primary-ocean);
        }

        &.showcase-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(8, 131, 149, 0.1);
          color: var(--color-primary-ocean);
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-full);
          font-weight: 700;
          font-size: 0.85rem;

          span.material-symbols-outlined { font-size: 1.05rem; }
        }
      }
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .icon-btn {
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
      }

      .lang-pill-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.45rem 0.85rem;
        border-radius: var(--radius-full);
        border: 1px solid var(--color-border-subtle);
        background: var(--color-surface-card);
        color: var(--color-text-main);
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: var(--color-surface-subtle);
        }

        span.material-symbols-outlined { font-size: 1.05rem; }
      }

      .login-btn {
        color: var(--color-primary-deep);
        font-weight: 700;
        text-decoration: none;
        padding: 0.5rem 0.9rem;
        font-size: 0.9rem;

        &:hover { color: var(--color-primary-ocean); }
      }

      .register-btn, .dashboard-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        background: linear-gradient(135deg, var(--color-primary-deep), var(--color-primary-ocean));
        color: #fff;
        font-weight: 700;
        font-size: 0.88rem;
        padding: 0.55rem 1.15rem;
        border-radius: var(--radius-full);
        text-decoration: none;
        box-shadow: 0 4px 12px rgba(8, 131, 149, 0.25);
        transition: transform 0.2s, box-shadow 0.2s;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(8, 131, 149, 0.35);
        }
      }

      .mobile-toggle-btn {
        display: none;
        background: none;
        border: none;
        color: var(--color-text-main);
        cursor: pointer;
        font-size: 1.5rem;
      }
    }

    .mobile-drawer {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1.25rem;
      background: var(--color-surface-card);
      border-bottom: 1px solid var(--color-border-subtle);

      .drawer-link {
        color: var(--color-text-main);
        text-decoration: none;
        font-size: 1rem;
        font-weight: 600;
        padding: 0.5rem 0;
      }

      .drawer-actions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }
    }

    /* HERO SECTION */
    .hero-section {
      position: relative;
      padding: 5rem 1.5rem 4rem;
      overflow: hidden;

      .hero-ambient-glow {
        position: absolute;
        top: -100px;
        left: 50%;
        transform: translateX(-50%);
        width: 800px;
        height: 500px;
        background: radial-gradient(circle, rgba(5, 191, 219, 0.15) 0%, rgba(8, 131, 149, 0.05) 50%, transparent 70%);
        pointer-events: none;
        z-index: 0;
      }

      .hero-container {
        max-width: 1280px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        align-items: center;
        gap: 3.5rem;
        position: relative;
        z-index: 1;
      }
    }

    .hero-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      .national-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(10, 77, 104, 0.08);
        border: 1px solid rgba(10, 77, 104, 0.15);
        padding: 0.35rem 0.95rem;
        border-radius: var(--radius-full);
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--color-primary-deep);
        width: fit-content;
      }

      .hero-headline {
        font-size: 3.2rem;
        font-weight: 900;
        line-height: 1.15;
        margin: 0;
        display: flex;
        flex-direction: column;
        letter-spacing: -0.02em;

        .headline-primary {
          color: var(--color-text-main);
        }

        .headline-accent {
          background: linear-gradient(135deg, var(--color-primary-deep), var(--color-primary-mint));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }

      .hero-subheading {
        font-size: 1.15rem;
        line-height: 1.6;
        color: var(--color-text-muted);
        margin: 0;
        max-width: 580px;
      }

      .hero-cta-group {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;

        .btn-lg {
          padding: 0.85rem 1.65rem;
          font-size: 1rem;
          font-weight: 800;
          border-radius: var(--radius-full);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          transition: all 0.25s ease;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--color-primary-deep), var(--color-primary-ocean));
          color: #fff;
          box-shadow: 0 8px 24px rgba(8, 131, 149, 0.3);

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 28px rgba(8, 131, 149, 0.4);
          }
        }

        .btn-secondary {
          background: var(--color-surface-card);
          border: 1px solid var(--color-border-subtle);
          color: var(--color-text-main);

          &:hover {
            background: var(--color-surface-subtle);
            border-color: var(--color-primary-ocean);
          }
        }
      }
    }

    .trust-metrics-bar {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--color-border-subtle);

      .metric-item {
        display: flex;
        flex-direction: column;

        .metric-num {
          font-size: 1.6rem;
          font-weight: 900;
          color: var(--color-primary-ocean);
          line-height: 1.1;
        }

        .metric-lbl {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-text-muted);
        }
      }

      .metric-divider {
        width: 1px;
        height: 36px;
        background: var(--color-border-subtle);
      }
    }

    /* 3D Holographic Passport Card */
    .hero-visual {
      display: flex;
      justify-content: center;

      .card-stack-container {
        position: relative;
        width: 100%;
        max-width: 480px;
      }
    }

    .glow-orb {
      position: absolute;
      inset: -20px;
      background: radial-gradient(circle, rgba(5, 191, 219, 0.25) 0%, transparent 60%);
      filter: blur(25px);
      z-index: 0;
    }

    .medic-passport-card {
      position: relative;
      z-index: 1;
      background: linear-gradient(145deg, #0a4d68, #088395);
      color: #fff;
      border-radius: 24px;
      padding: 1.75rem;
      box-shadow: 0 20px 40px rgba(10, 77, 104, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.15);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      backdrop-filter: blur(10px);
      transition: transform 0.3s ease;

      &:hover {
        transform: translateY(-4px);
      }

      .passport-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .passport-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;

          .p-logo {
            width: 42px;
            height: 42px;
            object-fit: contain;
            background: #fff;
            padding: 3px;
            border-radius: 50%;
          }

          .p-title-ar {
            font-size: 0.85rem;
            font-weight: 800;
          }

          .p-title-en {
            font-size: 0.65rem;
            letter-spacing: 0.08em;
            opacity: 0.85;
          }
        }

        .blood-group-tag {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.9);
          color: #fff;
          font-weight: 900;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4);
        }
      }

      .passport-id-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(0, 0, 0, 0.2);
        padding: 0.65rem 1rem;
        border-radius: var(--radius-md);

        .chip-graphic {
          width: 32px;
          height: 24px;
          background: linear-gradient(135deg, #ffd700, #ffae00);
          border-radius: 4px;
          box-shadow: inset 0 0 4px rgba(0,0,0,0.3);
        }

        .id-number {
          font-family: monospace;
          font-size: 1.35rem;
          font-weight: 900;
          letter-spacing: 0.15em;
          color: #05bfdb;
          text-shadow: 0 0 10px rgba(5, 191, 219, 0.5);
        }
      }

      .passport-details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;

        .p-field {
          display: flex;
          flex-direction: column;

          .f-label {
            font-size: 0.65rem;
            text-transform: uppercase;
            opacity: 0.75;
            font-weight: 700;
          }

          .f-val {
            font-size: 0.85rem;
            font-weight: 800;

            &.verified {
              color: #a7f3d0;
              display: inline-flex;
              align-items: center;
              gap: 0.2rem;
              span { font-size: 0.95rem; }
            }
          }
        }
      }

      .vitals-strip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: var(--radius-md);
        padding: 0.5rem 0.85rem;

        .v-pulse-item {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 700;

          .v-icon {
            font-size: 1.1rem;

            &.ecg { color: #34d399; }
            &.bp { color: #38bdf8; }
            &.alert { color: #f87171; }
          }

          .allergy {
            color: #fca5a5;
          }
        }
      }

      .passport-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid rgba(255, 255, 255, 0.15);
        padding-top: 0.75rem;
        font-size: 0.7rem;
        font-weight: 700;
        opacity: 0.9;

        .qr-mini-badge, .encryption-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          span { font-size: 0.95rem; }
        }
      }
    }

    .floating-consent-tag {
      position: absolute;
      bottom: -20px;
      right: -15px;
      z-index: 2;
      background: var(--color-surface-card);
      color: var(--color-text-main);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-full);
      padding: 0.65rem 1.15rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      box-shadow: var(--shadow-lg);
      animation: floatBadge 3.5s ease-in-out infinite alternate;

      .consent-avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: rgba(8, 131, 149, 0.15);
        color: var(--color-primary-ocean);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .consent-meta {
        display: flex;
        flex-direction: column;

        .c-title {
          font-size: 0.8rem;
          font-weight: 800;
        }

        .c-sub {
          font-size: 0.7rem;
          color: var(--color-text-muted);
        }
      }

      .c-status {
        background: #dcfce7;
        color: #15803d;
        font-size: 0.65rem;
        font-weight: 900;
        padding: 0.2rem 0.5rem;
        border-radius: var(--radius-sm);
      }
    }

    @keyframes floatBadge {
      0% { transform: translateY(0); }
      100% { transform: translateY(-8px); }
    }

    /* CAPABILITIES SECTION */
    .capabilities-section, .how-section, .portals-section {
      padding: 5rem 1.5rem;
      border-top: 1px solid var(--color-border-subtle);

      .section-container {
        max-width: 1280px;
        margin: 0 auto;
      }

      .section-header {
        margin-bottom: 3.5rem;

        .section-tag {
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: var(--color-primary-ocean);
          text-transform: uppercase;
        }

        .section-title {
          font-size: 2.2rem;
          font-weight: 900;
          color: var(--color-text-main);
          margin: 0.5rem 0;
        }

        .section-subtitle {
          color: var(--color-text-muted);
          font-size: 1.05rem;
          max-width: 650px;
          margin: 0 auto;
        }
      }
    }

    .capabilities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: 1.5rem;
    }

    .cap-card {
      background: var(--color-surface-card);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-card);
      padding: 2rem;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        border-color: var(--color-primary-mint);
        box-shadow: var(--shadow-md);
      }

      .cap-icon-box {
        width: 54px;
        height: 54px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;

        span { font-size: 1.8rem; }

        &.teal { background: rgba(10, 77, 104, 0.12); color: var(--color-primary-deep); }
        &.ocean { background: rgba(8, 131, 149, 0.12); color: var(--color-primary-ocean); }
        &.red { background: rgba(239, 68, 68, 0.12); color: #dc2626; }
        &.mint { background: rgba(5, 191, 219, 0.15); color: var(--color-primary-deep); }
        &.amber { background: rgba(245, 158, 11, 0.12); color: #d97706; }
        &.purple { background: rgba(99, 102, 241, 0.12); color: #4f46e5; }
      }

      .cap-title {
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--color-text-main);
        margin: 0;
      }

      .cap-desc {
        color: var(--color-text-muted);
        font-size: 0.95rem;
        line-height: 1.6;
        margin: 0;
      }
    }

    /* HOW IT WORKS */
    .steps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .step-card {
      background: var(--color-surface-card);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-card);
      padding: 2.25rem;
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .step-number {
        font-size: 2.8rem;
        font-weight: 900;
        color: rgba(8, 131, 149, 0.2);
        line-height: 1;
      }

      .step-title {
        font-size: 1.2rem;
        font-weight: 800;
        color: var(--color-text-main);
        margin: 0;
      }

      .step-desc {
        color: var(--color-text-muted);
        line-height: 1.6;
        font-size: 0.95rem;
        margin: 0;
      }
    }

    /* PORTALS SECTION */
    .portal-nav-tabs {
      display: flex;
      justify-content: center;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-bottom: 2.5rem;

      .p-tab-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--color-surface-card);
        border: 1px solid var(--color-border-subtle);
        padding: 0.75rem 1.35rem;
        border-radius: var(--radius-full);
        font-weight: 700;
        font-size: 0.9rem;
        color: var(--color-text-muted);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          color: var(--color-primary-ocean);
        }

        &.active {
          background: linear-gradient(135deg, var(--color-primary-deep), var(--color-primary-ocean));
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(8, 131, 149, 0.25);
        }
      }
    }

    .portal-display-card {
      background: var(--color-surface-card);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-card);
      padding: 3rem;
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      align-items: center;
      gap: 3rem;
      box-shadow: var(--shadow-md);

      .display-left {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;

        .role-badge {
          background: rgba(8, 131, 149, 0.12);
          color: var(--color-primary-ocean);
          font-size: 0.8rem;
          font-weight: 800;
          padding: 0.3rem 0.85rem;
          border-radius: var(--radius-full);
          width: fit-content;
        }

        .display-title {
          font-size: 2rem;
          font-weight: 900;
          color: var(--color-text-main);
          margin: 0;
        }

        .display-desc {
          color: var(--color-text-muted);
          font-size: 1.05rem;
          line-height: 1.6;
          margin: 0;
        }

        .feature-bullets {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;

          .bullet-item {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--color-text-main);

            .check-icon {
              color: #059669;
              font-size: 1.25rem;
            }
          }
        }

        .display-actions {
          margin-top: 0.5rem;

          .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            text-decoration: none;
            padding: 0.75rem 1.5rem;
            font-weight: 800;
            border-radius: var(--radius-full);
          }
        }
      }

      .display-right {
        .screen-preview-mockup {
          background: var(--color-bg-app);
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-md);
          overflow: hidden;
          box-shadow: var(--shadow-lg);

          .mockup-header {
            background: var(--color-surface-subtle);
            padding: 0.6rem 1rem;
            display: flex;
            align-items: center;
            gap: 0.4rem;
            border-bottom: 1px solid var(--color-border-subtle);

            .circle {
              width: 10px;
              height: 10px;
              border-radius: 50%;

              &.red { background: #ef4444; }
              &.yellow { background: #f59e0b; }
              &.green { background: #10b981; }
            }

            .mockup-title {
              font-family: monospace;
              font-size: 0.75rem;
              color: var(--color-text-muted);
              margin-left: 0.5rem;
            }
          }

          .mockup-body {
            padding: 3rem 2rem;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;

            .preview-hero-icon {
              width: 72px;
              height: 72px;
              border-radius: 50%;
              background: rgba(8, 131, 149, 0.12);
              color: var(--color-primary-ocean);
              display: flex;
              align-items: center;
              justify-content: center;

              span { font-size: 2.5rem; }
            }

            h4 { margin: 0; font-size: 1.25rem; font-weight: 800; color: var(--color-text-main); }
            p { margin: 0; font-size: 0.85rem; color: var(--color-text-muted); max-width: 300px; }

            .mockup-pill-row {
              display: flex;
              gap: 0.5rem;
              margin-top: 0.5rem;

              .mock-tag {
                font-size: 0.65rem;
                font-weight: 800;
                background: var(--color-surface-card);
                border: 1px solid var(--color-border-subtle);
                padding: 0.2rem 0.6rem;
                border-radius: var(--radius-full);
                color: var(--color-text-muted);
              }
            }
          }
        }
      }
    }

    /* CTA BANNER */
    .cta-section {
      padding: 4rem 1.5rem;

      .cta-container {
        max-width: 1280px;
        margin: 0 auto;
      }

      .cta-card {
        background: linear-gradient(135deg, var(--color-primary-deep), var(--color-primary-ocean));
        border-radius: 28px;
        padding: 4.5rem 2rem;
        color: #fff;
        text-align: center;
        box-shadow: 0 20px 50px rgba(10, 77, 104, 0.35);

        .cta-content {
          max-width: 700px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .cta-title {
          font-size: 2.4rem;
          font-weight: 900;
          margin: 0;
          line-height: 1.2;
        }

        .cta-subtitle {
          font-size: 1.15rem;
          opacity: 0.9;
          margin: 0;
          line-height: 1.6;
        }

        .cta-buttons {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-top: 1rem;
          flex-wrap: wrap;

          .btn-lg {
            padding: 0.85rem 1.85rem;
            font-size: 1rem;
            font-weight: 800;
            border-radius: var(--radius-full);
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
            transition: all 0.25s ease;
          }

          .btn-white {
            background: #fff;
            color: var(--color-primary-deep);
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(0,0,0,0.25);
            }
          }

          .btn-outline-white {
            background: transparent;
            color: #fff;
            border: 2px solid rgba(255, 255, 255, 0.7);

            &:hover {
              background: rgba(255, 255, 255, 0.1);
              border-color: #fff;
            }
          }
        }
      }
    }

    /* FOOTER */
    .landing-footer {
      background: var(--color-surface-card);
      border-top: 1px solid var(--color-border-subtle);
      padding: 4rem 1.5rem 2rem;

      .footer-container {
        max-width: 1280px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 3rem;
      }

      .footer-top {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        gap: 3rem;
      }

      .footer-brand-col {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;

          .f-logo {
            width: 38px;
            height: 38px;
            object-fit: contain;
          }

          .f-text {
            display: flex;
            flex-direction: column;
            .ar { font-size: 1.1rem; font-weight: 800; color: var(--color-primary-deep); }
            .en { font-size: 0.7rem; font-weight: 800; color: var(--color-primary-ocean); }
          }
        }

        .footer-mission {
          color: var(--color-text-muted);
          font-size: 0.95rem;
          line-height: 1.6;
          max-width: 380px;
          margin: 0;
        }

        .footer-meta-pill {
          display: inline-block;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-text-muted);
        }
      }

      .footer-links-col {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 800;
          color: var(--color-text-main);
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;

          li a {
            color: var(--color-text-muted);
            text-decoration: none;
            font-size: 0.9rem;
            transition: color 0.2s;

            &:hover {
              color: var(--color-primary-ocean);
            }
          }
        }
      }

      .footer-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid var(--color-border-subtle);
        padding-top: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;

        p { margin: 0; font-size: 0.85rem; color: var(--color-text-muted); }

        .footer-badges {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          font-weight: 600;
        }
      }
    }

    /* RESPONSIVE BREAKDOWN */
    @media (max-width: 1024px) {
      .hero-section .hero-container {
        grid-template-columns: 1fr;
        gap: 3rem;
        text-align: center;
      }

      .hero-content {
        align-items: center;
        .national-badge { margin: 0 auto; }
        .hero-subheading { margin: 0 auto; }
        .hero-cta-group { justify-content: center; }
        .trust-metrics-bar { justify-content: center; }
      }

      .portal-display-card {
        grid-template-columns: 1fr;
      }

      .footer-top {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .desktop-menu { display: none; }
      .nav-actions .mobile-toggle-btn { display: flex; }
      .nav-actions .login-btn,
      .nav-actions .register-btn,
      .nav-actions .dashboard-btn { display: none; }

      .hero-content .hero-headline {
        font-size: 2.2rem;
      }

      .trust-metrics-bar {
        flex-direction: column;
        gap: 0.75rem;
        .metric-divider { display: none; }
      }
    }
  `]
})
export class LandingComponent {
  public themeService = inject(ThemeService);
  public langService = inject(LanguageService);
  public authService = inject(AuthService);

  public isMobileMenuOpen = false;

  public rolesList: PortalRole[] = [
    {
      id: 'patient',
      nameEn: 'Patient Portal',
      nameAr: 'بوابة المريض وجواز صحتي',
      icon: 'person',
      badgeEn: 'CITIZEN HEALTH PASSPORT',
      badgeAr: 'الجواز الطبي الموحد للمواطن',
      descEn: 'Empowering citizens with full visibility and control over their medical history, diagnostic laboratory reports, and authorized physicians.',
      descAr: 'تمكين المواطن من الوصول الكامل لتاريخه الطبي، تقارير التحاليل والفحوصات، وإدارة مواعيد العيادات والأذونات الممنوحة للأطباء.',
      featuresEn: [
        'Unified Health ID card (SH-YYYY-NNNNNN)',
        'Emergency rescue QR profile for paramedics',
        'Granular doctor consent engine (grant & revoke)',
        'Electronic prescriptions & medication history'
      ],
      featuresAr: [
        'بطاقة الكود الصحي الموحد (SH-YYYY-NNNNNN)',
        'ملف طوارئ QR متاح للإسعاف في الحالات الحرجة',
        'محرك التحكم في خصوصية وأذونات الأطباء',
        'أرشيف الروشتات الإلكترونية وتاريخ الأدوية'
      ],
      route: '/passport'
    },
    {
      id: 'doctor',
      nameEn: 'Doctor Workspace',
      nameAr: 'عيادة الطبيب المعالج',
      icon: 'stethoscope',
      badgeEn: 'CLINICAL ENCOUNTER & RX',
      badgeAr: 'الكشف الطبي والروشتة الإلكترونية',
      descEn: 'A high-efficiency clinical suite engineered for specialist physicians to review patient charts, record vitals, and issue certified digital prescriptions.',
      descAr: 'بيئة عمل سريرية متطورة تتيح للأطباء استعراض التاريخ المرضي، تسجيل العلامات الحيوية، وتوثيق التشخيص والروشتة الرقمية المعتمدة.',
      featuresEn: [
        'Real-time daily patient waiting queue',
        'Vitals recorder with automatic BMI calculation',
        'ICD-10 international diagnostic coding',
        'Digital prescription pad simulation with signature'
      ],
      featuresAr: [
        'طابور كشف مباشر يربط الاستقبال بغرفة الفحص',
        'تسجيل العلامات الحيوية وحساب كتلة الجسم آلياً',
        'تصنيف التشخيصات وفق الأكواد الدولية ICD-10',
        'إصدار روشتة رقمية محصنة بتوقيع الطبيب المعتمد'
      ],
      route: '/doctor/queue'
    },
    {
      id: 'reception',
      nameEn: 'Reception Desk',
      nameAr: 'مكتب الاستقبال والتسجيل',
      icon: 'desk',
      badgeEn: 'WALK-IN & QUEUE ALLOCATION',
      badgeAr: 'تسجيل المرضى وإدارة الطابور',
      descEn: 'Streamlining clinic admissions with quick patient registration, Unified ID generation, and intelligent queue token assignment.',
      descAr: 'تنظيم حركة الدخول بالعيادات مع سرعة تسجيل المرضى الجدد وتوليد كود صحتي الموحد، وتوزيع أرقام الطابور اللحظية.',
      featuresEn: [
        'Fast search by Unified ID, National ID, or Phone',
        'Instant patient registration modal with auto-ID',
        'Token allocation and queue assignment',
        'Live synchronization with doctor examination rooms'
      ],
      featuresAr: [
        'بحث سريع بالكود الموحد أو الرقم القومي أو الهاتف',
        'استمارة تسجيل سريعة وإصدار فوري للكود الطبي',
        'تخصيص أرقام الكشف وتوجيه الحالات للأطباء',
        'مزامنة حية ولحظية مع غرف الأطباء بالعيادة'
      ],
      route: '/receptionist'
    },
    {
      id: 'clinic',
      nameEn: 'Clinic Administration',
      nameAr: 'إدارة المنشأة والعيادة',
      icon: 'domain',
      badgeEn: 'FACILITY & ROSTER MANAGEMENT',
      badgeAr: 'إدارة الكادر الطبي والتشغيل',
      descEn: 'Comprehensive facility administration to orchestrate doctors rosters, consultation fees, receptionist shifts, and operational schedules.',
      descAr: 'إدارة شاملة للمنشأة الطبية لتنظيم قوائم الأطباء المعتمدين، أسعار الكشوفات، نوبات الاستقبال، وضبط مواعيد العمل.',
      featuresEn: [
        'Doctor affiliation management & fee setup',
        'Receptionist staff shift orchestration',
        'Weekly operational schedules & slot durations',
        'Facility compliance & license tracking'
      ],
      featuresAr: [
        'إدارة ربط الأطباء بالعيادة وتحديد أسعار الكشف',
        'توزيع نوبات عمل موظفي الاستقبال',
        'ضبط ساعات العمل الأسبوعية وفترات الكشف',
        'متابعة تراخيص المنشأة ومعايير الامتثال'
      ],
      route: '/clinic/admin'
    },
    {
      id: 'admin',
      nameEn: 'Security & Audit Portal',
      nameAr: 'الرقابة والأمان والامتثال',
      icon: 'policy',
      badgeEn: 'FORENSIC AUDIT TRAIL',
      badgeAr: 'السجل الأمني غير القابل للتعديل',
      descEn: 'Enterprise-grade transparency logging every single medical record view, update, and revocation with forensic accuracy.',
      descAr: 'أعلى معايير الرقابة والشفافية مع توثيق غير قابل للتعديل لكل عملية قراءة أو كتابة للسجلات الطبية لمنع أي تسريب أو وصول غير مصرح به.',
      featuresEn: [
        'Immutable WORM security audit log',
        'Searchable by actor email, entity, and client IP',
        'Forensic JSON payload inspector',
        'Instant CSV compliance export'
      ],
      featuresAr: [
        'سجل أمني محصن غير قابل للتعديل (WORM)',
        'بحث فوري بالبريد واسم الكيان وعنوان IP',
        'فاحص جنائي لتفاصيل الحدث الأمني وسياقه',
        'تصدير تقارير الامتثال بنقرة واحدة بتنسيق CSV'
      ],
      route: '/admin/audit'
    }
  ];

  public selectedRole: PortalRole = this.rolesList[0];
}

