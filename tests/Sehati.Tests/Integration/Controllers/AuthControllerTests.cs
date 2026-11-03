using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Sehati.Application.DTOs.Auth;
using Sehati.Domain.Entities;
using Sehati.Domain.Enums;
using Sehati.Infrastructure.Persistence;

namespace Sehati.Tests.Integration.Controllers;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private static bool _databaseInitialized = false;
    private static readonly object _lock = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((context, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "UseInMemoryDatabase", "true" },
                { "InMemoryDbName", "SehatiIntegrationSharedDb" }
            });
        });
    }

    public void EnsureDatabaseSeeded()
    {
        lock (_lock)
        {
            if (!_databaseInitialized)
            {
                using var scope = Services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<SehatiDbContext>();
                db.Database.EnsureCreated();

                if (!db.Roles.Any())
                {
                    db.Roles.AddRange(
                        new Role { RoleId = 1, RoleName = "Patient" },
                        new Role { RoleId = 2, RoleName = "Doctor" },
                        new Role { RoleId = 3, RoleName = "Receptionist" },
                        new Role { RoleId = 4, RoleName = "ClinicAdmin" },
                        new Role { RoleId = 5, RoleName = "SystemAdmin" }
                    );
                    db.SaveChanges();
                }

                _databaseInitialized = true;
            }
        }
    }
}

