# 📝 SEHATI — Changelog

All notable changes to the Sehati project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]
### Added
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
