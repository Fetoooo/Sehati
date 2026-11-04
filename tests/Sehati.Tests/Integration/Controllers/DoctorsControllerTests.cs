using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Auth;
using Sehati.Application.DTOs.Clinics;
using Sehati.Application.DTOs.Doctors;
using Sehati.Domain.Enums;
using Sehati.Tests.Common;

namespace Sehati.Tests.Integration.Controllers;

public class DoctorsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public DoctorsControllerTests(CustomWebApplicationFactory factory)
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
    public async Task CreateDoctor_AsClinicAdmin_ReturnsCreated()
    {
        // Arrange
        var token = await GetUserTokenAsync("ClinicAdmin");
        var uniqueSuffix = Guid.NewGuid().ToString("N")[..8];
        var dto = new CreateDoctorDto
        {
            FullName = $"Dr. Onboarding {uniqueSuffix}",
            Specialty = "Pediatrics",
            LicenseNumber = $"LIC-{uniqueSuffix}",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            Email = $"dr.onboard_{uniqueSuffix}@sehati.com",
            Password = TestAuthHelper.CreateValidPassword()
        };

        // Act
        var request = CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/doctors", token, dto);
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await response.Content.ReadFromJsonAsync<DoctorDto>(JsonOptions);
        created.Should().NotBeNull();
        created!.DoctorId.Should().BeGreaterThan(0);
        created.FullName.Should().Be(dto.FullName);
        created.Specialty.Should().Be("Pediatrics");
    }

    [Fact]
    public async Task GetDoctors_Authorized_ReturnsPaginatedList()
    {
        // Arrange
        var token = await GetUserTokenAsync("Patient");

        // Act
        var request = CreateAuthorizedRequest(HttpMethod.Get, "/api/v1/doctors?page=1&pageSize=10", token);
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var list = await response.Content.ReadFromJsonAsync<PaginatedList<DoctorDto>>(JsonOptions);
        list.Should().NotBeNull();
        list!.Items.Should().NotBeNull();
    }

    [Fact]
    public async Task GetDoctorById_WithValidId_ReturnsDoctorDetail()
    {
        // Arrange
        var adminToken = await GetUserTokenAsync("ClinicAdmin");
        var uniqueSuffix = Guid.NewGuid().ToString("N")[..8];
        var dto = new CreateDoctorDto
        {
            FullName = $"Dr. Detail {uniqueSuffix}",
            Specialty = "Ophthalmology",
            LicenseNumber = $"LIC-OPH-{uniqueSuffix}",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            Email = $"dr.detail_{uniqueSuffix}@sehati.com",
            Password = TestAuthHelper.CreateValidPassword()
        };

        var postReq = CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/doctors", adminToken, dto);
        var postRes = await _client.SendAsync(postReq);
        postRes.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await postRes.Content.ReadFromJsonAsync<DoctorDto>(JsonOptions);

        // Act
        var getReq = CreateAuthorizedRequest(HttpMethod.Get, $"/api/v1/doctors/{created!.DoctorId}", adminToken);
        var getRes = await _client.SendAsync(getReq);

        // Assert
        getRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var detail = await getRes.Content.ReadFromJsonAsync<DoctorDetailDto>(JsonOptions);
        detail.Should().NotBeNull();
        detail!.DoctorId.Should().Be(created.DoctorId);
        detail.Specialty.Should().Be("Ophthalmology");
    }

    [Fact]
    public async Task GetDoctorSchedule_WithDate_ReturnsScheduleSlots()
    {
        // Arrange
        var adminToken = await GetUserTokenAsync("ClinicAdmin");
        var uniqueSuffix = Guid.NewGuid().ToString("N")[..8];
        var dto = new CreateDoctorDto
        {
            FullName = $"Dr. Scheduled {uniqueSuffix}",
            Specialty = "ENT",
            LicenseNumber = $"LIC-ENT-{uniqueSuffix}",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            Email = $"dr.sched_{uniqueSuffix}@sehati.com",
            Password = TestAuthHelper.CreateValidPassword()
        };

        var postReq = CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/doctors", adminToken, dto);
        var postRes = await _client.SendAsync(postReq);
        var created = await postRes.Content.ReadFromJsonAsync<DoctorDto>(JsonOptions);

        var date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)).ToString("yyyy-MM-dd");

        // Act
        var getReq = CreateAuthorizedRequest(HttpMethod.Get, $"/api/v1/doctors/{created!.DoctorId}/schedule?date={date}", adminToken);
        var getRes = await _client.SendAsync(getReq);

        // Assert
        getRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var schedule = await getRes.Content.ReadFromJsonAsync<DoctorScheduleDto>(JsonOptions);
        schedule.Should().NotBeNull();
        schedule!.DoctorId.Should().Be(created.DoctorId);
        schedule.Slots.Should().NotBeNull();
    }
}

