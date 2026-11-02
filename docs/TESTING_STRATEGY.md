# 🧪 SEHATI — Testing Strategy

> **Document Version:** 1.0.0  
> **Last Updated:** November 2, 2026

---

## Table of Contents

- [1. Testing Philosophy](#1-testing-philosophy)
- [2. Testing Pyramid](#2-testing-pyramid)
- [3. Backend Testing (.NET)](#3-backend-testing-net)
- [4. Frontend Testing (Angular)](#4-frontend-testing-angular)
- [5. API Testing](#5-api-testing)
- [6. Database Testing](#6-database-testing)
- [7. End-to-End Testing](#7-end-to-end-testing)
- [8. Security Testing](#8-security-testing)
- [9. Regression Testing](#9-regression-testing)
- [10. Testing Tools](#10-testing-tools)
- [11. Minimum Acceptance Criteria](#11-minimum-acceptance-criteria)
- [12. Test Execution Commands](#12-test-execution-commands)

---

## 1. Testing Philosophy

- **Test what matters** — focus on business logic, data integrity, and security
- **Every phase includes tests** — no phase is marked complete without relevant tests
- **Don't fake results** — if a test cannot be run (missing infrastructure, credentials), report it clearly
- **Fix before moving on** — failing tests must be resolved before proceeding to the next phase

---

## 2. Testing Pyramid

```
        ┌─────────┐
        │  E2E    │  ← Few: Critical user journeys
        │ Tests   │
       ┌┴─────────┴┐
       │Integration │  ← Moderate: API + DB interactions
       │  Tests     │
      ┌┴────────────┴┐
      │  Unit Tests   │  ← Many: Services, validators, logic
      └───────────────┘
```

| Layer | Quantity | Speed | Scope |
|-------|----------|-------|-------|
| **Unit Tests** | Many (≥70% of tests) | Fast (ms) | Single method/class in isolation |
| **Integration Tests** | Moderate (~20%) | Medium (seconds) | Multiple components together |
| **E2E Tests** | Few (~10%) | Slow (seconds-minutes) | Full user workflows |

---

## 3. Backend Testing (.NET)

### Framework: xUnit

| Tool | Purpose |
|------|---------|
| **xUnit** | Test framework |
| **Moq** | Mocking dependencies |
| **FluentAssertions** | Readable assertion syntax |
| **Microsoft.AspNetCore.Mvc.Testing** | Integration testing with `WebApplicationFactory` |
| **Microsoft.EntityFrameworkCore.InMemory** | In-memory database for unit tests |

### Unit Test Targets

| Target | Examples |
|--------|---------|
| **Services** | `AuthService.Login()`, `PatientService.GenerateUnifiedId()` |
| **Validators** | `RegisterDtoValidator`, `PrescriptionDtoValidator` |
| **Mappers** | DTO ↔ Entity mapping correctness |
| **Business Logic** | Consent expiry checks, role permission validation |
| **ID Generation** | Unified Patient ID format and uniqueness |

### Unit Test Structure

```csharp
// Naming: MethodName_Scenario_ExpectedResult
[Fact]
public async Task Login_WithValidCredentials_ReturnsTokenResponse()
{
    // Arrange
    var mockRepo = new Mock<IUserRepository>();
    var service = new AuthService(mockRepo.Object, _config);
    
    // Act
    var result = await service.LoginAsync(validLoginDto);
    
    // Assert
    result.Should().NotBeNull();
    result.AccessToken.Should().NotBeEmpty();
}
```

### Integration Test Targets

| Target | Examples |
|--------|---------|
| **Controllers** | Full HTTP request → response via `WebApplicationFactory` |
| **Database** | EF Core queries against SQL Server test database |
| **Auth Flow** | Register → Login → Access Protected Endpoint |
| **Data Integrity** | Foreign key constraints, unique constraint enforcement |

### Integration Test Structure

```csharp
public class AuthControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    
    public AuthControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }
    
    [Fact]
    public async Task Register_WithValidData_Returns201Created()
    {
        // Arrange
        var registerDto = new { Email = "test@example.com", Password = "SecurePass123!" };
        
        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/auth/register", registerDto);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }
}
```

---

## 4. Frontend Testing (Angular)

### Framework: Jasmine + Karma

| Tool | Purpose |
|------|---------|
| **Jasmine** | Test framework |
| **Karma** | Test runner |
| **Angular TestBed** | Component testing utilities |

### Test Targets

| Target | Examples |
|--------|---------|
| **Components** | Login form renders, patient card displays data |
| **Services** | `AuthService.login()` calls API correctly |
| **Guards** | `AuthGuard` redirects unauthenticated users |
| **Pipes** | Date formatting, Arabic text pipes |
| **Interceptors** | JWT interceptor adds Authorization header |

### Component Test Example

```typescript
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [{ provide: AuthService, useValue: mockAuthService }]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should disable submit button when form is invalid', () => {
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBeTrue();
  });
});
```

---

## 5. API Testing

### Tools: Integration Tests + Swagger + Manual

| Method | When |
|--------|------|
| **Automated (xUnit + WebApplicationFactory)** | Every backend phase |
| **Swagger UI** | Manual exploration and smoke testing |
| **HTTP files (`.http`)** | Shareable API test scripts |

### API Test Coverage

For each endpoint, verify:

- [ ] Correct HTTP status code for success
- [ ] Correct HTTP status code for validation errors (400)
- [ ] Correct HTTP status code for unauthorized access (401)
- [ ] Correct HTTP status code for forbidden access (403)
- [ ] Correct HTTP status code for not found (404)
- [ ] Response body matches expected schema
- [ ] Pagination works correctly
- [ ] Filtering/search returns expected results
- [ ] Request validation rejects invalid input

---

## 6. Database Testing

### What to Test

| Test | Description |
|------|-------------|
| **Migration** | `dotnet ef database update` applies cleanly |
| **Schema** | All tables, columns, and constraints match ERD |
| **Relationships** | Foreign keys enforce referential integrity |
| **Unique Constraints** | Duplicate entries are rejected |
| **Seed Data** | Default roles exist after migration |
| **CRUD** | Create, Read, Update, Delete for each entity |
| **Cascading** | Delete behavior is correct (Restrict vs Cascade) |

### EF Core Testing Approach

- **Unit tests:** Use `InMemoryDatabase` for fast, isolated service tests
- **Integration tests:** Use a real SQL Server test database for migration and schema tests
- **Transaction rollback:** Wrap integration tests in transactions that roll back after each test

---

## 7. End-to-End Testing

### Critical User Journeys to Test

| Journey | Steps |
|---------|-------|
| **Patient Registration** | Register → Login → View Profile → See Unified ID |
| **Doctor Consultation** | Login → Search Patient → Check Consent → Record Visit → Prescribe |
| **Consent Flow** | Patient Grants Access → Doctor Views Records → Patient Revokes |
| **Emergency Access** | Scan QR / Enter Unified ID → View Emergency Profile |
| **Appointment Flow** | Receptionist Books → Patient Sees Appointment → Doctor Completes Visit |

### E2E Testing Tools (Phase 10)

- **Cypress** or **Playwright** for browser-based E2E tests
- Focus on the 5 critical journeys above

---

## 8. Security Testing

### OWASP Top 10 Checklist

| Vulnerability | Test |
|--------------|------|
| **Injection** | Verify EF Core parameterized queries; test with SQL injection payloads |
| **Broken Authentication** | Test expired tokens, invalid tokens, token reuse after logout |
| **Sensitive Data Exposure** | Verify passwords are hashed; verify no secrets in responses |
| **Broken Access Control** | Test accessing other users' data; test role escalation |
| **Security Misconfiguration** | Verify CORS, headers, error messages don't leak info |
| **XSS** | Test input fields with script tags; verify Angular sanitization |
| **CSRF** | Verify anti-forgery protection where needed |

### Security Test Examples

```csharp
[Fact]
public async Task GetPatient_WithoutToken_Returns401()
{
    var response = await _client.GetAsync("/api/v1/patients/1");
    response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
}

[Fact]
public async Task GetPatient_AsDifferentPatient_Returns403()
{
    _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", otherPatientToken);
    var response = await _client.GetAsync("/api/v1/patients/1");
    response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
}
```

---

## 9. Regression Testing

- **Run the full test suite** before every PR merge
- **Automated via CI** — GitHub Actions runs `dotnet test` and `ng test` on every push
- **Manual regression** — before each phase completion, verify previous features still work
- **Database regressions** — verify new migrations don't break existing data

---

## 10. Testing Tools Summary

| Category | Tool | Environment |
|----------|------|-------------|
| Backend Unit Testing | xUnit + Moq + FluentAssertions | .NET |
| Backend Integration Testing | WebApplicationFactory | .NET |
| Database Testing | EF Core InMemory + SQL Server | .NET |
| Frontend Unit Testing | Jasmine + Karma | Angular |
| Frontend E2E Testing | Cypress or Playwright | Browser |
| API Manual Testing | Swagger UI | Browser |
| Security Testing | Manual OWASP checklist + automated tests | .NET |
| Code Coverage | Coverlet (.NET) + Istanbul (Angular) | CI/CD |

---

## 11. Minimum Acceptance Criteria

### Per-Phase Requirements

| Criterion | Requirement |
|-----------|------------|
| **Build** | `dotnet build` and `ng build` succeed with zero errors |
| **Tests** | All existing tests pass; new tests added for new functionality |
| **Coverage** | New code should have tests for critical paths |
| **Security** | No credentials committed; auth/authz verified |
| **Regression** | Previous features still work correctly |

### Pre-Release Requirements (Phase 10)

| Criterion | Target |
|-----------|--------|
| Backend test coverage | ≥ 80% line coverage |
| Frontend test coverage | ≥ 70% line coverage |
| Zero critical bugs | No P0/P1 bugs open |
| OWASP checklist | All items verified |
| Performance | Patient lookup < 1.5s, API p95 < 500ms |

---

## 12. Test Execution Commands

```bash
# ── Backend ──
dotnet build                                  # Build verification
dotnet test                                   # Run all backend tests
dotnet test --filter "Category=Unit"          # Run only unit tests
dotnet test --filter "Category=Integration"   # Run only integration tests
dotnet test --collect:"XPlat Code Coverage"   # Run with coverage

# ── Frontend ──
cd src/Sehati.Web
ng test                                       # Run frontend tests
ng test --no-watch --code-coverage            # Run with coverage report
ng build                                      # Build verification

# ── Full Verification ──
dotnet build && dotnet test && cd src/Sehati.Web && ng build && ng test --no-watch
```

---

*This testing strategy will be updated as the project evolves and new testing requirements emerge.*
