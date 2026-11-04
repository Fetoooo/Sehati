# 📝 SEHATI — Changelog

All notable changes to the Sehati project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]
### Added
- Phase 9: Frontend–Backend Integration & Feature Screens
  - Patient Portal screens:
    - Unified Medical Passport (`PassportComponent`): Digital physical ID card simulation, allergies with severity indicators, active medications, pathology lab tests with reference ranges, and diagnostic scans.
    - Dynamic Consent Engine (`ConsentComponent`): Granular provider permission management (`ViewOnly`, `ViewAndAddRecords`), active status verification, and instant one-click revocation.
    - Emergency QR Profile (`EmergencyCardComponent`): Critical ER triage dashboard with blood type pill, severe allergy alert banners, emergency contact speed-call, and printable wallet card view; public anonymous route (`/emergency-public/:id`) for paramedics and ER personnel.
    - Appointments & Scheduling (`AppointmentsComponent`): Status filter tabs (`Pending`, `Confirmed`, `Completed`, `Cancelled`), doctor specialty tags, clinic location badges, and interactive booking modal with double-booking feedback.
  - Doctor Workspace screens:
    - Daily Patient Queue (`DoctorQueueComponent`): Live waiting list with token numbers, consultation status transitions (`Pending`, `Confirmed`, `Completed`), patient search, and quick launch into clinical encounter.
    - Clinical Encounter & Rx Builder (`EncounterBuilderComponent`): Patient banner with allergy alerts, vitals tracker with automated BMI category calculator, ICD-10 diagnosis picker & custom diagnosis documentation, digital prescription builder (Rx pad simulation) with attending doctor digital signature stamp, and follow-up consultation scheduler.
  - Receptionist Desk (`ReceptionistDeskComponent`):
    - Walk-in patient search across Unified ID (`SH-YYYY-NNNNNN`), National ID, Phone, and Full Name.
    - Quick Patient Registration Modal generating thread-safe Unified Health ID, medical record, and emergency card.
    - Queue Check-in & Token Assigner: Allocates next sequential queue number and assigns patient to attending doctor.
  - Clinic Admin Portal (`ClinicAdminComponent`):
    - Clinic profile overview (address, phone, license number, status).
    - Medical staff roster: Affiliated doctors list with specialty, license number, and consultation fee; affiliation modal.
    - Reception staff roster with shift assignments.
    - Operational hours and slot duration configurations.
  - System Admin Audit Trail (`AuditLogsComponent`):
    - Immutable security audit trail with multi-criteria filtering by actor email, entity name, action type, and client IP.
    - Forensic Event Inspector modal displaying formatted raw JSON audit payload and context.
    - One-click CSV audit log report export.
  - Frontend-Backend Integration:
    - Typed TypeScript DTO models: `patient.models.ts`, `appointment.models.ts`, `clinical.models.ts`, `clinic.models.ts`, `auth.models.ts`.
    - Typed Angular injectable HTTP services: `PatientService`, `AppointmentService`, `ClinicalService`, `ClinicService`.
  - Landing Page & Authentication Redesign:
    - Dedicated National Landing Page (`LandingComponent` at `/`): Glassmorphism sticky navbar, hero section with 3D MedicPro ID passport card simulation, live ECG/vitals readout, 6 core capability pillars, interactive 5-role persona tabbed showcases, impact metrics, and responsive mobile drawer.
    - Split-Screen Auth Layout (`AuthLayoutComponent`): Branded left hero showcase panel featuring the official Sehati logo, mission slogan, floating verified card simulation, trust badges, and quick "Back to Home" navigation pill.
    - Revamped Login Experience (`LoginComponent`): Modern floating input fields with icons, password show/hide visibility toggle, one-click quick demo credential fill chips (`Patient`, `Doctor`, `Receptionist`, `Admin`), and fast cross-navigation links.
    - Revamped Registration Experience (`RegisterComponent`): Persona selector cards with visual icons, 14-digit national ID validation, doctor specialty and license number conditional fields, password strength validation, and bilingual error alerts.
  - Design & Localization:
    - Full Arabic and English bilingual dictionary (`LanguageService`) with dynamic RTL layout mirroring and Cairo/Plus Jakarta Sans typography.
    - Light Mode as default theme with seamless Dark Mode toggle and localStorage persistence (`ThemeService`).
    - Official Sehati brand logo integration across favicon, manifest, sidebar, and cards.
  - Quality & Verification:
    - Angular production build passes with 0 errors (`ng build`).
    - All 134 backend xUnit tests passing with 0 failures (`dotnet test Sehati.sln`).
