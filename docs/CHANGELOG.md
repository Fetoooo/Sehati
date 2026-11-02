# 📝 SEHATI — Changelog

All notable changes to the Sehati project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]
### Added
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
