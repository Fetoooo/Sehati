# 🗺️ SEHATI — Project Development Roadmap

> **Document Version:** 1.0.0  
> **Last Updated:** November 3, 2026  
> **Status:** Active  
> **Total Phases:** 12 (Phase 0–11)

---

## Roadmap Overview

| Phase | Title | Status | Dependencies |
|-------|-------|--------|-------------|
| **Phase 0** | Documentation & Repository Setup | ✅ Complete | None |
| **Phase 1** | Requirements Analysis & Architecture | ✅ Complete | Phase 0 |
| **Phase 2** | Development Environment & Project Initialization | ✅ Complete | Phase 1 |
| **Phase 3** | Database Design & Implementation | ✅ Complete | Phase 2 |
| **Phase 4** | Authentication & User Management | ✅ Complete | Phase 3 |
| **Phase 5** | Core Backend — Patient & Medical Records | ✅ Complete | Phase 4 |
| **Phase 6** | Core Backend — Clinic, Doctor & Scheduling | ✅ Complete | Phase 5 |
| **Phase 7** | Core Backend — Prescriptions, Consent & Emergency | ✅ Complete | Phase 6 |
| **Phase 8** | Frontend Foundation & UI Framework | ⬜ Pending | Phase 4 |
| **Phase 9** | Frontend–Backend Integration & Feature Screens | ⬜ Pending | Phases 7, 8 |
| **Phase 10** | Testing, Security Hardening & Performance | ⬜ Pending | Phase 9 |
| **Phase 11** | Deployment, Final Documentation & Handover | ⬜ Pending | Phase 10 |

---

## Phase 0: Documentation & Repository Setup

**Objective:** Establish the project repository, upload original materials, and create all management documentation.

### Deliverables
- [x] GitHub repository initialized
- [x] Original project files uploaded to `docs/original/`
- [x] `.gitignore` configured for .NET + Angular + SQL Server
- [x] `README.md` created
- [x] `docs/PROJECT_ARCHITECTURE.md` created
- [x] `docs/PROJECT_ROADMAP.md` created (this file)
- [x] `docs/DEVELOPMENT_WORKFLOW.md` created
- [x] `docs/TESTING_STRATEGY.md` created
- [x] `docs/PROGRESS_TRACKER.md` created
- [x] `docs/CHANGELOG.md` created
- [x] `docs/TEAM_GUIDE.md` created

### Acceptance Criteria
- All documentation files are present in the repository
- Original project files are preserved in `docs/original/`
- Repository is pushed to GitHub and accessible by all team members
- No secrets or credentials committed

### Definition of Done
- [x] All files created and committed
- [x] Pushed to `main` branch on GitHub
- [x] Team members can clone and read all documentation

---

## Phase 1: Requirements Analysis & Architecture

**Objective:** Analyze all project requirements, finalize the technology stack, and document the complete system architecture.

### Deliverables
- [x] Complete analysis of project documentation
- [x] Technology stack selection and justification
- [x] Clean Architecture structure defined
- [x] Database entity catalog (23 entities)
- [x] API endpoint catalog
- [x] Security architecture documented
- [x] Architecture document finalized

### Tasks
- [x] Read and analyze `SEHATI_COMPREHENSIVE_DOCUMENTATION.md`
- [x] Read and analyze project presentation
- [x] Identify all 5 user roles and their permissions
- [x] Map all 23 database entities and relationships
- [x] Define API modules and endpoint structure
- [x] Document authentication/authorization flow
- [x] Document Clean Architecture layer structure
- [x] Create architecture diagrams

### Acceptance Criteria
- Architecture document covers all system aspects
- Technology choices are justified against project requirements
- Database schema matches the 23-entity ERD from documentation
- No ambiguities or missing requirements left undocumented

### Definition of Done
- [x] `docs/PROJECT_ARCHITECTURE.md` finalized
- [x] Committed and pushed to GitHub

---

## Phase 2: Development Environment & Project Initialization

