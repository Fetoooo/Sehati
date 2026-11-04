using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Auth;
using Sehati.Application.DTOs.Clinics;
using Sehati.Domain.Enums;
using Sehati.Tests.Common;

namespace Sehati.Tests.Integration.Controllers;

public class ClinicsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public ClinicsControllerTests(CustomWebApplicationFactory factory)
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
    public async Task CreateClinic_AsClinicAdmin_ReturnsCreated()
    {
        // Arrange
        var token = await GetUserTokenAsync("ClinicAdmin");
        var uniqueSuffix = Guid.NewGuid().ToString("N")[..8];
        var dto = new CreateClinicDto
        {
            ClinicName = $"Hope Clinic {uniqueSuffix}",
            Specialty = "Cardiology",
            Address = "15 Tahrir St, Cairo",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            Email = $"hope_{uniqueSuffix}@sehati.com",
            WorkingHours = "09:00 - 18:00",
            Status = ClinicStatus.Active
        };

        // Act
        var request = CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/clinics", token, dto);
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await response.Content.ReadFromJsonAsync<ClinicDto>(JsonOptions);
        created.Should().NotBeNull();
        created!.ClinicId.Should().BeGreaterThan(0);
        created.ClinicName.Should().Be(dto.ClinicName);
    }

    [Fact]
    public async Task CreateClinic_AsPatient_ReturnsForbidden()
    {
        // Arrange
        var token = await GetUserTokenAsync("Patient");
        var dto = new CreateClinicDto
        {
            ClinicName = "Unauthorized Clinic",
            Specialty = "Pediatrics",
            Address = "Address",
            Phone = "+201012345678",
            Email = "unauth@clinic.com",
            WorkingHours = "09:00 - 17:00",
            Status = ClinicStatus.Active
        };

        // Act
        var request = CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/clinics", token, dto);
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetClinics_Authorized_ReturnsPaginatedList()
    {
        // Arrange
        var token = await GetUserTokenAsync("Doctor");

        // Act
        var request = CreateAuthorizedRequest(HttpMethod.Get, "/api/v1/clinics?page=1&pageSize=10", token);
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var list = await response.Content.ReadFromJsonAsync<PaginatedList<ClinicDto>>(JsonOptions);
        list.Should().NotBeNull();
        list!.Items.Should().NotBeNull();
    }

    [Fact]
    public async Task GetClinicById_WithValidId_ReturnsClinicDetail()
    {
        // Arrange
        var adminToken = await GetUserTokenAsync("ClinicAdmin");
        var uniqueSuffix = Guid.NewGuid().ToString("N")[..8];
        var createDto = new CreateClinicDto
        {
            ClinicName = $"Detail Clinic {uniqueSuffix}",
            Specialty = "Dermatology",
            Address = "Nasr City",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            Email = $"detail_{uniqueSuffix}@sehati.com",
            WorkingHours = "09:00 - 17:00",
            Status = ClinicStatus.Active
        };

        var postReq = CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/clinics", adminToken, createDto);
        var postRes = await _client.SendAsync(postReq);
        postRes.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await postRes.Content.ReadFromJsonAsync<ClinicDto>(JsonOptions);

        // Act
        var getReq = CreateAuthorizedRequest(HttpMethod.Get, $"/api/v1/clinics/{created!.ClinicId}", adminToken);
        var getRes = await _client.SendAsync(getReq);

        // Assert
        getRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var detail = await getRes.Content.ReadFromJsonAsync<ClinicDetailDto>(JsonOptions);
        detail.Should().NotBeNull();
        detail!.ClinicId.Should().Be(created.ClinicId);
        detail.ClinicName.Should().Be(createDto.ClinicName);
    }

    [Fact]
    public async Task SearchClinics_WithQuery_ReturnsMatchingClinics()
    {
        // Arrange
        var adminToken = await GetUserTokenAsync("ClinicAdmin");
        var uniqueSuffix = Guid.NewGuid().ToString("N")[..8];
        var createDto = new CreateClinicDto
        {
            ClinicName = $"Delta Specialty {uniqueSuffix}",
            Specialty = "Neurology",
            Address = "Mansoura",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            Email = $"delta_{uniqueSuffix}@sehati.com",
            WorkingHours = "09:00 - 17:00",
            Status = ClinicStatus.Active
        };

        var postReq = CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/clinics", adminToken, createDto);
        await _client.SendAsync(postReq);

        // Act
        var searchReq = CreateAuthorizedRequest(HttpMethod.Get, $"/api/v1/clinics/search?q={uniqueSuffix}", adminToken);
        var searchRes = await _client.SendAsync(searchReq);

        // Assert
        searchRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var results = await searchRes.Content.ReadFromJsonAsync<List<ClinicDto>>(JsonOptions);
        results.Should().NotBeNull();
        results!.Should().Contain(c => c.ClinicName.Contains(uniqueSuffix));
    }
}