- Phase 8: Frontend Foundation & UI Framework
  - Complete MedicPro design system implementation with CSS tokens (dark healthcare teal/cyan palette, elevated glass cards, typography, interactive badges, alert states, and buttons)
  - Modular standalone architecture with core, shared, layouts, and eatures directories
  - Reactive AuthService leveraging Angular 19 signals (signal, computed) for synchronous state (currentUser, isAuthenticated, userRole) alongside RxJS observables for asynchronous HTTP auth flows
  - Secure storage wrapper (StorageService) with safe SSR/platform-browser detection
  - Authentication flow layouts and screens: AuthLayoutComponent, LoginComponent (supporting dual email/phone authentication, validation, error alerts, and remember-me), and RegisterComponent
  - Application dashboard shell: MainLayoutComponent with responsive sidebar navigation, role-based visibility, active route highlighting, and user session profile
  - Functional router guards: uthGuard (protecting authenticated routes and redirecting with 
eturnUrl) and 
oleGuard (enforcing role-based access control)
  - Functional HTTP interceptors: jwtInterceptor (injecting Bearer tokens) and errorInterceptor (handling 401 Unauthorized token refresh and error normalization)
  - Isolated preview and architectural showcase route (/preview) preserving the full interactive demo
  - Comprehensive unit test suites covering AuthService, uthGuard, LoginComponent, AppComponent, and PreviewComponent
- Phase 7: Core Backend — Prescriptions, Consent & Audit
  - Clinical visit & encounter management (`Visits`) with chief complaints, encounter notes, and lifecycle status tracking (`CheckedIn`, `InConsultation`, `Completed`, `Cancelled`)
  - Diagnosis documentation (`Diagnoses`) and treatment planning (`Treatments`) tied to clinical visits
  - Digital prescription builder (`Prescriptions` & `PrescriptionItems`) with dosages, frequencies, durations, and instructions
  - Consent engine (`AccessPermissions`) supporting granular permissions (`ViewOnly`, `ViewAndAddRecords`), active status checking, and revocation
  - In-app notification system (`Notifications`) with user targeting, unread filtering, and read status management
  - Immutable audit trail logging (`AuditLogs`) tracking user actions, entity types, IDs, timestamps, and client IP addresses
  - Five new API Controllers: `VisitsController` (`/api/v1/visits`), `PrescriptionsController` (`/api/v1/prescriptions`), `ConsentController` (`/api/v1/consent`), `NotificationsController` (`/api/v1/notifications`), and `AuditController` (`/api/v1/audit`)
  - 134 total passing unit and integration tests (21 new tests for Phase 7) with 0 failures and 0 security alerts
- Phase 6: Core Backend — Clinic, Doctor & Scheduling
  - Clinic management with onboarding, paginated browsing, multi-field search, detail views, and doctor/receptionist counts
  - Doctor profile management with specialty filtering, clinic affiliations, and search
  - Clinic-Doctor affiliation engine (M:N via `ClinicDoctors`) with status tracking and affiliation management
  - Receptionist provisioning with secure password hashing and clinic assignment
  - Appointment scheduling engine with double-booking collision prevention for both doctors and patients
  - Appointment lifecycle status transitions (`Pending`, `Confirmed`, `Completed`, `Cancelled`, `NoShow`) and rescheduling
  - Daily clinic queue manager (`GET /api/v1/appointments/queue?clinicId=X&date=YYYY-MM-DD`) with 1-based sequential ordering
  - Clinical follow-up scheduling and status tracking (`FollowUps`) linked to patient visits
  - Three new API Controllers: `ClinicsController` (`/api/v1/clinics`), `DoctorsController` (`/api/v1/doctors`), and `AppointmentsController` (`/api/v1/appointments`)
  - 113 total passing unit and integration tests (28 new tests for Phase 6) with 0 failures and 0 security alerts
- Phase 5: Core Backend — Patient & Medical Records
  - Unified Patient ID generation (SH-YYYY-NNNNNN) with thread-safe concurrency lock and auto-increment sequence
  - Complete Patient CRUD management with automatic user account, medical record, and emergency profile provisioning
  - Sub-resource management endpoints for Allergies, Current Medications, Diagnostic Lab Tests, and Scans/Imaging
  - Emergency profile service (IEmergencyService) and controller (EmergencyController)
  - Public anonymous emergency endpoint (GET /api/v1/emergency/{unifiedId}) for ER responders and paramedics QR scanning
  - Patient search engine (GET /api/v1/patients/search?q=...) searching across Unified ID, phone number, and full name
  - Patient pagination model PaginatedList<T> with RFC JSON deserialization support
  - FluentValidation rules for patient creation, update, allergies, medications, lab tests, scans, and emergency profiles
  - 85 total passing tests (30 new unit and integration tests added for Phase 5)