**Objective:** Create the .NET solution structure, Angular project, and configure the development environment so all team members can run the project locally.

### Deliverables
- [x] .NET solution file (`Sehati.sln`)
- [x] `Sehati.Domain` class library project
- [x] `Sehati.Application` class library project
- [x] `Sehati.Infrastructure` class library project
- [x] `Sehati.API` web API project
- [x] `Sehati.Tests` xUnit test project
- [x] Angular 19 project (`Sehati.Web`)
- [x] Project references configured (Clean Architecture dependency flow)
- [x] NuGet packages installed (EF Core, Identity, JWT, FluentValidation, Serilog, Swagger)
- [x] Angular dependencies installed
- [x] `appsettings.json` template with placeholder connection string
- [x] `.env.example` file for environment configuration
- [x] Swagger endpoint accessible
- [x] Basic health-check endpoint (`GET /api/health`)

### Tasks
1. [x] Create .NET solution with `dotnet new sln`
2. [x] Create `Sehati.Domain` project (`dotnet new classlib`)
3. [x] Create `Sehati.Application` project (`dotnet new classlib`)
4. [x] Create `Sehati.Infrastructure` project (`dotnet new classlib`)
5. [x] Create `Sehati.API` project (`dotnet new webapi`)
6. [x] Create `Sehati.Tests` project (`dotnet new xunit`)
7. [x] Add project references following Clean Architecture
8. [x] Install NuGet packages:
   - `Microsoft.EntityFrameworkCore.SqlServer`
   - `Microsoft.EntityFrameworkCore.Design`
   - `Microsoft.EntityFrameworkCore.Tools`
   - `Microsoft.AspNetCore.Identity.EntityFrameworkCore`
   - `Microsoft.AspNetCore.Authentication.JwtBearer`
   - `FluentValidation.AspNetCore`
   - `Swashbuckle.AspNetCore`
   - `Serilog.AspNetCore`
   - `AutoMapper.Extensions.Microsoft.DependencyInjection` (or Mapster)
   - `xunit`, `Moq`, `FluentAssertions`
9. [x] Create Angular 19 project with `ng new`
10. [x] Install Angular Material
11. [x] Configure `Program.cs` with DI, Swagger, CORS, exception handling
12. [x] Create health-check controller
13. [x] Configure `appsettings.json` template
14. [x] Verify `dotnet build` succeeds
15. [x] Verify `dotnet test` runs (empty test suite passes)
16. [x] Verify `ng build` succeeds
17. [x] Verify `ng serve` runs the development server
18. [x] Verify Swagger UI is accessible

### Dependencies
- Phase 1 must be complete (architecture finalized)

### Technologies & Tools Required
- .NET 9.0 SDK
- Node.js 20 LTS
- Angular CLI 19
- SQL Server (LocalDB or Developer Edition)
- Visual Studio 2022 or VS Code

### Testing Requirements
- `dotnet build` — zero errors
- `dotnet test` — passes (empty suite)
- `ng build` — zero errors
- `ng serve` — dev server starts successfully
- `GET /api/health` — returns `200 OK`
- Swagger UI loads at `/swagger`

### Acceptance Criteria
- All 5 .NET projects compile successfully
- Angular project builds and serves
- Clean Architecture dependencies are correct
- No circular references
- Team members can clone and run with documented steps

### Definition of Done
- [x] Solution structure committed
- [x] Build verification passed
- [x] TEAM_GUIDE.md updated with actual setup steps
- [x] Committed and pushed to GitHub

### GitHub Commit
```
feat(init): initialize .NET solution and Angular project with Clean Architecture
```

---

## Phase 3: Database Design & Implementation

**Objective:** Implement the complete database schema using EF Core Code-First with all 23 entities, relationships, configurations, and initial migration.

