# 🔀 SEHATI — Development Workflow

> **Document Version:** 1.0.0  
> **Last Updated:** November 2, 2026

---

## Table of Contents

- [1. Git Branching Strategy](#1-git-branching-strategy)
- [2. Branch Naming Conventions](#2-branch-naming-conventions)
- [3. Commit Message Conventions](#3-commit-message-conventions)
- [4. Pull Request Guidelines](#4-pull-request-guidelines)
- [5. Code Review Requirements](#5-code-review-requirements)
- [6. Testing Requirements](#6-testing-requirements)
- [7. Merge Rules](#7-merge-rules)
- [8. GitHub Collaboration Guidelines](#8-github-collaboration-guidelines)
- [9. Release Process](#9-release-process)

---

## 1. Git Branching Strategy

Sehati uses a simplified **Git Flow** branching model suitable for a team of 5 developers.

```
main ──────────────────────────────────────────────────────► (production-ready)
  │
  └── develop ─────────────────────────────────────────────► (integration branch)
        │
        ├── feature/auth-login ──────► (merged back to develop)
        ├── feature/patient-crud ────► (merged back to develop)
        ├── bugfix/login-validation ─► (merged back to develop)
        └── hotfix/critical-fix ─────► (merged to main + develop)
```

### Branch Types

| Branch | Purpose | Created From | Merges Into |
|--------|---------|-------------|-------------|
| `main` | Production-ready code; always stable | — | — |
| `develop` | Integration branch; latest development work | `main` | `main` (via release) |
| `feature/*` | New features or enhancements | `develop` | `develop` |
| `bugfix/*` | Bug fixes during development | `develop` | `develop` |
| `hotfix/*` | Critical production fixes | `main` | `main` + `develop` |
| `release/*` | Release preparation (version bumps, final fixes) | `develop` | `main` + `develop` |

### Rules

- **Never push directly to `main`** — always use pull requests
- **`develop`** is the daily integration branch — all feature branches merge here
- **`main`** is updated only through reviewed pull requests from `develop` or `hotfix/*`
- **Delete feature branches** after they are merged

---

## 2. Branch Naming Conventions

### Format

```
<type>/<short-description>
```

### Examples

| Type | Example | Description |
|------|---------|-------------|
| Feature | `feature/auth-jwt-login` | JWT authentication login |
| Feature | `feature/patient-crud` | Patient CRUD operations |
| Feature | `feature/prescription-builder` | Digital prescription builder |
| Bugfix | `bugfix/login-validation-error` | Fix login form validation |
| Bugfix | `bugfix/patient-search-null` | Fix null reference in search |
| Hotfix | `hotfix/security-token-expiry` | Fix token expiry issue |
| Release | `release/v1.0.0` | Version 1.0.0 release prep |

### Rules

- Use **lowercase** and **hyphens** (not underscores or camelCase)
- Keep names **short but descriptive** (3–5 words)
- Include the **module name** when relevant (e.g., `feature/auth-login`, `feature/patient-search`)

---

## 3. Commit Message Conventions

Sehati follows the **Conventional Commits** specification.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(auth): implement JWT login endpoint` |
| `fix` | Bug fix | `fix(patients): resolve null reference in search` |
| `docs` | Documentation only | `docs: update development roadmap` |
| `style` | Code style (formatting, missing semicolons) | `style(api): format controller methods` |
| `refactor` | Code refactoring (no feature/fix) | `refactor(services): extract common validation logic` |
| `test` | Adding or updating tests | `test(auth): add login integration tests` |
| `chore` | Maintenance tasks | `chore: update NuGet packages` |
| `build` | Build system changes | `build: configure EF Core migration tools` |
| `ci` | CI/CD configuration | `ci: add GitHub Actions workflow` |
| `perf` | Performance improvements | `perf(db): add index on patient search columns` |

### Scopes

| Scope | Area |
|-------|------|
| `auth` | Authentication & authorization |
| `patients` | Patient management |
| `doctors` | Doctor management |
| `clinics` | Clinic management |
| `visits` | Visit/encounter management |
| `rx` | Prescriptions |
| `consent` | Access permissions & consent |
| `emergency` | Emergency profiles |
| `appointments` | Scheduling & queue |
| `audit` | Audit logging |
| `notifications` | Notification system |
| `db` | Database & migrations |
| `api` | API layer concerns |
| `ui` | Frontend/UI components |
| `infra` | Infrastructure & deployment |

### Rules

- Use **imperative mood** in the description ("add" not "added", "fix" not "fixed")
- **First line** ≤ 72 characters
- Reference **issue numbers** in the footer when applicable: `Closes #42`
- **Breaking changes** must include `BREAKING CHANGE:` in the footer

### Good Examples

```
feat(auth): implement JWT token generation with refresh tokens

- Add TokenService with access and refresh token generation
- Configure JWT middleware in Program.cs
- Add auth DTOs and FluentValidation validators

Closes #12
```

```
fix(patients): resolve duplicate Unified Patient ID generation

The sequence generator was not using atomic transactions,
causing potential race conditions under concurrent registration.

Closes #35
```

### Bad Examples

```
# ❌ Too vague
fix: fixed stuff

# ❌ No type
updated the login page

# ❌ Past tense
feat(auth): added login functionality
```

---

## 4. Pull Request Guidelines

### PR Title Format

```
[<Type>] <Short Description>
```

**Examples:**
- `[Feature] JWT Authentication with Login and Register`
- `[Bugfix] Patient search returning null for phone queries`
- `[Docs] Update project roadmap for Phase 3`

### PR Description Template

When creating a pull request, use this template:

```markdown
## Summary
Brief description of what this PR does.

## Changes
- List of specific changes made
- Files added/modified
- New endpoints or components

## Related Issues
Closes #<issue_number>

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Refactoring
- [ ] Test addition

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] `dotnet build` succeeds
- [ ] `dotnet test` passes
- [ ] Frontend builds (`ng build`)
- [ ] Manual testing performed

## Screenshots (if UI changes)
Add screenshots or recordings here.

## Checklist
- [ ] Code follows project conventions
- [ ] Self-reviewed the code
- [ ] No secrets or credentials committed
- [ ] Documentation updated (if needed)
- [ ] No unnecessary files included
```

### Rules

- **Every feature branch** must have a pull request to merge into `develop`
- PRs must have a **clear description** of changes
- PRs should be **focused** — one feature or fix per PR (avoid mega-PRs)
- PRs must pass **all CI checks** before merge
- **At least 1 reviewer** must approve before merging

---

## 5. Code Review Requirements

### Who Reviews

| Author's Role | Reviewer(s) |
|---------------|------------|
| Backend code | At least 1 backend team member |
| Frontend code | At least 1 frontend team member |
| Database changes | Database engineer + 1 other |
| Security-related | Security engineer must review |
| Architecture changes | Lead architect must review |

### Review Checklist

Reviewers should verify:

- [ ] Code is readable and well-structured
- [ ] Naming conventions are followed
- [ ] No unnecessary code or dead code
- [ ] Error handling is proper
- [ ] No security vulnerabilities
- [ ] No hardcoded secrets or credentials
- [ ] DTOs are used (no domain entities exposed in controllers)
- [ ] Input validation is present
- [ ] Tests are included for new functionality
- [ ] Existing tests still pass
- [ ] Database migrations are reviewed
- [ ] API responses follow the standard envelope format

### Review Etiquette

- Be **constructive** and specific in feedback
- Explain **why** something should change, not just what
- Use **"suggestion"** and **"nit"** prefixes for non-critical comments
- Approve with minor nits — the author can fix and merge
- **Block** only for genuine issues (security, bugs, architecture violations)

---

## 6. Testing Requirements

### Per-Phase Testing Matrix

| Phase | Unit Tests | Integration Tests | API Tests | Frontend Tests | Build Verify |
|-------|:----------:|:-----------------:|:---------:|:--------------:|:------------:|
| Phase 2 | — | — | — | — | ✅ |
| Phase 3 | ✅ | ✅ | — | — | ✅ |
| Phase 4 | ✅ | ✅ | ✅ | — | ✅ |
| Phase 5 | ✅ | ✅ | ✅ | — | ✅ |
| Phase 6 | ✅ | ✅ | ✅ | — | ✅ |
| Phase 7 | ✅ | ✅ | ✅ | — | ✅ |
| Phase 8 | — | — | — | ✅ | ✅ |
| Phase 9 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Phase 10 | ✅ | ✅ | ✅ | ✅ | ✅ |

### Verification Commands

```bash
# Backend
dotnet build                    # Must succeed with zero errors
dotnet test                     # All tests must pass

# Frontend
ng build                        # Must succeed with zero errors
ng test                         # All tests must pass
ng test --no-watch --code-coverage  # Coverage report
```

---

## 7. Merge Rules

### Merging Feature Branches → `develop`

1. All CI checks pass
2. At least 1 approval from a reviewer
3. No unresolved review comments
4. Branch is up-to-date with `develop` (rebase or merge)
5. Use **squash merge** for clean commit history

### Merging `develop` → `main`

1. All tests pass on `develop`
2. Reviewed by lead developer
3. Changelog updated
4. Version tagged
5. Use **merge commit** (not squash) to preserve history

### Conflict Resolution

1. **Never force-push to shared branches** (`main`, `develop`)
2. Rebase your feature branch on `develop` before creating a PR
3. If conflicts exist, resolve them **in the feature branch** before merging
4. Communicate with the author of conflicting code

---

## 8. GitHub Collaboration Guidelines

### Issue Tracking

- Use GitHub Issues for **bugs**, **features**, and **tasks**
- Label issues: `bug`, `feature`, `documentation`, `enhancement`, `question`
- Assign issues to team members before starting work
- Reference issues in commits and PRs

### Project Board

- Use a GitHub Project board with columns: `Backlog`, `In Progress`, `In Review`, `Done`
- Move cards as work progresses
- Each phase maps to a milestone

### Communication

- Comment on PRs and issues — don't discuss code changes outside GitHub
- Use `@mentions` to request attention
- Keep discussions focused and professional

### Protected Files

- Do **not** modify these without team discussion:
  - `README.md`
  - `docs/PROJECT_ARCHITECTURE.md`
  - `Sehati.sln`
  - `appsettings.json` (template)
  - Database migration files (once applied)

---

## 9. Release Process

### Version Numbering

Follow **Semantic Versioning** (`MAJOR.MINOR.PATCH`):

| Change | Version Bump | Example |
|--------|-------------|---------|
| Breaking API changes | MAJOR | 1.0.0 → 2.0.0 |
| New features (backward compatible) | MINOR | 1.0.0 → 1.1.0 |
| Bug fixes | PATCH | 1.0.0 → 1.0.1 |

### Release Steps

1. Create `release/vX.Y.Z` branch from `develop`
2. Update version numbers
3. Update `CHANGELOG.md`
4. Final testing
5. Merge to `main` via PR
6. Tag the release: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`
7. Push tag: `git push origin vX.Y.Z`
8. Merge back to `develop`

---

*This workflow document will be updated as the team's process matures.*
