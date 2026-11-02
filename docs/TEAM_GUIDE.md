# 👥 SEHATI — Team Guide

> **Document Version:** 1.0.0  
> **Last Updated:** November 2, 2026  
> **Purpose:** Help all team members set up their development environment and contribute effectively

---

## Table of Contents

- [1. Prerequisites](#1-prerequisites)
- [2. Clone the Repository](#2-clone-the-repository)
- [3. Backend Setup (.NET)](#3-backend-setup-net)
- [4. Frontend Setup (Angular)](#4-frontend-setup-angular)
- [5. SQL Server Setup](#5-sql-server-setup)
- [6. Environment Configuration](#6-environment-configuration)
- [7. Running the Application](#7-running-the-application)
- [8. Daily Development Workflow](#8-daily-development-workflow)
- [9. Working on a Task](#9-working-on-a-task)
- [10. Testing Your Changes](#10-testing-your-changes)
- [11. Submitting a Pull Request](#11-submitting-a-pull-request)
- [12. Troubleshooting](#12-troubleshooting)

---

## 1. Prerequisites

Install the following tools before starting:

| Tool | Version | Download Link |
|------|---------|---------------|
| **Git** | Latest | [git-scm.com](https://git-scm.com/downloads) |
| **.NET SDK** | 9.0+ | [dotnet.microsoft.com](https://dotnet.microsoft.com/download/dotnet/9.0) |
| **Node.js** | 20 LTS+ | [nodejs.org](https://nodejs.org/) |
| **Angular CLI** | 19+ | Run: `npm install -g @angular/cli` |
| **SQL Server** | 2019+ | [SQL Server Downloads](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) — use Developer or Express edition |
| **SQL Server Management Studio (SSMS)** | Latest | [SSMS Download](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms) |
| **Visual Studio 2022** | Latest | [visualstudio.microsoft.com](https://visualstudio.microsoft.com/) — Community edition is free |
| **VS Code** (alternative) | Latest | [code.visualstudio.com](https://code.visualstudio.com/) |

### Verify Installation

Open a terminal and run:

```bash
git --version          # Should print git version
dotnet --version       # Should print 9.0.x
node --version         # Should print v20.x or higher
npm --version          # Should print 10.x or higher
ng version             # Should print Angular CLI 19.x
```

---

## 2. Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/Fetoooo/Sehati.git

# Or clone via SSH (if you have SSH keys configured)
git clone git@github.com:Fetoooo/Sehati.git

# Navigate into the project
cd Sehati
```

### Repository Structure

```
Sehati/
├── docs/                    # All project documentation
│   ├── original/            # Original project files
│   ├── PROJECT_ROADMAP.md   # Development phases
│   ├── PROGRESS_TRACKER.md  # Current status
│   └── ...
├── src/                     # Source code (created in Phase 2)
│   ├── Sehati.API/          # Backend API
│   ├── Sehati.Domain/       # Domain entities
│   ├── Sehati.Application/  # Business logic
│   ├── Sehati.Infrastructure/ # Data access
│   └── Sehati.Web/          # Angular frontend
├── tests/                   # Test projects
├── .gitignore
├── README.md
└── Sehati.sln               # .NET solution file
```

---

## 3. Backend Setup (.NET)

> **Note:** These steps apply after Phase 2 when the solution structure exists.

```bash
# Navigate to the solution root
cd Sehati

# Restore NuGet packages
dotnet restore

# Build the solution
dotnet build

# Verify the build succeeds with zero errors
```

### Install EF Core CLI Tools (one-time)

```bash
dotnet tool install --global dotnet-ef
```

---

## 4. Frontend Setup (Angular)

> **Note:** These steps apply after Phase 2 when the Angular project exists.

```bash
# Navigate to the frontend project
cd src/Sehati.Web

# Install Node.js dependencies
npm install

# Verify the build succeeds
ng build

# Start the development server
ng serve
```

The frontend will be available at `http://localhost:4200`.

---

## 5. SQL Server Setup

### Option A: SQL Server Developer Edition (Recommended)

1. Download and install [SQL Server 2022 Developer Edition](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
2. During installation, choose **Default Instance** or note the instance name
3. Enable **SQL Server Authentication** (mixed mode)
4. Set a strong `sa` password (for development only)
5. Install [SSMS](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms) for database management

### Option B: SQL Server Express + LocalDB

```bash
# If using LocalDB (comes with Visual Studio)
# Connection string will use (localdb)\MSSQLLocalDB
```

### Create the Development Database

After installation, connect to SQL Server via SSMS and create the database:

```sql
CREATE DATABASE SehatiDB;
```

Or let EF Core create it automatically when you apply the first migration:

```bash
cd src/Sehati.API
dotnet ef database update --project ../Sehati.Infrastructure
```

---

## 6. Environment Configuration

### Connection String

The project uses `appsettings.json` for shared settings and **User Secrets** for sensitive values.

#### Step 1: Set up User Secrets (one-time per machine)

```bash
cd src/Sehati.API
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;Database=SehatiDB;Trusted_Connection=True;TrustServerCertificate=True;"
```

> **⚠️ IMPORTANT:** Never put real passwords or connection strings in `appsettings.json` that gets committed to Git. Use User Secrets for development.

#### Step 2: JWT Secret (one-time per machine)

```bash
dotnet user-secrets set "JwtSettings:Secret" "your-secure-random-secret-key-at-least-32-characters-long"
```

### Template `appsettings.json` (committed to Git — no secrets)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=SehatiDB;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "JwtSettings": {
    "Issuer": "Sehati",
    "Audience": "SehatiApp",
    "ExpiryInMinutes": 60,
    "RefreshTokenExpiryInDays": 7
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

> **Note:** The connection string in `appsettings.json` is a template using Windows Authentication. If your SQL Server setup differs, override it using User Secrets.

---

## 7. Running the Application

### Start the Backend API

```bash
cd src/Sehati.API
dotnet run
```

The API will be available at:
- **API:** `https://localhost:7001`
- **Swagger UI:** `https://localhost:7001/swagger`

### Start the Frontend

```bash
cd src/Sehati.Web
ng serve
```

The frontend will be available at:
- **Web App:** `http://localhost:4200`

### Run Both Simultaneously

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd src/Sehati.API
dotnet run
```

**Terminal 2 (Frontend):**
```bash
cd src/Sehati.Web
ng serve
```

---

## 8. Daily Development Workflow

### Start of Day

```bash
# 1. Switch to the develop branch
git checkout develop

# 2. Pull the latest changes
git pull origin develop

# 3. Check if there are new NuGet packages
dotnet restore

# 4. Check if there are new database migrations
cd src/Sehati.API
dotnet ef database update --project ../Sehati.Infrastructure

# 5. Check if there are new frontend packages
cd src/Sehati.Web
npm install
```

### End of Day

```bash
# 1. Commit your work-in-progress
git add .
git commit -m "wip: [description of what you were working on]"

# 2. Push your feature branch
git push origin feature/your-feature-name
```

---

## 9. Working on a Task

### Step 1: Get Your Assignment

1. Check the [Progress Tracker](PROGRESS_TRACKER.md) for current phase tasks
2. Check GitHub Issues for assigned tasks
3. Understand the requirements before coding

### Step 2: Create a Feature Branch

```bash
# Make sure you're on develop with the latest code
git checkout develop
git pull origin develop

# Create your feature branch
git checkout -b feature/your-feature-name

# Examples:
git checkout -b feature/auth-jwt-login
git checkout -b feature/patient-crud
git checkout -b bugfix/login-validation
```

### Step 3: Implement

- Write clean, readable code
- Follow naming conventions
- Add error handling
- Don't hardcode secrets
- Use DTOs for API responses (never return domain entities directly)
- Add comments only where the code isn't self-explanatory

### Step 4: Commit Frequently

```bash
# Stage your changes
git add .

# Commit with a meaningful message (Conventional Commits format)
git commit -m "feat(auth): implement login endpoint with JWT generation"

# Push your branch
git push origin feature/your-feature-name
```

---

## 10. Testing Your Changes

### Backend Tests

```bash
# Build first
dotnet build

# Run all tests
dotnet test

# Run tests with output
dotnet test --verbosity normal
```

### Frontend Tests

```bash
cd src/Sehati.Web

# Run tests
ng test

# Run tests once (no watch mode)
ng test --no-watch
```

### Manual API Testing

1. Start the backend: `dotnet run` in `src/Sehati.API`
2. Open Swagger UI: `https://localhost:7001/swagger`
3. Test your endpoints interactively

---

## 11. Submitting a Pull Request

### Before Creating the PR

```bash
# 1. Make sure your branch is up-to-date with develop
git checkout develop
git pull origin develop
git checkout feature/your-feature-name
git rebase develop

# 2. Run all tests
dotnet build
dotnet test
cd src/Sehati.Web && ng test --no-watch

# 3. Review your changes
git diff develop

# 4. Push your branch
git push origin feature/your-feature-name
```

### Create the PR on GitHub

1. Go to [https://github.com/Fetoooo/Sehati](https://github.com/Fetoooo/Sehati)
2. Click **"Compare & pull request"** for your branch
3. Set the **base branch** to `develop`
4. Fill in the PR template:
   - Summary of changes
   - List of files changed
   - Testing performed
   - Screenshots (if UI changes)
5. Request review from a team member
6. Wait for approval before merging

### After the PR is Merged

```bash
# Switch back to develop
git checkout develop
git pull origin develop

# Delete your local feature branch
git branch -d feature/your-feature-name
```

---

## 12. Troubleshooting

### Common Issues

| Problem | Solution |
|---------|---------|
| `dotnet build` fails after pulling | Run `dotnet restore` to restore NuGet packages |
| `ng serve` fails with dependency errors | Delete `node_modules/` and run `npm install` |
| Database connection failed | Check SQL Server is running; verify connection string in User Secrets |
| Migration failed | Ensure database exists; check for pending migrations with `dotnet ef migrations list` |
| Port already in use | Kill the process using the port or change the port in launch settings |
| Git merge conflicts | Rebase your branch on `develop`, resolve conflicts file by file |
| CORS error in browser | Verify CORS is configured in `Program.cs` for `http://localhost:4200` |

### Getting Help

1. Check the [Project Architecture](PROJECT_ARCHITECTURE.md) for technical details
2. Check the [Development Workflow](DEVELOPMENT_WORKFLOW.md) for Git procedures
3. Ask in the team group chat
4. Create a GitHub Issue if you find a bug

---

*This guide will be updated as the project setup evolves. If you encounter an issue not covered here, please add it!*