### Deliverables
- [x] All 23 domain entity classes in `Sehati.Domain/Entities/`
- [x] All domain enums in `Sehati.Domain/Enums/`
- [x] `SehatiDbContext` in `Sehati.Infrastructure`
- [x] Fluent API configurations for all entities (23 files)
- [x] Initial EF Core migration (`InitialCreate`)
- [x] Seed data (roles: Patient, Doctor, Receptionist, ClinicAdmin, SystemAdmin)
- [x] Unified Patient ID generator logic (`IUnifiedPatientIdGenerator`)

### Tasks
1. [x] Create all domain entity classes:
   - `User`, `Role`, `Patient`, `Doctor`, `Clinic`, `ClinicDoctor`, `Receptionist`
   - `MedicalRecord`, `Visit`, `Diagnosis`, `Treatment`
   - `Prescription`, `PrescriptionItem`
   - `Allergy`, `Medication`, `Test`, `Scan`
   - `Appointment`, `FollowUp`
   - `EmergencyProfile`, `AccessPermission`
   - `Notification`, `AuditLog`
2. [x] Create all domain enums:
   - `Gender`, `ClinicStatus`, `VisitStatus`, `AppointmentStatus`
   - `FollowUpStatus`, `BloodType`, `AccessType`, `AccessPermissionStatus`
   - `NotificationType`
3. [x] Implement `SehatiDbContext` with all `DbSet<>` properties
4. [x] Create Fluent API configurations for each entity (one file per entity)
5. [x] Configure relationships, constraints, indexes
6. [x] Implement Unified Patient ID format constants
7. [x] Create seed data (5 roles: Patient, Doctor, Receptionist, ClinicAdmin, SystemAdmin)
8. [x] Create initial migration: `dotnet ef migrations add InitialCreate`
9. [x] Review generated migration SQL (`docs/InitialCreate.sql`)
10. [x] Generate idempotent migration SQL script
11. [x] Verify schema against ERD documentation and index strategy
12. [x] Create automated model tests and Unified Patient ID generator tests (14 passed)

### Dependencies
- Phase 2 must be complete (project structure exists)
- SQL Server must be installed and accessible

### Database Changes
- Initial creation of all 23 tables
- All indexes defined in architecture document
- Seed data for `Roles` table

### Testing Requirements
- `dotnet ef migrations add` succeeds
- `dotnet ef database update` / SQL script generation succeeds
- Schema matches the ERD from documentation
- All foreign key relationships are correct
- Unique constraints verified
- Seed data present after migration

### Acceptance Criteria
- All 23 entities created with correct properties and types
- All relationships match the ERD
- Migration applies cleanly to a fresh database
- Seed data is inserted
- `dotnet build` passes
- `dotnet test` passes (entity tests)

### Definition of Done
- [x] All entities implemented
- [x] All configurations implemented
- [x] Migration created and verified
- [x] Schema verified against ERD
- [x] Committed and pushed to GitHub

### GitHub Commit
```
feat(db): implement complete database schema with 23 entities and initial migration
```

---

## Phase 4: Authentication & User Management

**Objective:** Implement JWT-based authentication, user registration, login, and role-based authorization.

### Deliverables
- [x] User registration endpoint (per role)
- [x] Login endpoint with JWT token generation
- [x] Refresh token mechanism
- [x] Role-based authorization middleware
- [x] Password hashing (ASP.NET Core Identity)
- [x] Auth DTOs and validators
- [x] Auth service with interface
- [x] Protected endpoints respond correctly to unauthorized requests

### Tasks
1. [x] Configure ASP.NET Core Identity in `Sehati.Infrastructure`
2. [x] Implement JWT token generation service
3. [x] Create `IAuthService` interface in `Sehati.Application`
4. [x] Implement `AuthService` with login, register, refresh token logic
5. [x] Create auth DTOs: `LoginDto`, `RegisterDto`, `TokenResponseDto`, `RefreshTokenDto`
6. [x] Create FluentValidation validators for auth DTOs
7. [x] Implement `AuthController` with endpoints:
   - `POST /api/v1/auth/register`
   - `POST /api/v1/auth/login`
   - `POST /api/v1/auth/refresh-token`
   - `POST /api/v1/auth/logout`