public class AuthControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public AuthControllerTests(CustomWebApplicationFactory factory)
    {
        factory.EnsureDatabaseSeeded();
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Register_WithValidPatientData_ReturnsCreated_WithTokens()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            Email = $"patient_{Guid.NewGuid():N}@sehati.com",
            Password = "SecurePassword@2026",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            FullName = "Amr Diab",
            RoleName = "Patient",
            DateOfBirth = new DateOnly(1985, 3, 10),
            Gender = Gender.Male
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/auth/register", registerDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var tokenResponse = await response.Content.ReadFromJsonAsync<TokenResponseDto>(JsonOptions);
        tokenResponse.Should().NotBeNull();
        tokenResponse!.AccessToken.Should().NotBeNullOrWhiteSpace();
        tokenResponse.RefreshToken.Should().NotBeNullOrWhiteSpace();
        tokenResponse.User.Role.Should().Be("Patient");
        tokenResponse.User.UnifiedPatientId.Should().StartWith("SH-");
    }

    [Fact]
    public async Task Register_WithInvalidData_ReturnsBadRequest()
    {
        // Arrange
        var invalidDto = new RegisterDto
        {
            Email = "invalid-email-format",
            Password = "weak",
            Phone = "",
            FullName = ""
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/auth/register", invalidDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOk_WithTokens()
    {
        // Arrange
        var email = $"login_{Guid.NewGuid():N}@sehati.com";
        var phone = "+2010" + Random.Shared.Next(10000000, 99999999);
        var registerDto = new RegisterDto
        {
            Email = email,
            Password = "SecurePassword@2026",
            Phone = phone,
            FullName = "Valid User",
            RoleName = "Patient"
        };
        await _client.PostAsJsonAsync("/api/v1/auth/register", registerDto);

        var loginDto = new LoginDto
        {
            EmailOrPhone = email,
            Password = "SecurePassword@2026"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", loginDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var tokenResponse = await response.Content.ReadFromJsonAsync<TokenResponseDto>(JsonOptions);
        tokenResponse.Should().NotBeNull();
        tokenResponse!.AccessToken.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsUnauthorized()
    {
        // Arrange
        var email = $"wrongpass_{Guid.NewGuid():N}@sehati.com";
        var registerDto = new RegisterDto
        {
            Email = email,
            Password = "SecurePassword@2026",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            FullName = "User Test",
            RoleName = "Patient"
        };
        await _client.PostAsJsonAsync("/api/v1/auth/register", registerDto);

        var loginDto = new LoginDto
        {
            EmailOrPhone = email,
            Password = "WrongPassword#9999"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", loginDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task RefreshToken_WithValidTokens_ReturnsNewTokens()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            Email = $"refreshtest_{Guid.NewGuid():N}@sehati.com",
            Password = "SecurePassword@2026",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            FullName = "Refresh User",
            RoleName = "Patient"
        };
        var regResponse = await _client.PostAsJsonAsync("/api/v1/auth/register", registerDto);
        var regTokens = await regResponse.Content.ReadFromJsonAsync<TokenResponseDto>(JsonOptions);

        var refreshDto = new RefreshTokenDto
        {
            AccessToken = regTokens!.AccessToken,
            RefreshToken = regTokens.RefreshToken
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/auth/refresh-token", refreshDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var newTokens = await response.Content.ReadFromJsonAsync<TokenResponseDto>(JsonOptions);
        newTokens.Should().NotBeNull();
        newTokens!.AccessToken.Should().NotBeNullOrWhiteSpace();
        newTokens.RefreshToken.Should().NotBe(regTokens.RefreshToken);
    }

    [Fact]
    public async Task GetCurrentUser_WithoutToken_ReturnsUnauthorized()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/auth/me");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetCurrentUser_WithValidToken_ReturnsUserDto()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            Email = $"me_{Guid.NewGuid():N}@sehati.com",
            Password = "SecurePassword@2026",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            FullName = "Current Profile User",
            RoleName = "Patient"
        };
        var regResponse = await _client.PostAsJsonAsync("/api/v1/auth/register", registerDto);
        var tokens = await regResponse.Content.ReadFromJsonAsync<TokenResponseDto>(JsonOptions);

        var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/auth/me");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokens!.AccessToken);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var user = await response.Content.ReadFromJsonAsync<UserDto>(JsonOptions);
        user.Should().NotBeNull();
        user!.Email.Should().Be(registerDto.Email);
        user.FullName.Should().Be("Current Profile User");
        user.Role.Should().Be("Patient");
    }

    [Fact]
    public async Task RoleAuthorization_PatientAccessingDoctorEndpoint_ReturnsForbidden()
    {
        // Arrange: Register patient
        var registerDto = new RegisterDto
        {
            Email = $"pat_role_{Guid.NewGuid():N}@sehati.com",
            Password = "SecurePassword@2026",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            FullName = "Role Test Patient",
            RoleName = "Patient"
        };
        var regResponse = await _client.PostAsJsonAsync("/api/v1/auth/register", registerDto);
        var tokens = await regResponse.Content.ReadFromJsonAsync<TokenResponseDto>(JsonOptions);

        // Request doctor-only endpoint with patient token
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/auth/doctor-only");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokens!.AccessToken);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task RoleAuthorization_DoctorAccessingDoctorEndpoint_ReturnsOk()
    {
        // Arrange: Register doctor
        var registerDto = new RegisterDto
        {
            Email = $"doc_role_{Guid.NewGuid():N}@sehati.com",
            Password = "SecurePassword@2026",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            FullName = "Dr. Hossam Ghaly",
            RoleName = "Doctor",
            Specialty = "Orthopedics",
            LicenseNumber = "DOC-ORTHO-" + Random.Shared.Next(1000, 9999)
        };
        var regResponse = await _client.PostAsJsonAsync("/api/v1/auth/register", registerDto);
        var tokens = await regResponse.Content.ReadFromJsonAsync<TokenResponseDto>(JsonOptions);

        var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/auth/doctor-only");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokens!.AccessToken);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Logout_WithValidToken_ReturnsOk()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            Email = $"logout_{Guid.NewGuid():N}@sehati.com",
            Password = "SecurePassword@2026",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            FullName = "Logout Integration User",
            RoleName = "Patient"
        };
        var regResponse = await _client.PostAsJsonAsync("/api/v1/auth/register", registerDto);
        var tokens = await regResponse.Content.ReadFromJsonAsync<TokenResponseDto>(JsonOptions);

        var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/auth/logout");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokens!.AccessToken);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
