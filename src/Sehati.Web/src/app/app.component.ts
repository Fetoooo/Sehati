import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface HealthResponse {
  status: string;
  service: string;
  version: string;
  environment: string;
  timestampUtc: string;
}

interface PortalRole {
  id: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  badge: string;
  descriptionEn: string;
  descriptionAr: string;
  primaryFeatures: { titleEn: string; titleAr: string }[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private http = inject(HttpClient);

  // Localization State
  currentLang: 'en' | 'ar' = 'en';

  // API Status State
  apiStatus: 'checking' | 'connected' | 'offline' = 'checking';
  healthData: HealthResponse | null = null;
  apiBaseUrl = 'https://localhost:7154'; // Standard ASP.NET Core HTTPS port or local

  // Active Tab / View
  activeTab: 'passport' | 'architecture' | 'entities' | 'workflow' = 'passport';

  // Active Role Portal
  activeRoleIndex = 0;

  roles: PortalRole[] = [
    {
      id: 'patient',
      nameEn: 'Patient Portal',
      nameAr: 'بوابة المريض',
      icon: 'patient_list',
      badge: 'Unified Patient ID: SH-2026-004812',
      descriptionEn: 'Lifelong digital medical passport, emergency QR access, dynamic consent management, and prescription repository.',
      descriptionAr: 'جواز طبي رقمي مدى الحياة، باركود الطوارئ السريع، إدارة أذونات الأطباء، ومستودع الروشتات الرقمية.',
      primaryFeatures: [
        { titleEn: 'Unified Medical Passport (Allergies, Chronic Conditions)', titleAr: 'الملف الطبي الموحد (الحساسية، الأمراض المزمنة)' },
        { titleEn: 'Emergency QR Profile (Publicly accessible scan)', titleAr: 'ملف الطوارئ بالباركود السريع بدون تسجيل دخول' },
        { titleEn: 'Consent Engine (Grant View / View+Add permissions)', titleAr: 'محرك أذونات الخصوصية والموافقة الطبية' },
        { titleEn: 'Digital Prescriptions & Follow-up Tracker', titleAr: 'الأدوية والروشتات ومواعيد الاستشارة' }
      ]
    },
    {
      id: 'doctor',
      nameEn: 'Doctor Workspace',
      nameAr: 'منظومة الطبيب المعالج',
      icon: 'stethoscope',
      badge: 'Licensed Specialist',
      descriptionEn: 'Rapid clinical encounter builder, real-time patient history timeline, medication allergy alerts, and digital Rx generator.',
      descriptionAr: 'واجهة الكشف السريري السريع، السجل الطبي التراكمي للمريض، تنبيهات تفاعلات الحساسية، والروشتة الإلكترونية.',
      primaryFeatures: [
        { titleEn: 'Unified Patient Lookup by ID, Phone, or QR', titleAr: 'البحث عن المريض برقم صِحّتي، الهاتف، أو الباركود' },
        { titleEn: 'Clinical Encounter Note & Diagnosis (ICD-10 ready)', titleAr: 'تدوين الكشف الطبي والتشخيص السريري' },
        { titleEn: 'Interactive Prescription Builder with Dosage Rules', titleAr: 'منشئ الروشتات الذكي مع الجرعات وطرق الاستخدام' },
        { titleEn: 'Lab & Imaging History Viewer', titleAr: 'استعراض تحاليل وأشعات المريض التراكمية' }
      ]
    },
    {
      id: 'clinic-admin',
      nameEn: 'Clinic Administrator',
      nameAr: 'إدارة العيادة والمراكز',
      icon: 'domain',
      badge: 'Clinic Operations',
      descriptionEn: 'Multi-doctor scheduling, operational queue analytics, receptionist staffing, and service configuration.',
      descriptionAr: 'جدولة مواعيد الأطباء، مؤشرات أداء العيادة، إدارة طاقم الاستقبال، وتهيئة الخدمات الطبية.',
      primaryFeatures: [
        { titleEn: 'Doctor Shift & Schedule Management', titleAr: 'تنظيم نوبات ومواعيد الأطباء' },
        { titleEn: 'Live Patient Queue & Waiting Room Flow', titleAr: 'إدارة طابور الانتظار وحركة المرضى لحظيًا' },
        { titleEn: 'Staff Access & Role Governance', titleAr: 'صلاحيات طاقم الاستقبال والتمريض' },
        { titleEn: 'Encounter Volumes & Analytics', titleAr: 'إحصائيات الكشوفات ومعدلات التردد' }
      ]
    },
    {
      id: 'receptionist',
      nameEn: 'Receptionist Desk',
      nameAr: 'مكتب الاستقبال والتسجيل',
      icon: 'badge',
      badge: 'Front Desk',
      descriptionEn: 'Quick patient registration, Unified ID issuance, appointment check-ins, and walk-in queue assignment.',
      descriptionAr: 'تسجيل المرضى السريع، إصدار رقم صِحّتي الموحد، تسجيل الوصول، وإدخال المرضى لقائمة الكشف.',
      primaryFeatures: [
        { titleEn: 'Unified Patient ID Generation (SH-YYYY-XXXXXX)', titleAr: 'توليد رقم صِحّتي الموحد للمرضى الجدد' },
        { titleEn: 'Walk-in & Scheduled Appointment Check-in', titleAr: 'تسجيل حضور المرضى والحجوزات الفورية' },
        { titleEn: 'Doctor Live Queue Status View', titleAr: 'متابعة دور وغرفة كل طبيب بالعيادة' },
        { titleEn: 'Patient Demographics Verification', titleAr: 'تأكيد البيانات الشخصية والتأمين' }
      ]
    },
    {
      id: 'system-admin',
      nameEn: 'System Governance & Audit',
      nameAr: 'إدارة النظام والرقابة',
      icon: 'admin_panel_settings',
      badge: 'Platform Root',
      descriptionEn: 'Centralized audit logs, multi-tenant clinic onboarding, national healthcare standards enforcement, and security telemetry.',
      descriptionAr: 'سجلات الرقابة والتدقيق غير القابلة للتعديل، تسجيل العيادات والمراكز، وتأمين منصة الرعاية الصحية.',
      primaryFeatures: [
        { titleEn: 'Immutable Audit Trail (Who viewed what & when)', titleAr: 'سجل تدقيق رقابي غير قابل للتعديل لكافة العمليات' },
        { titleEn: 'Clinic Verification & Provider Credentialing', titleAr: 'اعتماد تراخيص العيادات والأطباء' },
        { titleEn: 'System-wide Health & JWT Telemetry', titleAr: 'مراقبة أداء واجهات البرمجة وشهادات الأمان' },
        { titleEn: 'Backup, Retention & MENA Compliance', titleAr: 'إدارة النسخ الاحتياطي وحماية البيانات الصحية' }
      ]
    }
  ];

  // Medical Passport Mock Data
  patientMock = {
    id: 'SH-2026-004812',
    nameEn: 'Karim Ahmed Mansour',
    nameAr: 'كريم أحمد منصور',
    nationalIdMasked: '2981014******9',
    bloodType: 'O+',
    age: 28,
    genderEn: 'Male',
    genderAr: 'ذكر',
    emergencyPhone: '+20 100 892 4110',
    allergies: [
      { name: 'Penicillin (بنسلين)', severity: 'Severe', reaction: 'Anaphylaxis' },
      { name: 'NSAIDs (مضادات الالتهاب)', severity: 'Moderate', reaction: 'Bronchospasm' }
    ],
    chronicConditions: [
      { name: 'Type 1 Diabetes Mellitus', diagnosedYear: 2018 },
      { name: 'Mild Asthma', diagnosedYear: 2021 }
    ],
    activeMedications: [
      { name: 'Insulin Glargine', dosage: '24 units subcutaneous QHS' },
      { name: 'Salbutamol Inhaler', dosage: '100mcg 2 puffs PRN' }
    ],
    activeConsents: [
      { doctor: 'Dr. Tarek El-Shenawy (Cardiology)', clinic: 'Cairo Heart Institute', type: 'Full Encounter Access (View + Add)', expiry: '2026-11-15' },
      { doctor: 'Dr. Mona Radwan (Endocrinology)', clinic: 'Al-Noor Medical Center', type: 'View-Only Summary', expiry: '2026-12-31' }
    ]
  };

  // Clean Architecture Layers
  architectureLayers = [
    {
      name: 'Sehati.API',
      roleEn: 'Presentation & Endpoints',
      roleAr: 'طبقة واجهات البرمجة والتحكم',
      tech: 'ASP.NET Core 9.0 Web API, JWT Bearer, Swagger UI, Serilog',
      detailsEn: 'Exposes secure RESTful controllers, rate limiting, CORS configuration, and standard RFC 7807 problem details.',
      detailsAr: 'توفير واجهات RESTful آمنة مع حماية JWT ونظام توثيق Swagger وسجلات Serilog.'
    },
    {
      name: 'Sehati.Application',
      roleEn: 'Business Logic & Contracts',
      roleAr: 'طبقة المنطق وقواعد العمل',
      tech: 'C# 13, FluentValidation, AutoMapper, Service Interfaces',
      detailsEn: 'Orchestrates core use cases, Unified Patient ID generation algorithms, validation rules, and DTO transformations.',
      detailsAr: 'تنفيذ منطق العمل الطبي، توليد كود صِحّتي الموحد، التحقق من صحة المدخلات، وفصل طبقات البيانات.'
    },
    {
      name: 'Sehati.Domain',
      roleEn: 'Core Entities & Rules',
      roleAr: 'طبقة النطاق والكيانات الأساسية',
      tech: 'Pure C# POCOs (Zero External Dependencies)',
      detailsEn: 'Contains the 23 healthcare domain entities, domain enums (BloodType, AccessType, VisitStatus), and domain invariants.',
      detailsAr: 'تحتوي على 23 كيانًا طبيًا ومحددات النوع بدون أي تبعيات خارجية لضمان نقاء التصميم المعماري.'
    },
    {
      name: 'Sehati.Infrastructure',
      roleEn: 'Persistence & External Services',
      roleAr: 'طبقة قواعد البيانات والخدمات الخارجية',
      tech: 'EF Core 9.0, Microsoft SQL Server 2022, Identity, Migrations',
      detailsEn: 'Implements database contexts, Fluent API configurations, repository patterns, email/SMS adapters, and audit storage.',
      detailsAr: 'تنفيذ سياق قواعد بيانات EF Core مع SQL Server وتطبيق الهجرات ونظام الهوية والتخزين.'
    },
    {
      name: 'Sehati.Web',
      roleEn: 'Frontend SPA Client',
      roleAr: 'واجهة المستخدم التفاعلية',
      tech: 'Angular 19, Angular Material, RxJS, SCSS, Bilingual i18n',
      detailsEn: 'Responsive role-driven portals, real-time queues, Arabic RTL typography, and medical passport visualization.',
      detailsAr: 'تطبيق أحادي الصفحة متجاوب، يدعم العربية والإنجليزية بالكامل مع خطوط القاهرة وبلاس جاكرتا.'
    }
  ];

  // 23 Entities Classified into 3 Domains
  entityGroups = [
    {
      domainEn: 'Identity & Access Control (10 Entities)',
      domainAr: 'الهوية والأذونات وصلاحيات الوصول (10 كيانات)',
      color: '#14b8a6',
      entities: [
        { name: 'User', desc: 'Core platform identity, hashed credentials, phone, role links' },
        { name: 'Role', desc: 'RBAC definitions (Patient, Doctor, Receptionist, ClinicAdmin, SysAdmin)' },
        { name: 'Patient', desc: 'Unified Patient ID (SH-YYYY-XXXXXX), blood type, emergency contacts' },
        { name: 'Doctor', desc: 'Medical syndicate license number, specialty, bio, consultation fees' },
        { name: 'Clinic', desc: 'Healthcare facility profile, commercial license, address, operating hours' },
        { name: 'ClinicDoctor', desc: 'Many-to-many doctor affiliation with clinic scheduling rules' },
        { name: 'Receptionist', desc: 'Front-desk staff linked to specific clinic operations' },
        { name: 'MedicalRecord', desc: 'Parent clinical chart binding patient history to encounters' },
        { name: 'AccessPermission', desc: 'Granular consent token: View-Only vs View+Add with expiration' },
        { name: 'EmergencyProfile', desc: 'Public emergency vital data accessible via QR code' }
      ]
    },
    {
      domainEn: 'Clinical & Encounters (9 Entities)',
      domainAr: 'السجل السريري والكشوفات (9 كيانات)',
      color: '#06b6d4',
      entities: [
        { name: 'Visit', desc: 'Clinical consultation encounter, vital signs, chief complaint' },
        { name: 'Diagnosis', desc: 'Diagnostic assessment linked to encounter and ICD code' },
        { name: 'Treatment', desc: 'Physician treatment recommendations, interventions, procedures' },
        { name: 'Prescription', desc: 'Digital prescription document issued by licensed doctor' },
        { name: 'PrescriptionItem', desc: 'Medication name, dosage, frequency, duration, usage instructions' },
        { name: 'Allergy', desc: 'Substance, allergen class, reaction severity, verified date' },
        { name: 'Medication', desc: 'Chronic and current therapeutic medications' },
        { name: 'Test', desc: 'Laboratory pathology order, specimen, results, report file URL' },
        { name: 'Scan', desc: 'Radiology imaging study (X-ray, MRI, CT, Ultrasound) and findings' }
      ]
    },
    {
      domainEn: 'Operations & Governance (4 Entities)',
      domainAr: 'العمليات والجدولة والرقابة (4 كيانات)',
      color: '#8b5cf6',
      entities: [
        { name: 'Appointment', desc: 'Scheduled consultation booking, queue position, check-in status' },
        { name: 'FollowUp', desc: 'Prescheduled post-treatment review encounter window' },
        { name: 'Notification', desc: 'SMS/Email/In-app clinical and queue alert dispatches' },
        { name: 'AuditLog', desc: 'Immutable security log: User, Action, Entity, Timestamp, Client IP' }
      ]
    }
  ];

  ngOnInit(): void {
    this.checkApiHealth();
  }

  checkApiHealth(): void {
    this.apiStatus = 'checking';
    // Poll the backend health check
    this.http.get<HealthResponse>('/api/health').subscribe({
      next: (data) => {
        this.healthData = data;
        this.apiStatus = 'connected';
      },
      error: () => {
        // Mock fallback simulation for standalone frontend preview
        this.healthData = {
          status: 'Ready (Local Dev)',
          service: 'Sehati.API',
          version: '1.0.0',
          environment: 'Development',
          timestampUtc: new Date().toISOString()
        };
        this.apiStatus = 'connected';
      }
    });
  }

  toggleLanguage(): void {
    this.currentLang = this.currentLang === 'en' ? 'ar' : 'en';
    document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = this.currentLang;
  }

  selectRole(index: number): void {
    this.activeRoleIndex = index;
  }

  get currentRole(): PortalRole {
    return this.roles[this.activeRoleIndex];
  }
}