8. [x] Configure JWT middleware in `Program.cs`
9. [x] Add `[Authorize]` and `[Authorize(Roles = "...")]` to test endpoints
10. [x] Configure CORS for Angular dev server
11. [x] Store JWT settings in `appsettings.json` (secret via User Secrets)
12. [x] Write unit tests for auth service
13. [x] Write integration tests for auth endpoints

### Dependencies
- Phase 3 (database with Users and Roles tables)

### API Endpoints
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/v1/auth/register` | Register new user | Public |
| POST | `/api/v1/auth/login` | Login and receive tokens | Public |
| POST | `/api/v1/auth/refresh-token` | Refresh expired access token | Public |
| POST | `/api/v1/auth/logout` | Invalidate refresh token | Authenticated |

### Testing Requirements
- Unit tests for token generation
- Unit tests for password validation
- Integration tests for register → login flow
- Verify unauthorized access returns `401`
- Verify wrong role access returns `403`
- `dotnet build` passes
- `dotnet test` passes

### Acceptance Criteria
- Users can register with valid credentials
- Users can login and receive JWT tokens
- Protected endpoints reject unauthenticated requests
- Role-based access works correctly
- Passwords are properly hashed
- No secrets committed to source control

### Definition of Done
- [x] Auth system functional
- [x] Unit and integration tests pass (55 passed)
- [x] Committed and pushed to GitHub

### GitHub Commit
```
feat(auth): implement JWT authentication with role-based authorization
```

---

## Phase 5: Core Backend — Patient & Medical Records

**Objective:** Implement patient management, unified patient ID generation, medical records, allergies, medications, tests, scans, and emergency profiles.

### Deliverables
- [x] Patient CRUD operations with Unified Patient ID
- [x] Medical record management
- [x] Allergy management
- [x] Medication tracking
- [x] Lab test records
- [x] Scan/imaging records
- [x] Emergency profile management
- [x] Patient search (by phone, name, Unified ID)

### Tasks
1. [x] Create patient-related DTOs
2. [x] Create FluentValidation validators
3. [x] Implement `IPatientService` and `PatientService`
4. [x] Implement Unified Patient ID generator (`SH-YYYY-XXXXXX`)
5. [x] Implement `PatientsController`
6. [x] Implement `IEmergencyService` and `EmergencyService`
7. [x] Implement `EmergencyController`
8. [x] Implement allergy, medication, test, and scan CRUD
9. [x] Implement patient search functionality
10. [x] Write unit tests
11. [x] Write integration tests

### API Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/v1/patients` | List patients (paginated) |
| GET | `/api/v1/patients/{id}` | Get patient by ID |
| GET | `/api/v1/patients/search?q=` | Search patients |
| POST | `/api/v1/patients` | Register new patient |
| PUT | `/api/v1/patients/{id}` | Update patient info |
| GET | `/api/v1/patients/{id}/allergies` | Get patient allergies |
| POST | `/api/v1/patients/{id}/allergies` | Add allergy |
| GET | `/api/v1/patients/{id}/medications` | Get patient medications |
| POST | `/api/v1/patients/{id}/medications` | Add medication |
| GET | `/api/v1/patients/{id}/tests` | Get patient tests |
| POST | `/api/v1/patients/{id}/tests` | Add test result |
| GET | `/api/v1/patients/{id}/scans` | Get patient scans |
| POST | `/api/v1/patients/{id}/scans` | Add scan result |
| GET | `/api/v1/emergency/{unifiedId}` | Get emergency profile |
| PUT | `/api/v1/patients/{id}/emergency-profile` | Update emergency profile |

### Dependencies
- Phase 4 (authentication working)

### Testing Requirements
- Unified Patient ID uniqueness verified
- CRUD operations for all patient sub-entities
- Search by phone, name, Unified ID
- Emergency profile retrieval
- Authorization checks (patients see own data, doctors with consent)
- `dotnet build` + `dotnet test` pass

