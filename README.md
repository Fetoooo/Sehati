# SEHATI (صِحّتي) — Unified Healthcare Management & Medical Records Platform

<div align="center">

**ملفك الطبي في مكان واحد**

*"One Patient, One Medical History, Better Healthcare."*

[![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![Angular](https://img.shields.io/badge/Angular-19-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)](https://www.microsoft.com/en-us/sql-server)
[![EF Core](https://img.shields.io/badge/EF%20Core-9.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://learn.microsoft.com/en-us/ef/core/)
[![License](https://img.shields.io/badge/License-Private-gray?style=for-the-badge)](LICENSE)

</div>

---

## Table of Contents

- [Project Overview](#project-overview)
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Running the Project](#running-the-project)
- [Team & Contributions](#team--contributions)
- [Documentation](#documentation)

---

## Project Overview

**Sehati** is a centralized digital health record and clinic management platform designed to unify every patient's lifelong health journey under a single, lifetime identifier — the **Unified Patient ID** (`SH-YYYY-XXXXXX`).

The platform targets private outpatient clinics and specialist doctors in Egypt and the MENA region, with a secondary expansion path into hospitals and enterprise healthcare facilities.

### Target Users (Roles)

| Role | Description |
|------|-------------|
| **Patient** | Record owner with full consent sovereignty over medical data |
| **Doctor** | Clinical user who records encounters, diagnoses, and prescriptions |
| **Receptionist** | Front-desk operator managing queue, check-in, and patient lookup |
| **Clinic Admin** | Clinic owner managing staff, doctors, and clinic operations |
| **System Admin** | Platform administrator for security, audits, and system governance |

---

## The Problem

In modern healthcare across Egypt and the MENA region:

- Medical history is trapped in **disconnected paper files** or isolated local databases
- Diagnostic tests are **duplicated unnecessarily**, causing financial waste and physical strain
- Emergency physicians **lack instant access** to critical patient data (allergies, medications, blood type)
- Doctors make clinical decisions based on **incomplete, verbal patient recollections**

---

## The Solution

Sehati bridges the communication gap between independent healthcare providers by:

1. **Unifying medical records** under a single Unified Patient ID per person, for life
2. **Empowering patients** with full sovereignty and consent control over their health data
3. **Providing doctors** with instant, authorized access to complete patient histories
4. **Enabling emergency access** to critical life-saving information via QR/secure endpoints
5. **Digitalizing clinic operations** — queue management, scheduling, and digital prescriptions

---

## Key Features

### Core Platform (MVP)
- **Multi-Role Authentication** — JWT-based auth with role-based access control (RBAC)
- **Unified Patient ID Engine** — Lifetime identifier (`SH-YYYY-XXXXXX`) for every patient
- **Unified Medical Profile** — Allergies, medications, chronic conditions, lab results
- **Emergency Profile** — QR-accessible critical data (blood type, allergies, contacts)
- **Clinical Encounters** — Diagnosis, clinical notes, treatment plans per visit
- **Digital Prescription Builder** — Structured Rx with medication items, dosage, frequency
- **Lab & Imaging Archive** — PDF/image storage with metadata for tests and scans
- **Granular Consent Engine** — Patient-controlled view/add permissions with expiry
- **Appointment & Queue Management** — Clinic scheduling and real-time queue dashboard
- **Immutable Audit Logging** — Every data access event is recorded for compliance

### Future Releases (Out of MVP Scope)
- Telemedicine video streaming
- Insurance claims processing
- AI clinical decision support
- Hospital inpatient management (HIS/LIS)

---

## Technology Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **C# / .NET 9.0** | Core backend language and framework |
| **ASP.NET Core Web API** | RESTful API layer |
| **Entity Framework Core 9.0** | ORM and database access |
| **SQL Server 2022** | Primary relational database |
| **ASP.NET Core Identity** | User authentication infrastructure |
| **JWT (JSON Web Tokens)** | Stateless authentication & authorization |
| **FluentValidation** | Request validation |
| **Swagger / OpenAPI** | API documentation and testing |
| **Serilog** | Structured logging |
| **xUnit** | Backend unit and integration testing |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Angular 19** | SPA frontend framework |
| **TypeScript** | Typed JavaScript for reliability |
| **Angular Material / Custom Components** | UI component library |
| **RxJS** | Reactive state management |
| **Jasmine + Karma** | Frontend unit testing |

### Infrastructure & Tools
| Technology | Purpose |
|-----------|---------|
| **Git & GitHub** | Version control and collaboration |
| **Docker** (optional) | Containerized development and deployment |
| **Azure / Cloud Hosting** | Production deployment target |

---

## Architecture Overview

Sehati follows **Clean Architecture** to ensure separation of concerns, testability, and maintainability.

```
┌─────────────────────────────────────────────────────────┐
│                    Angular Frontend                      │
│         (Patient Portal | Doctor Workspace |             │
│          Clinic Admin | System Admin)                    │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/REST (JSON)
┌────────────────────────▼────────────────────────────────┐
│                  Sehati.API                              │
│          Controllers · Middleware · Filters              │
├─────────────────────────────────────────────────────────┤
│                Sehati.Application                        │
│       Services · DTOs · Interfaces · Validators          │
├─────────────────────────────────────────────────────────┤
│                  Sehati.Domain                           │
│          Entities · Enums · Value Objects                │
├─────────────────────────────────────────────────────────┤
│               Sehati.Infrastructure                      │
│    EF Core DbContext · Repositories · External Services  │
│                   SQL Server Database                    │
└─────────────────────────────────────────────────────────┘
```

### Solution Projects

| Project | Layer | Responsibility |
|---------|-------|---------------|
| `Sehati.API` | Presentation | Controllers, middleware, API configuration, Swagger |
| `Sehati.Application` | Business Logic | Services, DTOs, validators, interfaces, mapping |
| `Sehati.Domain` | Core Domain | Entities, enums, domain constants, value objects |
| `Sehati.Infrastructure` | Data & External | EF Core context, migrations, repositories, email/SMS |
| `Sehati.Tests` | Testing | Unit tests, integration tests, API tests |

---

## Repository Structure

```
Sehati/
├── docs/                              # Project documentation
│   ├── original/                      # Original project files
│   │   ├── SEHATI_COMPREHENSIVE_DOCUMENTATION.md
│   │   ├── Sehati_Project_Presentation.pptx
│   │   ├── Sehati_Comprehensive_Documentation.pdf
│   │   ├── Sehati_Presentation.pdf
│   │   └── Sehati_FRD.pdf
│   ├── PROJECT_ROADMAP.md             # Development roadmap
│   ├── PROJECT_ARCHITECTURE.md        # Technical architecture
│   ├── DEVELOPMENT_WORKFLOW.md        # Git & team workflow
│   ├── TESTING_STRATEGY.md            # Testing approach
│   ├── PROGRESS_TRACKER.md            # Task tracking
│   ├── CHANGELOG.md                   # Version changes
│   └── TEAM_GUIDE.md                  # Developer onboarding
├── src/                               # Source code
│   ├── Sehati.API/                    # ASP.NET Core Web API
│   ├── Sehati.Application/           # Business logic layer
│   ├── Sehati.Domain/                # Domain entities & enums
│   ├── Sehati.Infrastructure/        # EF Core persistence & migrations
│   └── Sehati.Web/                   # Angular frontend
├── tests/                             # Test projects
│   └── Sehati.Tests/                  # xUnit test project
├── .gitignore                         # Git ignore rules
├── README.md                          # This file
└── Sehati.sln                         # .NET solution file
```

---

## Getting Started

### Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| **.NET SDK** | 9.0+ | [Download](https://dotnet.microsoft.com/download/dotnet/9.0) |
| **Node.js** | 20 LTS+ | [Download](https://nodejs.org/) |
| **Angular CLI** | 19+ | `npm install -g @angular/cli` |
| **SQL Server** | 2019+ | [Download](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) |
| **SQL Server Management Studio** | Latest | [Download](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms) |
| **Git** | Latest | [Download](https://git-scm.com/) |
| **Visual Studio 2022** or **VS Code** | Latest | [VS 2022](https://visualstudio.microsoft.com/) / [VS Code](https://code.visualstudio.com/) |

### Clone & Setup

```bash
# 1. Clone the repository
git clone https://github.com/Fetoooo/Sehati.git
cd Sehati

# 2. Backend setup
cd src/Sehati.API
dotnet restore
dotnet build

# 3. Configure connection string
# Copy appsettings.json and create appsettings.Development.json
# Update the SQL Server connection string

# 4. Apply database migrations
dotnet ef database update --project ../Sehati.Infrastructure

# 5. Frontend setup
cd ../Sehati.Web
npm install
```

---

## Running the Project

```bash
# Backend API (from src/Sehati.API/)
dotnet run

# Frontend (from src/Sehati.Web/)
ng serve

# Run all tests
dotnet test                    # Backend tests
cd src/Sehati.Web && ng test   # Frontend tests
```

| Service | URL |
|---------|-----|
| Backend API | `https://localhost:7001` |
| Swagger UI | `https://localhost:7001/swagger` |
| Frontend | `http://localhost:4200` |

---

## Team & Contributions

| Member | Role |
|--------|------|
| **Shahd Bahaa** | Product Manager & Lead Systems Analyst |
| **Fathy Ayman** | Lead Software Architect & Backend Engineer |
| **Mina Ekram** | Security, DevOps & Database Engineer |
| **Ereny Atef** | Lead UI/UX Designer & Frontend Engineer |
| **Khaled Abdel Fattah** | Full-Stack Engineer & QA Integration Lead |

### Contributing

1. Read the [Team Guide](docs/TEAM_GUIDE.md) for setup instructions
2. Follow the [Development Workflow](docs/DEVELOPMENT_WORKFLOW.md)
3. Check the [Progress Tracker](docs/PROGRESS_TRACKER.md) for assigned tasks
4. Create a feature branch from `develop`
5. Submit a pull request with tests and documentation

---

## Documentation

| Document | Description |
|----------|-------------|
| [Project Roadmap](docs/PROJECT_ROADMAP.md) | Development phases and milestones |
| [Architecture](docs/PROJECT_ARCHITECTURE.md) | System and technical architecture |
| [Development Workflow](docs/DEVELOPMENT_WORKFLOW.md) | Git branching, commits, and PRs |
| [Testing Strategy](docs/TESTING_STRATEGY.md) | Testing approach and tools |
| [Progress Tracker](docs/PROGRESS_TRACKER.md) | Current status and task tracking |
| [Changelog](docs/CHANGELOG.md) | Version history |
| [Team Guide](docs/TEAM_GUIDE.md) | Developer onboarding guide |

---

<div align="center">

**Sehati** — *One Patient, One Medical History, Better Healthcare.*

</div>
