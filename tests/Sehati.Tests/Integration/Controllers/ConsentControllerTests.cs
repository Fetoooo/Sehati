using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Sehati.Application.DTOs.Auth;
using Sehati.Application.DTOs.Consent;
using Sehati.Application.DTOs.Doctors;
using Sehati.Application.DTOs.Patients;
using Sehati.Domain.Enums;
using Sehati.Tests.Common;

namespace Sehati.Tests.Integration.Controllers;

public class ConsentControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public ConsentControllerTests(CustomWebApplicationFactory factory)
    {
        factory.EnsureDatabaseSeeded();
        _client = factory.CreateClient();
    }

    private async Task<string> GetUserTokenAsync(string roleName)
    {
        var registerDto = new RegisterDto
        {
            Email = $"{roleName.ToLower()}_{Guid.NewGuid():N}@sehati.com",
            Password = TestAuthHelper.DefaultTestPassword,
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            FullName = $"{roleName} User",
            RoleName = roleName,
            Specialty = roleName == "Doctor" ? "General Practice" : null,
            LicenseNumber = roleName == "Doctor" ? "LIC-" + Random.Shared.Next(1000, 9999) : null
        };

        var response = await _client.PostAsJsonAsync("/api/v1/auth/register", registerDto);
        response.EnsureSuccessStatusCode();

        var tokens = await response.Content.ReadFromJsonAsync<TokenResponseDto>(JsonOptions);
        return tokens!.AccessToken;
    }

    private static HttpRequestMessage CreateAuthorizedRequest(HttpMethod method, string url, string token, object? body = null)
    {
        var request = new HttpRequestMessage(method, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        if (body != null)
        {
            request.Content = JsonContent.Create(body);
        }
        return request;
    }

    [Fact]
    public async Task GrantAccess_And_CheckAccess_WorksEndToEnd()
    {
        // Arrange
        var adminToken = await GetUserTokenAsync("ClinicAdmin");
        var patientToken = await GetUserTokenAsync("Patient");
        var uniqueSuffix = Guid.NewGuid().ToString("N")[..8];

        var docDto = new CreateDoctorDto
        {
            FullName = $"Dr. Consent {uniqueSuffix}",
            Specialty = "Cardiology",
            LicenseNumber = $"LIC-C-{uniqueSuffix}",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            Email = $"dr.consent_{uniqueSuffix}@sehati.com",
            Password = TestAuthHelper.CreateValidPassword()
        };
        var docRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/doctors", adminToken, docDto));
        var doctor = await docRes.Content.ReadFromJsonAsync<DoctorDto>(JsonOptions);

        var patientDto = new CreatePatientDto
        {
            FullName = $"Patient Consent {uniqueSuffix}",
            DateOfBirth = new DateOnly(1994, 2, 10),
            Gender = Gender.Female,
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            Email = $"pat.consent_{uniqueSuffix}@sehati.com"
        };
        var patRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/patients", adminToken, patientDto));
        var patient = await patRes.Content.ReadFromJsonAsync<PatientDto>(JsonOptions);

        // Act 1: Grant Access
        var grantDto = new GrantAccessPermissionDto
        {
            DoctorId = doctor!.DoctorId,
            AccessType = AccessType.ViewAndAddRecords,
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        };
        var grantReq = CreateAuthorizedRequest(HttpMethod.Post, $"/api/v1/consent/patient/{patient!.PatientId}", patientToken, grantDto);
        var grantRes = await _client.SendAsync(grantReq);

        // Assert 1
        grantRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var granted = await grantRes.Content.ReadFromJsonAsync<AccessPermissionDto>(JsonOptions);
        granted.Should().NotBeNull();
        granted!.Status.Should().Be(AccessPermissionStatus.Active);

        // Act 2: Check Access
        var checkDto = new CheckAccessDto
        {
            PatientId = patient.PatientId,
            DoctorId = doctor.DoctorId
        };
        var checkReq = CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/consent/check", patientToken, checkDto);
        var checkRes = await _client.SendAsync(checkReq);

        // Assert 2
        checkRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var checkResult = await checkRes.Content.ReadFromJsonAsync<AccessCheckResultDto>(JsonOptions);
        checkResult.Should().NotBeNull();
        checkResult!.HasAccess.Should().BeTrue();
    }
}