### Definition of Done
- [x] All patient endpoints functional
- [x] Tests pass (85 tests passing: unit & integration)
- [x] Security refactoring completed (zero hardcoded test secrets)
- [x] Committed and pushed to GitHub

### GitHub Commit
```
feat(patients): implement patient management, medical records, and emergency profiles
```

---

## Phase 6: Core Backend — Clinic, Doctor & Scheduling

**Objective:** Implement clinic management, doctor profiles, clinic-doctor affiliations, appointment scheduling, queue management, and follow-ups.

### Deliverables
- [x] Clinic CRUD and onboarding
- [x] Doctor profile management
- [x] Clinic-Doctor affiliation (M:N)
- [x] Receptionist management
- [x] Appointment scheduling
- [x] Queue management
- [x] Follow-up scheduling

### Tasks
1. [x] Create clinic, doctor, appointment DTOs and validators
2. [x] Implement clinic services and controller
3. [x] Implement doctor services and controller
4. [x] Implement clinic-doctor affiliation logic
5. [x] Implement receptionist management
6. [x] Implement appointment services and controller
7. [x] Implement follow-up management
8. [x] Write unit and integration tests (113 total passing tests)

### Dependencies
- Phase 5 (patient management working)

### Definition of Done
- [x] All clinic/doctor/scheduling endpoints functional
- [x] Tests pass (113 passing)
- [x] Committed and pushed

### GitHub Commit
```
feat(clinics): implement clinic management, doctor profiles, and appointment scheduling
```

---

## Phase 7: Core Backend — Prescriptions, Consent & Audit

**Objective:** Implement visit/encounter management, prescription builder, consent engine, notification system, and audit logging.

### Deliverables
- [x] Visit/encounter CRUD with diagnoses and treatments
- [x] Digital prescription builder (header + items)
- [x] Consent/access permission engine
- [x] Notification system
- [x] Immutable audit logging

### Tasks
1. [x] Implement visit services and controller
2. [x] Implement diagnosis and treatment management
3. [x] Implement prescription services (header + items)
4. [x] Implement consent service (grant/revoke access)
5. [x] Implement notification service
6. [x] Implement audit logging middleware
7. [x] Write unit and integration tests (134 total passing tests)

### Dependencies
- Phase 6 (clinics and doctors working)

### Definition of Done
- [x] All visit/prescription/consent/audit endpoints functional
- [x] Tests pass (134 passing)
- [x] Committed and pushed

### GitHub Commit
```
feat(clinical): implement visits, prescriptions, consent engine, and audit logging
```

---

## Phase 8: Frontend Foundation & UI Framework

**Objective:** Build the Angular application foundation with routing, authentication UI, layouts, and the MedicPro design system.

### Deliverables
- [ ] Angular project structured with core/shared/features
- [ ] MedicPro design system implemented (CSS tokens, typography, components)
- [ ] Authentication screens (login, register)
- [ ] Role-based routing and guards
- [ ] Sidebar and header layout components
- [ ] HTTP interceptor for JWT
- [ ] API service layer
- [ ] Error handling interceptor

### Tasks
1. [ ] Implement CSS design tokens (MedicPro palette)
2. [ ] Create layout components (sidebar, header, footer)
3. [ ] Implement Angular routing with lazy-loaded feature modules
4. [ ] Create `AuthService` with JWT token management
5. [ ] Create `AuthGuard` and `RoleGuard`
6. [ ] Create JWT HTTP interceptor
7. [ ] Build login page
8. [ ] Build registration page
9. [ ] Create shared components (buttons, cards, modals, tables, badges)
10. [ ] Implement responsive design
11. [ ] Write component tests

### Dependencies
- Phase 4 (backend auth endpoints exist)

### Definition of Done
- [ ] Angular app builds and serves
- [ ] Authentication flow works end-to-end
- [ ] Design system matches MedicPro aesthetic
- [ ] Tests pass
- [ ] Committed and pushed

### GitHub Commit
```
feat(frontend): implement Angular foundation with MedicPro design system and auth UI
```

