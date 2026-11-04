import { Injectable, computed, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';

export type AppLanguage = 'en' | 'ar';

const LANG_STORAGE_KEY = 'sehati_lang';

export interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

export const APP_TRANSLATIONS: Translations = {
  brandTitle: { en: 'SEHATI', ar: 'صِحّتي' },
  brandTagline: {
    en: 'Unified Digital Health Record & Clinic Platform',
    ar: 'المنظومة الرقمية الموحدة للسجلات الطبية والعيادات'
  },
  onePatientOneRecord: {
    en: 'One Patient, One Medical History, Better Healthcare.',
    ar: 'مريض واحد، سجل طبي واحد، رعاية صحية أفضل.'
  },
  themeLight: { en: 'Light Mode', ar: 'الوضع الفاتح' },
  themeDark: { en: 'Dark Mode', ar: 'الوضع الليلي' },
  langEnglish: { en: 'English', ar: 'English' },
  langArabic: { en: 'العربية', ar: 'العربية' },
  loginTitle: { en: 'Sign In to Sehati', ar: 'تسجيل الدخول إلى صِحّتي' },
  loginSubtitle: {
    en: 'Enter your email or phone number to access your unified medical records.',
    ar: 'أدخل بريدك الإلكتروني أو رقم هاتفك للوصول إلى سجلك الطبي الموحد.'
  },
  identifierLabel: { en: 'Email or Phone Number', ar: 'البريد الإلكتروني أو رقم الهاتف' },
  identifierPlaceholder: { en: 'name@example.com or 01012345678', ar: 'name@example.com أو 01012345678' },
  passwordLabel: { en: 'Password', ar: 'كلمة المرور' },
  passwordPlaceholder: { en: '••••••••', ar: '••••••••' },
  rememberMe: { en: 'Remember this device', ar: 'تذكر هذا الجهاز' },
  signInBtn: { en: 'Sign In', ar: 'تسجيل الدخول' },
  dontHaveAccount: { en: "Don't have an account yet?", ar: 'ليس لديك حساب بعد؟' },
  createAccountLink: { en: 'Create Account', ar: 'إنشاء حساب جديد' },
  alreadyHaveAccount: { en: 'Already have an account?', ar: 'لديك حساب بالفعل؟' },
  registerTitle: { en: 'Create Sehati Account', ar: 'إنشاء حساب صِحّتي جديد' },
  registerSubtitle: {
    en: 'Connect your health passport across hospitals, clinics, and diagnostic labs.',
    ar: 'اربط جوازك الطبي عبر المستشفيات والعيادات ومعامل التحاليل.'
  },
  rolePatient: { en: 'Patient', ar: 'مريض' },
  roleDoctor: { en: 'Doctor', ar: 'طبيب معالج' },
  roleReceptionist: { en: 'Receptionist', ar: 'موظف استقبال' },
  fullNameLabel: { en: 'Full Name', ar: 'الاسم بالكامل' },
  nationalIdLabel: { en: 'National ID (14 digits)', ar: 'الرقم القومي (14 رقم)' },
  phoneNumberLabel: { en: 'Phone Number', ar: 'رقم الهاتف المحمول' },
  emailLabel: { en: 'Email Address', ar: 'البريد الإلكتروني' },
  dateOfBirthLabel: { en: 'Date of Birth', ar: 'تاريخ الميلاد' },
  genderLabel: { en: 'Gender', ar: 'النوع' },
  genderMale: { en: 'Male', ar: 'ذكر' },
  genderFemale: { en: 'Female', ar: 'أنثى' },
  bloodTypeLabel: { en: 'Blood Type', ar: 'فصيلة الدم' },
  licenseNumberLabel: { en: 'Medical License Number', ar: 'رقم ترخيص مزاولة المهنة' },
  specialtyLabel: { en: 'Medical Specialty', ar: 'التخصص الطبي' },
  clinicIdLabel: { en: 'Clinic Code / ID', ar: 'كود / معرف العيادة' },
  createAccountBtn: { en: 'Create Account', ar: 'إنشاء الحساب' },
  dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
  myMedicalPassport: { en: 'Medical Passport', ar: 'جوازي الطبي الموحد' },
  appointments: { en: 'Appointments', ar: 'المواعيد والحجوزات' },
  prescriptions: { en: 'Digital Prescriptions', ar: 'الروشتات الإلكترونية' },
  consentEngine: { en: 'Doctor Permissions & Consent', ar: 'أذونات الأطباء والموافقة' },
  emergencyProfile: { en: 'Emergency QR Card', ar: 'بطاقة الطوارئ السريعة' },
  doctorWorkspace: { en: "Doctor's Consultation", ar: 'عيادة الكشف الطبي' },
  patientQueue: { en: "Today's Patient Queue", ar: 'طابور المرضى اليوم' },
  patientSearch: { en: 'Patient Search & Verification', ar: 'البحث والتحقق من المريض' },
  receptionistDesk: { en: 'Reception Desk', ar: 'مكتب الاستقبال والدخول' },
  clinicManagement: { en: 'Clinic Management', ar: 'إدارة العيادة والمواعيد' },
  auditLog: { en: 'Security Audit Trail', ar: 'سجل العمليات والأمان' },
  logout: { en: 'Sign Out', ar: 'تسجيل الخروج' },
  architectureShowcase: { en: 'Architecture Showcase', ar: 'استعراض الهيكلية والأنظمة' }
};

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private storage = inject(StorageService);

  private langSignal = signal<AppLanguage>(this.getInitialLang());

  public readonly currentLang = this.langSignal.asReadonly();
  public readonly isRtl = computed(() => this.langSignal() === 'ar');

  constructor() {
    this.applyLanguage(this.langSignal());
  }

  private getInitialLang(): AppLanguage {
    const saved = this.storage.getItem(LANG_STORAGE_KEY);
    if (saved === 'ar' || saved === 'en') {
      return saved;
    }
    return 'en';
  }

  public toggleLanguage(): void {
    const next: AppLanguage = this.langSignal() === 'en' ? 'ar' : 'en';
    this.setLanguage(next);
  }

  public setLanguage(lang: AppLanguage): void {
    this.langSignal.set(lang);
    this.storage.setItem(LANG_STORAGE_KEY, lang);
    this.applyLanguage(lang);
  }

  public t(key: string): string {
    const entry = APP_TRANSLATIONS[key];
    if (!entry) return key;
    return entry[this.langSignal()] || entry['en'] || key;
  }

  private applyLanguage(lang: AppLanguage): void {
    if (typeof document !== 'undefined') {
      const isArabic = lang === 'ar';
      document.documentElement.lang = lang;
      document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
      if (isArabic) {
        document.documentElement.classList.add('rtl');
        document.body.classList.add('rtl');
      } else {
        document.documentElement.classList.remove('rtl');
        document.body.classList.remove('rtl');
      }
    }
  }
}

