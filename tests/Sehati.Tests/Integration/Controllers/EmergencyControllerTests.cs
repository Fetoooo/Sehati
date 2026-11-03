using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Sehati.Application.DTOs.Auth;
using Sehati.Application.DTOs.Patients;
using Sehati.Domain.Enums;

namespace Sehati.Tests.Integration.Controllers;

public class EmergencyControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public EmergencyControllerTests(CustomWebApplicationFactory factory)
    {
        factory.EnsureDatabaseSeeded();
        _client = factory.CreateClient();
    }

    private async Task<(TokenResponseDto Tokens, string UnifiedId, int PatientId)> RegisterPatientAsync()
    {
        var registerDto = new RegisterDto
        {
            Email = $"emergency_test_{Guid.NewGuid():N}@sehati.com",
            Password = "SecurePassword@2026",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            FullName = "Emergency Test Patient",
            RoleName = "Patient",
            DateOfBirth = new DateOnly(1988, 12, 1),
            Gender = Gender.Male
        };

        var response = await _client.PostAsJsonAsync("/api/v1/auth/register", registerDto);
        response.EnsureSuccessStatusCode();

        var tokens = await response.Content.ReadFromJsonAsync<TokenResponseDto>(JsonOptions);
        var unifiedId = tokens!.User.UnifiedPatientId!;

        // Get patient ID via unified patient lookup
        var patientReq = new HttpRequestMessage(HttpMethod.Get, $"/api/v1/patients/unified/{unifiedId}");
        patientReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokens.AccessToken);
        var patientRes = await _client.SendAsync(patientReq);
        patientRes.EnsureSuccessStatusCode();

        var patient = await patientRes.Content.ReadFromJsonAsync<PatientDetailDto>(JsonOptions);
        return (tokens, unifiedId, patient!.PatientId);
    }

    [Fact]
    public async Task GetEmergencyProfileByUnifiedId_AnonymousAccess_ReturnsOk()
    {
        // Arrange
        var (_, unifiedId, _) = await RegisterPatientAsync();

        // Act - Request without any Authorization header
        var response = await _client.GetAsync($"/api/v1/emergency/{unifiedId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var profile = await response.Content.ReadFromJsonAsync<EmergencyProfileDto>(JsonOptions);
        profile.Should().NotBeNull();
        profile!.UnifiedPatientId.Should().Be(unifiedId);
        profile.PatientName.Should().Be("Emergency Test Patient");
    }

    [Fact]
    public async Task GetEmergencyProfileByUnifiedId_WhenNotFound_ReturnsNotFound()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/emergency/SH-9999-000000");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetEmergencyProfileByPatientId_WithoutAuth_ReturnsUnauthorized()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/emergency/patient/1");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetEmergencyProfileByPatientId_WithAuth_ReturnsOk()
    {
        // Arrange
        var (tokens, _, patientId) = await RegisterPatientAsync();

        var request = new HttpRequestMessage(HttpMethod.Get, $"/api/v1/emergency/patient/{patientId}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokens.AccessToken);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var profile = await response.Content.ReadFromJsonAsync<EmergencyProfileDto>(JsonOptions);
        profile.Should().NotBeNull();
        profile!.PatientId.Should().Be(patientId);
    }

    [Fact]
    public async Task UpdateEmergencyProfile_WithAuth_UpdatesProfileSuccessfully()
    {
        // Arrange
        var (tokens, unifiedId, patientId) = await RegisterPatientAsync();

        var updateDto = new UpdateEmergencyProfileDto
        {
            BloodType = BloodType.OPositive,
            EmergencyContactName = "Brother - Youssef",
            EmergencyContactPhone = "+201011223344",
            EmergencyNotes = "Asthmatic, carries Ventolin inhaler."
        };

        var request = new HttpRequestMessage(HttpMethod.Put, $"/api/v1/emergency/patient/{patientId}")
        {
            Content = JsonContent.Create(updateDto)
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokens.AccessToken);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await response.Content.ReadFromJsonAsync<EmergencyProfileDto>(JsonOptions);
        updated.Should().NotBeNull();
        updated!.BloodType.Should().Be(BloodType.OPositive);
        updated.EmergencyContactName.Should().Be("Brother - Youssef");
        updated.EmergencyNotes.Should().Be("Asthmatic, carries Ventolin inhaler.");

        // Verify publicly via anonymous endpoint
        var anonResponse = await _client.GetAsync($"/api/v1/emergency/{unifiedId}");
        anonResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var anonProfile = await anonResponse.Content.ReadFromJsonAsync<EmergencyProfileDto>(JsonOptions);
        anonProfile!.BloodType.Should().Be(BloodType.OPositive);
        anonProfile.EmergencyNotes.Should().Be("Asthmatic, carries Ventolin inhaler.");
    }
}