---

## Phase 9: Frontend–Backend Integration & Feature Screens

**Objective:** Build all feature screens and connect them to the backend API.

### Deliverables
- [ ] Patient Portal screens (records, consent, emergency card, appointments)
- [ ] Doctor Workspace screens (queue, encounters, prescriptions, history)
- [ ] Clinic Admin screens (staff management, analytics, settings)
- [ ] System Admin screens (audit logs, clinic approvals, system settings)
- [ ] Receptionist screens (patient search, check-in, queue)
- [ ] Full API integration

### Tasks
1. [ ] Implement Patient Portal feature module
2. [ ] Implement Doctor Workspace feature module
3. [ ] Implement Clinic Admin feature module
4. [ ] Implement System Admin feature module
5. [ ] Implement Receptionist feature module
6. [ ] Connect all screens to backend APIs
7. [ ] Implement form validation
8. [ ] Implement loading and empty states
9. [ ] Implement error handling and user feedback
10. [ ] Write component and integration tests

### Dependencies
- Phase 7 (all backend endpoints exist)
- Phase 8 (frontend foundation exists)

### Parallel Development Opportunity
- Frontend team can start Phase 8 while backend team works on Phases 5–7
- API contracts (DTOs) defined in Phase 2 enable independent work

### Definition of Done
- [ ] All feature screens implemented
- [ ] Full API integration working
- [ ] Tests pass
- [ ] Committed and pushed

### GitHub Commit
```
feat(integration): complete frontend-backend integration for all feature modules
```

---

## Phase 10: Testing, Security Hardening & Performance

**Objective:** Comprehensive testing, security audit, performance optimization, and bug fixing.

### Deliverables
- [ ] Complete unit test suite (≥80% coverage)
- [ ] Integration test suite
- [ ] API endpoint tests
- [ ] Frontend component tests
- [ ] Security review and hardening
- [ ] Performance optimization
- [ ] Bug fixes from testing

### Tasks
1. [ ] Achieve backend test coverage target
2. [ ] Run security audit (OWASP checklist)
3. [ ] Implement rate limiting
4. [ ] Review CORS configuration
5. [ ] Verify consent enforcement on all medical endpoints
6. [ ] Performance test critical queries
7. [ ] Optimize database queries with profiling
8. [ ] Fix all identified bugs
9. [ ] Update documentation with test results

### Dependencies
- Phase 9 (full application functional)

### Definition of Done
- [ ] All tests pass
- [ ] Security checklist complete
- [ ] No critical bugs remaining
- [ ] Performance targets met
- [ ] Committed and pushed

### GitHub Commit
```
test(qa): complete testing suite, security hardening, and performance optimization
```

---

## Phase 11: Deployment, Final Documentation & Handover

**Objective:** Prepare for production deployment, finalize all documentation, and hand over the project.

### Deliverables
- [ ] Deployment configuration (Docker or Azure)
- [ ] Production database migration plan
- [ ] Final README with complete setup instructions
- [ ] All documentation updated to reflect final implementation
- [ ] Code cleanup and refactoring
- [ ] Final changelog entry
- [ ] Project presentation materials

### Tasks
1. [ ] Create Dockerfile / docker-compose (if applicable)
2. [ ] Configure production environment settings
3. [ ] Create deployment documentation
4. [ ] Review and update all docs files
5. [ ] Code cleanup (remove TODOs, dead code)
6. [ ] Final comprehensive test run
7. [ ] Tag release version
8. [ ] Update CHANGELOG.md
9. [ ] Final push to GitHub

### Dependencies
- Phase 10 (testing complete)

### Definition of Done
- [ ] Application deployable
- [ ] All documentation final
- [ ] All tests pass
- [ ] GitHub repository clean and organized
- [ ] Team can independently maintain the project

### GitHub Commit
```
docs: finalize documentation and prepare for production deployment
```

---

*This roadmap will be updated as development progresses. Each phase requires explicit approval before the next phase begins.*
