# 🏗️ SEHATI — Project Architecture

> **Document Version:** 1.0.0  
> **Last Updated:** November 2, 2026  
> **Status:** Approved — Phase 0 (Initial Setup)

---

## Table of Contents

- [1. Architecture Overview](#1-architecture-overview)
- [2. Technology Stack](#2-technology-stack)
- [3. Solution Structure (Clean Architecture)](#3-solution-structure-clean-architecture)
- [4. Backend Architecture](#4-backend-architecture)
- [5. Frontend Architecture](#5-frontend-architecture)
- [6. Database Architecture](#6-database-architecture)
- [7. API Architecture](#7-api-architecture)
- [8. Authentication & Authorization](#8-authentication--authorization)
- [9. Security Architecture](#9-security-architecture)
- [10. Integration Strategy](#10-integration-strategy)
- [11. Deployment Architecture](#11-deployment-architecture)
- [12. Scalability & Performance](#12-scalability--performance)

---

## 1. Architecture Overview

Sehati follows a **Clean Architecture** (also known as Onion Architecture) pattern with clearly separated layers. This architecture ensures:

- **Testability** — Business logic is isolated and independently testable
- **Maintainability** — Changes in one layer don't ripple across the entire system
- **Flexibility** — Infrastructure decisions (database, external services) can be swapped without touching core logic
- **Team Parallelism** — Frontend and backend teams can work independently using API contracts

### High-Level System Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                  │
│                                                                       │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│   │ Patient      │  │ Doctor       │  │ Clinic Admin │               │
│   │ Portal       │  │ Workspace    │  │ Dashboard    │               │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │
│          │                 │                  │                        │
│          └─────────────────┼──────────────────┘                       │
│                            │ Angular 19 SPA                           │
└────────────────────────────┼──────────────────────────────────────────┘
                             │ HTTPS / REST (JSON)
┌────────────────────────────┼──────────────────────────────────────────┐
│                     API GATEWAY LAYER                                 │
│                            │                                          │
│   ┌────────────────────────▼─────────────────────────────────┐       │
│   │                    Sehati.API                             │       │
│   │  Controllers · Middleware · Filters · Swagger             │       │
│   │  JWT Auth · CORS · Rate Limiting · Exception Handling     │       │
│   └────────────────────────┬─────────────────────────────────┘       │
└────────────────────────────┼──────────────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────────────┐
│                   APPLICATION LAYER                                   │
│                            │                                          │
│   ┌────────────────────────▼─────────────────────────────────┐       │
│   │               Sehati.Application                          │       │
│   │  Services · DTOs · Validators · Interfaces · Mappings     │       │
│   └────────────────────────┬─────────────────────────────────┘       │
└────────────────────────────┼──────────────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────────────┐
│                     DOMAIN LAYER (Core)                                │
│                            │                                          │
│   ┌────────────────────────▼─────────────────────────────────┐       │
│   │                  Sehati.Domain                            │       │
│   │  Entities · Enums · Value Objects · Constants             │       │
│   │  (No external dependencies — pure C# classes)             │       │
│   └────────────────────────┬─────────────────────────────────┘       │
└────────────────────────────┼──────────────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                                   │
│                            │                                          │
│   ┌────────────────────────▼─────────────────────────────────┐       │
│   │              Sehati.Infrastructure                        │       │
│   │  EF Core DbContext · Repositories · Configurations        │       │
│   │  Email/SMS Services · File Storage · External APIs        │       │
│   └────────────────────────┬─────────────────────────────────┘       │
│                            │                                          │
│              ┌─────────────▼──────────────┐                          │
│              │    Microsoft SQL Server     │                          │
│              │    (EF Core Code-First)     │                          │
│              └────────────────────────────┘                          │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Backend Stack

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| **Runtime** | .NET | 9.0 LTS | Current LTS release; long-term support, performance, and modern C# features |
| **Web Framework** | ASP.NET Core Web API | 9.0 | Industry standard for building RESTful APIs in .NET |
| **ORM** | Entity Framework Core | 9.0 | Code-first approach with migrations; strong SQL Server support |
| **Database** | Microsoft SQL Server | 2022 | Mandatory requirement; enterprise-grade RDBMS with excellent .NET integration |
| **Authentication** | ASP.NET Core Identity + JWT | — | Robust user management with stateless token-based authentication |
| **Validation** | FluentValidation | Latest | Fluent, testable validation rules separated from models |
| **API Documentation** | Swagger / OpenAPI (Swashbuckle) | Latest | Auto-generated interactive API documentation |
| **Logging** | Serilog | Latest | Structured logging with multiple sinks (console, file, database) |
| **Testing** | xUnit + Moq + FluentAssertions | Latest | Standard .NET testing ecosystem |

### Frontend Stack

| Technology | Version | Justification |
|-----------|---------|---------------|
| **Angular** | 19 | Comprehensive SPA framework; strong TypeScript support; matches team expertise per project documentation |
| **TypeScript** | 5.x | Type safety, improved developer experience, and tooling |
| **Angular Material** | 19 | Consistent, accessible UI components aligned with Material Design |
| **RxJS** | 7.x | Reactive programming for HTTP calls, real-time updates, and state management |
| **Jasmine + Karma** | Latest | Angular's default testing framework |

### Infrastructure & DevOps

| Technology | Purpose |
|-----------|---------|
| **Git & GitHub** | Version control, pull requests, and code review |
| **Docker** | Containerized development and deployment (optional) |
| **Azure App Service / VM** | Cloud hosting target |
| **Azure SQL Database** | Managed SQL Server in production |
| **GitHub Actions** | CI/CD pipeline automation |

---

## 3. Solution Structure (Clean Architecture)

```
Sehati.sln
│
├── src/
│   ├── Sehati.Domain/                          # Core domain layer
│   │   ├── Entities/                           # Domain entities (POCOs)
│   │   │   ├── User.cs
│   │   │   ├── Role.cs
│   │   │   ├── Patient.cs
│   │   │   ├── Doctor.cs
│   │   │   ├── Clinic.cs
│   │   │   ├── ClinicDoctor.cs
│   │   │   ├── Receptionist.cs
│   │   │   ├── MedicalRecord.cs
│   │   │   ├── Visit.cs
│   │   │   ├── Diagnosis.cs
│   │   │   ├── Treatment.cs
│   │   │   ├── Prescription.cs
│   │   │   ├── PrescriptionItem.cs
│   │   │   ├── Allergy.cs
│   │   │   ├── Medication.cs
│   │   │   ├── Test.cs
│   │   │   ├── Scan.cs
│   │   │   ├── Appointment.cs
│   │   │   ├── FollowUp.cs
│   │   │   ├── EmergencyProfile.cs
│   │   │   ├── AccessPermission.cs
│   │   │   ├── Notification.cs
│   │   │   └── AuditLog.cs
│   │   ├── Enums/                              # Domain enumerations
│   │   │   ├── Gender.cs
│   │   │   ├── ClinicStatus.cs
│   │   │   ├── VisitStatus.cs
│   │   │   ├── AppointmentStatus.cs
│   │   │   ├── FollowUpStatus.cs
│   │   │   ├── BloodType.cs
│   │   │   ├── AccessType.cs
│   │   │   ├── AccessPermissionStatus.cs
│   │   │   └── NotificationType.cs
│   │   ├── Constants/                          # Domain constants
│   │   │   └── UnifiedPatientIdFormat.cs
│   │   └── Sehati.Domain.csproj
│   │
│   ├── Sehati.Application/                     # Application / business logic layer
│   │   ├── Interfaces/                         # Service interfaces (contracts)
│   │   │   ├── IAuthService.cs
│   │   │   ├── IPatientService.cs
│   │   │   ├── IDoctorService.cs
│   │   │   ├── IClinicService.cs
│   │   │   ├── IVisitService.cs
│   │   │   ├── IPrescriptionService.cs
│   │   │   ├── IAppointmentService.cs
│   │   │   ├── IEmergencyService.cs
│   │   │   ├── IConsentService.cs
│   │   │   ├── IAuditService.cs
│   │   │   └── INotificationService.cs
│   │   ├── DTOs/                               # Data transfer objects
│   │   │   ├── Auth/
│   │   │   ├── Patients/
│   │   │   ├── Doctors/
│   │   │   ├── Clinics/
│   │   │   ├── Visits/
│   │   │   ├── Prescriptions/
│   │   │   ├── Appointments/
│   │   │   └── Common/
│   │   ├── Services/                           # Service implementations
│   │   ├── Validators/                         # FluentValidation validators
│   │   ├── Mappings/                           # DTO ↔ Entity mapping profiles
│   │   └── Sehati.Application.csproj
│   │
│   ├── Sehati.Infrastructure/                  # Infrastructure / data access layer
│   │   ├── Data/
│   │   │   ├── SehatiDbContext.cs              # EF Core DbContext
│   │   │   ├── Configurations/                 # Fluent API entity configurations
│   │   │   │   ├── UserConfiguration.cs
│   │   │   │   ├── PatientConfiguration.cs
│   │   │   │   ├── DoctorConfiguration.cs
│   │   │   │   ├── ClinicConfiguration.cs
│   │   │   │   └── ... (one per entity)
│   │   │   ├── Migrations/                     # EF Core migrations
│   │   │   └── Seed/                           # Seed data
│   │   │       └── SeedData.cs
│   │   ├── Repositories/                       # Repository implementations
│   │   ├── Services/                           # External service implementations
│   │   │   ├── EmailService.cs
│   │   │   ├── SmsService.cs
│   │   │   └── FileStorageService.cs
│   │   └── Sehati.Infrastructure.csproj
│   │
│   ├── Sehati.API/                             # Presentation / API layer
│   │   ├── Controllers/
│   │   │   ├── AuthController.cs
│   │   │   ├── PatientsController.cs
│   │   │   ├── DoctorsController.cs
│   │   │   ├── ClinicsController.cs
│   │   │   ├── VisitsController.cs
│   │   │   ├── PrescriptionsController.cs
│   │   │   ├── AppointmentsController.cs
│   │   │   ├── EmergencyController.cs
│   │   │   ├── ConsentController.cs
│   │   │   └── AuditController.cs
│   │   ├── Middleware/
│   │   │   ├── ExceptionHandlingMiddleware.cs
│   │   │   └── AuditLoggingMiddleware.cs
│   │   ├── Filters/
│   │   │   └── ValidationFilter.cs
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   └── Sehati.API.csproj
│   │
│   └── Sehati.Web/                             # Angular frontend application
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/                       # Singleton services, guards, interceptors
│       │   │   ├── shared/                     # Shared components, pipes, directives
│       │   │   ├── features/                   # Feature modules
│       │   │   │   ├── auth/
│       │   │   │   ├── patient-portal/
│       │   │   │   ├── doctor-workspace/
│       │   │   │   ├── clinic-admin/
│       │   │   │   └── system-admin/
│       │   │   ├── app.component.ts
│       │   │   ├── app.config.ts
│       │   │   └── app.routes.ts
│       │   ├── assets/
│       │   ├── environments/
│       │   └── styles/
│       ├── angular.json
│       ├── package.json
│       └── tsconfig.json
│
├── tests/
│   └── Sehati.Tests/                           # xUnit test project
│       ├── Unit/
│       │   ├── Services/
│       │   └── Validators/
│       ├── Integration/
│       │   ├── Controllers/
│       │   └── Repositories/
│       └── Sehati.Tests.csproj
│
└── docs/                                        # Documentation
```

---

## 4. Backend Architecture

### 4.1 Dependency Flow

```
Sehati.API ──────► Sehati.Application ──────► Sehati.Domain
     │                     │
     └──────────► Sehati.Infrastructure ────► Sehati.Domain
```

**Rules:**
- `Sehati.Domain` has **zero** external dependencies (pure C# library)
- `Sehati.Application` depends only on `Sehati.Domain`
- `Sehati.Infrastructure` implements interfaces defined in `Sehati.Application`
- `Sehati.API` wires everything together via Dependency Injection

### 4.2 Design Patterns

| Pattern | Usage |
|---------|-------|
| **Repository Pattern** | Abstracting data access behind interfaces when multiple data sources exist or complex query logic is needed |
| **Service Layer** | Business logic encapsulated in application services |
| **DTO Pattern** | Preventing domain entities from leaking into API responses |
| **Dependency Injection** | Built-in ASP.NET Core DI container for all services |
| **Middleware Pipeline** | Cross-cutting concerns: authentication, logging, exception handling |
| **Options Pattern** | Strongly-typed configuration binding |

### 4.3 API Response Convention

All API responses follow a consistent envelope:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Patient retrieved successfully",
  "data": { ... },
  "errors": null
}
```

Error responses:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "data": null,
  "errors": [
    { "field": "Email", "message": "Email is required" }
  ]
}
```

---

## 5. Frontend Architecture

### 5.1 Module Structure

The Angular application is organized by feature modules:

```
app/
├── core/                              # Singleton services (loaded once)
│   ├── guards/                        # Route guards (AuthGuard, RoleGuard)
│   ├── interceptors/                  # HTTP interceptors (JWT, error handling)
│   ├── services/                      # Global services (AuthService, API service)
│   └── models/                        # TypeScript interfaces and types
│
├── shared/                            # Reusable components
│   ├── components/                    # Buttons, modals, cards, tables
│   ├── pipes/                         # Date formatting, Arabic text
│   └── directives/                    # Custom directives
│
├── features/                          # Feature modules (lazy-loaded)
│   ├── auth/                          # Login, register, forgot password
│   ├── patient-portal/                # Patient dashboard, records, consent
│   ├── doctor-workspace/              # Queue, encounters, prescriptions
│   ├── clinic-admin/                  # Staff management, analytics
│   └── system-admin/                  # Platform administration
│
└── layouts/                           # Page layouts (sidebar, header)
```

### 5.2 Design System: MedicPro Aesthetic

The UI follows the **MedicPro** design language defined in the project documentation:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary-dark` | `#0A4D68` | Headers, navigation, primary backgrounds |
| `--color-primary-base` | `#088395` | Buttons, active states, links |
| `--color-primary-accent` | `#05BFDB` | Badges, highlights, accents |
| `--color-primary-surface` | `#EBF4F6` | Card backgrounds, panels |
| `--color-bg-app` | `#F8FAFC` | Application canvas |
| `--color-status-success` | `#059669` | Confirmed, verified states |
| `--color-status-warning` | `#D97706` | Pending, expiring states |
| `--color-status-danger` | `#DC2626` | Alerts, allergy warnings, errors |

**Typography:** Plus Jakarta Sans (Latin) + Cairo (Arabic)

### 5.3 State Management

- **Authentication state:** Managed via `AuthService` + `BehaviorSubject`
- **API data:** RxJS observables with caching where appropriate
- **Component state:** Angular signals (Angular 19 feature) for local state

---

## 6. Database Architecture

### 6.1 Database Engine

- **Engine:** Microsoft SQL Server 2022 (mandatory requirement)
- **ORM:** Entity Framework Core 9.0 (Code-First)
- **Approach:** Code-First with Fluent API configurations
- **Migrations:** Version-controlled via EF Core Migrations

### 6.2 Entity-Relationship Overview

The database consists of **23 entities** organized across functional domains:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   IDENTITY &    │     │   CLINICAL &    │     │   OPERATIONS &  │
│   ACCESS        │     │   MEDICAL       │     │   SCHEDULING    │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ Users           │     │ Visits          │     │ Appointments    │
│ Roles           │     │ Diagnoses       │     │ FollowUps       │
│ Patients        │     │ Treatments      │     │ Notifications   │
│ Doctors         │     │ Prescriptions   │     │ AuditLogs       │
│ Receptionists   │     │ PrescriptionItems│    │                 │
│ Clinics         │     │ Allergies       │     │                 │
│ ClinicDoctors   │     │ Medications     │     │                 │
│ AccessPermissions│    │ Tests           │     │                 │
│ EmergencyProfiles│    │ Scans           │     │                 │
│ MedicalRecords  │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 6.3 Key Relationships

| Relationship | Type | Description |
|-------------|------|-------------|
| User → Patient/Doctor/Receptionist | 1:1 | Each user has one role-specific profile |
| Patient → MedicalRecord | 1:1 | One unified medical record per patient |
| Patient → EmergencyProfile | 1:1 | One emergency profile per patient |
| Doctor ↔ Clinic (via ClinicDoctors) | M:N | Doctors practice at multiple clinics |
| Visit → Diagnoses/Treatments/Prescriptions | 1:M | Each visit produces multiple clinical records |
| Prescription → PrescriptionItems | 1:M | Each prescription has multiple medication items |
| Patient → AccessPermissions | 1:M | Patient controls who can see their records |

### 6.4 Indexing Strategy

| Index | Columns | Purpose |
|-------|---------|---------|
| `IX_Patients_UnifiedId` | `UnifiedPatientId` (Unique) | Fast patient lookup by Unified ID |
| `IX_Patients_Phone_Name` | `Phone, FullName` | Reception search by phone or name |
| `IX_Visits_Patient_Date` | `PatientId, VisitDate DESC` | Chronological visit history |
| `IX_AccessPermissions_Lookup` | `PatientId, DoctorId, Status, ExpiresAt` | Consent evaluation queries |
| `IX_AuditLogs_Timestamp` | `Timestamp` | Audit log time-range queries |

### 6.5 Unified Patient ID

**Format:** `SH-YYYY-XXXXXX`

- `SH` — System prefix (Sehati)
- `YYYY` — Registration year
- `XXXXXX` — 6-digit zero-padded sequence with cryptographic entropy

**Guarantees:**
- Database-enforced `UNIQUE` constraint
- Atomic sequence generation within transactions
- National ID hash verification to prevent duplicate registrations

---

## 7. API Architecture

### 7.1 API Design Principles

- **RESTful conventions** for resource naming and HTTP verbs
- **Consistent response format** using the envelope pattern
- **Versioning** via URL prefix (`/api/v1/`)
- **Pagination** for list endpoints using `page` and `pageSize` parameters
- **Filtering & sorting** via query parameters

### 7.2 Core API Modules

| Module | Base Route | Key Endpoints |
|--------|-----------|---------------|
| **Auth** | `/api/v1/auth` | Login, Register, Refresh Token, Logout |
| **Patients** | `/api/v1/patients` | CRUD, Search by Phone/ID, Medical Timeline |
| **Doctors** | `/api/v1/doctors` | CRUD, Clinic Affiliations, Schedule |
| **Clinics** | `/api/v1/clinics` | CRUD, Staff Management, Analytics |
| **Visits** | `/api/v1/visits` | Create Encounter, Add Diagnosis/Treatment |
| **Prescriptions** | `/api/v1/prescriptions` | Create Rx, Add Items, Generate PDF |
| **Appointments** | `/api/v1/appointments` | Book, Confirm, Cancel, Queue Status |
| **Emergency** | `/api/v1/emergency` | Retrieve Emergency Profile (restricted) |
| **Consent** | `/api/v1/consent` | Grant/Revoke Access Permissions |
| **Audit** | `/api/v1/audit` | Query Audit Logs (admin only) |
| **Notifications** | `/api/v1/notifications` | List, Mark Read, Preferences |

---

## 8. Authentication & Authorization

### 8.1 Authentication Flow

```
┌──────────┐     POST /auth/login      ┌──────────────┐
│  Client   │ ──────────────────────►  │   Sehati.API  │
│ (Angular) │                          │               │
│           │ ◄────────────────────── │  Validate +    │
│           │   { accessToken,        │  Issue JWT     │
│           │     refreshToken }      │               │
└──────────┘                          └───────┬───────┘
     │                                         │
     │  Authorization: Bearer <token>          │
     │  (All subsequent requests)              │
     ▼                                         ▼
┌──────────────────────────────────────────────────────┐
│              JWT Middleware validates token           │
│              Extracts claims (UserId, Role)           │
│              [Authorize(Roles = "Doctor")] enforced   │
└──────────────────────────────────────────────────────┘
```

### 8.2 Token Structure

| Claim | Description |
|-------|-------------|
| `sub` | User ID |
| `email` | User email |
| `role` | User role (Patient, Doctor, Receptionist, ClinicAdmin, SystemAdmin) |
| `clinicId` | Clinic association (for staff roles) |
| `exp` | Token expiration timestamp |

### 8.3 Role-Based Access Control

Access is enforced at the controller level using `[Authorize]` attributes and custom policy-based authorization where granular control is needed.

---

## 9. Security Architecture

| Security Layer | Implementation |
|---------------|----------------|
| **Transport** | HTTPS (TLS 1.3) enforced in production |
| **Authentication** | JWT Bearer tokens with refresh token rotation |
| **Authorization** | Role-based + policy-based access control |
| **Password Storage** | BCrypt hashing with salt (via ASP.NET Core Identity) |
| **Input Validation** | FluentValidation on all incoming DTOs |
| **SQL Injection** | EF Core parameterized queries (no raw SQL) |
| **XSS Protection** | Angular's built-in sanitization + Content Security Policy headers |
| **CSRF** | SameSite cookies + anti-forgery tokens where needed |
| **CORS** | Explicitly configured allowed origins |
| **Rate Limiting** | ASP.NET Core rate limiting middleware on auth endpoints |
| **Audit Trail** | Immutable `AuditLogs` table for all medical data access |
| **Secrets Management** | User secrets (dev) / Azure Key Vault (prod); never committed |
| **Data Encryption** | AES-256 for sensitive clinical fields at rest |
| **Consent Enforcement** | Every medical record access checks `AccessPermissions` |

---

## 10. Integration Strategy

### 10.1 Internal Communication

- **Frontend ↔ Backend:** RESTful HTTP/JSON via Angular's `HttpClient`
- **Backend ↔ Database:** EF Core with connection pooling via SQL Server

### 10.2 External Services (Future)

| Service | Purpose | Priority |
|---------|---------|----------|
| SMS Gateway (e.g., Twilio) | Patient consent notifications, OTP | Phase 4 |
| Email Service (e.g., SendGrid) | Appointment reminders, notifications | Phase 4 |
| Cloud Storage (Azure Blob / S3) | Lab report and scan file storage | Phase 5 |
| PDF Generation | Prescription PDF rendering | Phase 5 |

---

## 11. Deployment Architecture

### Development Environment

```
Developer Machine
├── SQL Server (LocalDB or Developer Edition)
├── .NET 9.0 SDK → dotnet run (Kestrel, https://localhost:7001)
├── Node.js 20+ → ng serve (http://localhost:4200)
└── Angular proxies API calls to backend
```

### Production Architecture (Target)

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│   Azure CDN /  │     │  Azure App     │     │  Azure SQL     │
│   Static Files │────►│  Service       │────►│  Database      │
│   (Angular)    │     │  (.NET API)    │     │  (SQL Server)  │
└────────────────┘     └────────────────┘     └────────────────┘
                              │
                       ┌──────▼──────┐
                       │ Azure Blob  │
                       │ Storage     │
                       │ (Files/Scans)│
                       └─────────────┘
```

---

## 12. Scalability & Performance

### 12.1 Performance Targets

| Metric | Target |
|--------|--------|
| Patient lookup (by Unified ID) | < 1.5 seconds |
| Page load time | < 3 seconds |
| API response time (p95) | < 500ms |
| System uptime | 99.9% |

### 12.2 Scalability Strategies

- **Database indexing** on high-frequency query columns
- **EF Core query optimization** with `AsNoTracking()` for read-only queries
- **Pagination** on all list endpoints
- **Connection pooling** via EF Core + SQL Server
- **Lazy loading** of Angular feature modules
- **Caching** for frequently accessed reference data (roles, clinic info)
- **Audit log partitioning** by month for long-term performance

---

*This document will be updated as the architecture evolves through development phases.*