- Phase 4: Authentication & User Management
  - JWT authentication engine with access and refresh tokens, supporting token rotation and invalidation on logout
  - Password hashing service using ASP.NET Core Identity PBKDF2 with cryptographic salting
  - Role-based authorization supporting all 5 system roles (`Patient`, `Doctor`, `Receptionist`, `ClinicAdmin`, `SystemAdmin`)
  - `IAuthService` and `AuthService` handling register, login, refresh-token, logout, and current user profile
  - Multi-role user registration supporting automatic Unified Patient ID creation (`SH-YYYY-NNNNNN`), initial medical record, and emergency profile provisioning for Patients
  - Dual login mechanism supporting authentication via email or phone number with international format
  - `AuthController` exposing `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/refresh-token`, `/api/v1/auth/logout`, `/api/v1/auth/me`, and role-protected test endpoints
  - FluentValidation rules for `RegisterDto`, `LoginDto`, and `RefreshTokenDto` with password complexity and E.164 phone validation
  - Global exception handling middleware updated for RFC-compliant validation errors, conflict responses (409), unauthorized (401), and not found (404)
  - EF Core migration `20261103104611_AddRefreshTokenToUser` adding `RefreshToken` and `RefreshTokenExpiryTime` to `Users`
  - Comprehensive unit and integration test suite (55 total passing tests across schema, services, validators, and controllers)
- Phase 3: Complete Database Schema & EF Core Code-First implementation
  - 23 domain entities in `Sehati.Domain/Entities/` (`User`, `Role`, `Patient`, `Clinic`, `Doctor`, `ClinicDoctor`, `Receptionist`, `MedicalRecord`, `Visit`, `Diagnosis`, `Treatment`, `Prescription`, `PrescriptionItem`, `Allergy`, `Medication`, `Test`, `Scan`, `Appointment`, `FollowUp`, `EmergencyProfile`, `AccessPermission`, `Notification`, `AuditLog`)
  - 9 domain enums in `Sehati.Domain/Enums/` (`Gender`, `ClinicStatus`, `VisitStatus`, `AppointmentStatus`, `FollowUpStatus`, `BloodType`, `AccessType`, `AccessPermissionStatus`, `NotificationType`)
  - Unified Patient ID format constants and generation service (`IUnifiedPatientIdGenerator`, `UnifiedPatientIdGenerator`)
  - `SehatiDbContext` with all 23 `DbSet<>` properties and automatic assembly configuration discovery
  - 23 Fluent API entity configurations with exact foreign keys, cascade/restrict behaviors, and indexes
  - Role seed data for 5 system tiers (`Patient`, `Doctor`, `Receptionist`, `ClinicAdmin`, `SystemAdmin`)
  - Initial EF Core Migration `20261102200538_InitialCreate`
  - Idempotent SQL script `docs/InitialCreate.sql`
  - Unit tests in `DatabaseSchemaTests` and `UnifiedPatientIdGeneratorTests` (14 passing tests)
- Phase 2: Complete .NET solution initialized (`Sehati.sln` and `Sehati.slnx`)
- `Sehati.Domain` (classlib net9.0) with zero external dependencies
- `Sehati.Application` (classlib net9.0) with FluentValidation, AutoMapper, Logging abstractions
- `Sehati.Infrastructure` (classlib net9.0) with EF Core 9.0, SQL Server, and ASP.NET Core Identity
- `Sehati.API` (webapi net9.0) with Swashbuckle OpenAPI, JWT Bearer configuration, Serilog logging, and CORS
- `Sehati.Tests` (xunit net9.0) with Moq, FluentAssertions, and WebApplicationFactory
- `HealthController` with `/api/health` endpoint returning operational status
- `ExceptionHandlingMiddleware` for global RFC-compliant error responses
- `Sehati.Web` Angular 19 SPA with SCSS, Angular Material 19, and standalone routing
- Bilingual interactive UI (English & Arabic RTL) with Medical Passport visualizer
- Integration tests in `HealthControllerTests` verifying API health check
- Initial project repository setup & documentation (Phase 0 & 1)
- Original project documentation uploaded to `docs/original/`
- Comprehensive `README.md` with project overview, tech stack, and setup instructions
- Architecture, roadmap, workflow, testing strategy, and team onboarding guides
- `.gitignore` configured for .NET, Angular, SQL Server, and IDE files

---

## Version History

*No released versions yet. Development begins at Phase 2.*

---

### Legend

- **Added** — New features or files
- **Changed** — Changes to existing functionality
- **Deprecated** — Features that will be removed in future versions
- **Removed** — Features that were removed
- **Fixed** — Bug fixes
- **Security** — Security-related changes
