using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Auth;
using Sehati.Application.DTOs.Patients;
using Sehati.Domain.Enums;

namespace Sehati.Tests.Integration.Controllers;

public class PatientsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public PatientsControllerTests(CustomWebApplicationFactory factory)
    {
        factory.EnsureDatabaseSeeded();
        _client = factory.CreateClient();
    }

    private async Task<string> GetUserTokenAsync(string roleName)
    {
        var registerDto = new RegisterDto
        {
            Email = $"{roleName.ToLower()}_{Guid.NewGuid():N}@sehati.com",
            Password = "SecurePassword@2026",
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
    public async Task CreatePatient_AsReceptionist_ReturnsCreated_WithUnifiedPatientId()
    {
        // Arrange
        var token = await GetUserTokenAsync("Receptionist");
        var dto = new CreatePatientDto
        {
            FullName = "Farida Mansour",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            Email = $"farida_{Guid.NewGuid():N}@example.com",
            Gender = Gender.Female,
            DateOfBirth = new DateOnly(1995, 4, 12),
            BloodType = BloodType.BPositive,
            Address = "Dokki, Giza",
            EmergencyContact = "Mansour Ahmed (+201022334455)",
            EmergencyNotes = "No known drug allergies."
        };

        var request = CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/patients", token, dto);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await response.Content.ReadFromJsonAsync<PatientDto>(JsonOptions);
        created.Should().NotBeNull();
        created!.PatientId.Should().BeGreaterThan(0);
        created.FullName.Should().Be(dto.FullName);
        created.UnifiedPatientId.Should().StartWith("SH-");
        created.EmergencyContact.Should().Be("Mansour Ahmed (+201022334455)");
        response.Headers.Location.Should().NotBeNull();
    }

    [Fact]
    public async Task CreatePatient_AsPatient_ReturnsForbidden()
    {
        // Arrange
        var token = await GetUserTokenAsync("Patient");
        var dto = new CreatePatientDto
        {
            FullName = "Unauthorized Attempt",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            Gender = Gender.Male,
            DateOfBirth = new DateOnly(1990, 1, 1)
        };

        var request = CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/patients", token, dto);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task CreatePatient_WithoutAuth_ReturnsUnauthorized()
    {
        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/patients", new CreatePatientDto());

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetPatients_AsDoctor_ReturnsPaginatedList()
    {
        // Arrange
        var receptionistToken = await GetUserTokenAsync("Receptionist");
        var doctorToken = await GetUserTokenAsync("Doctor");

        // Seed a patient
        var createDto = new CreatePatientDto
        {
            FullName = "List Test Patient " + Guid.NewGuid().ToString("N")[..4],
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            Gender = Gender.Male,
            DateOfBirth = new DateOnly(1991, 5, 5)
        };
        await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/patients", receptionistToken, createDto));

        var request = CreateAuthorizedRequest(HttpMethod.Get, "/api/v1/patients?page=1&pageSize=5", doctorToken);

        // Act
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var list = await response.Content.ReadFromJsonAsync<PaginatedList<PatientDto>>(JsonOptions);
        list.Should().NotBeNull();
        list!.Items.Should().NotBeEmpty();
        list.TotalCount.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task GetPatientById_AndUnifiedId_ReturnsDetailedProfile()
    {
        // Arrange
        var receptionistToken = await GetUserTokenAsync("Receptionist");
        var doctorToken = await GetUserTokenAsync("Doctor");

        var createDto = new CreatePatientDto
        {
            FullName = "Detailed Profile Patient",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            Gender = Gender.Female,
            DateOfBirth = new DateOnly(1993, 7, 10),
            BloodType = BloodType.OPositive
        };
        var createRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/patients", receptionistToken, createDto));
        var created = await createRes.Content.ReadFromJsonAsync<PatientDto>(JsonOptions);

        // Act 1: By ID
        var getByIdReq = CreateAuthorizedRequest(HttpMethod.Get, $"/api/v1/patients/{created!.PatientId}", doctorToken);
        var res1 = await _client.SendAsync(getByIdReq);

        // Assert 1
        res1.StatusCode.Should().Be(HttpStatusCode.OK);
        var detail1 = await res1.Content.ReadFromJsonAsync<PatientDetailDto>(JsonOptions);
        detail1.Should().NotBeNull();
        detail1!.FullName.Should().Be(createDto.FullName);
        detail1.UnifiedPatientId.Should().Be(created.UnifiedPatientId);
        detail1.BloodType.Should().Be(BloodType.OPositive);

        // Act 2: By Unified ID
        var getByUnifiedReq = CreateAuthorizedRequest(HttpMethod.Get, $"/api/v1/patients/unified/{created.UnifiedPatientId}", doctorToken);
        var res2 = await _client.SendAsync(getByUnifiedReq);

        // Assert 2
        res2.StatusCode.Should().Be(HttpStatusCode.OK);
        var detail2 = await res2.Content.ReadFromJsonAsync<PatientDetailDto>(JsonOptions);
        detail2!.PatientId.Should().Be(created.PatientId);
    }

    [Fact]
    public async Task SearchPatients_ReturnsMatchingResults()
    {
        // Arrange
        var receptionistToken = await GetUserTokenAsync("Receptionist");
        var doctorToken = await GetUserTokenAsync("Doctor");

        var uniqueName = "SearchTest_" + Guid.NewGuid().ToString("N")[..8];
        var uniquePhone = "+2010" + Random.Shared.Next(10000000, 99999999);

        var createDto = new CreatePatientDto
        {
            FullName = uniqueName,
            Phone = uniquePhone,
            Gender = Gender.Male,
            DateOfBirth = new DateOnly(1989, 9, 19)
        };
        await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/patients", receptionistToken, createDto));

        // Act
        var request = CreateAuthorizedRequest(HttpMethod.Get, $"/api/v1/patients/search?q={uniqueName}", doctorToken);
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var results = await response.Content.ReadFromJsonAsync<List<PatientDto>>(JsonOptions);
        results.Should().NotBeNull();
        results.Should().ContainSingle(p => p.FullName == uniqueName);
    }

    [Fact]
    public async Task UpdatePatient_UpdatesDemographicInfoSuccessfully()
    {
        // Arrange
        var receptionistToken = await GetUserTokenAsync("Receptionist");
        var doctorToken = await GetUserTokenAsync("Doctor");

        var createDto = new CreatePatientDto
        {
            FullName = "Original Name",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            Gender = Gender.Male,
            DateOfBirth = new DateOnly(1990, 1, 1)
        };
        var createRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/patients", receptionistToken, createDto));
        var created = await createRes.Content.ReadFromJsonAsync<PatientDto>(JsonOptions);

        var updateDto = new UpdatePatientDto
        {
            FullName = "Modified Patient Name",
            DateOfBirth = new DateOnly(1990, 1, 1),
            Gender = Gender.Male,
            Address = "New District, Cairo",
            EmergencyContact = "Updated Contact (+201000000000)"
        };

        // Act
        var updateReq = CreateAuthorizedRequest(HttpMethod.Put, $"/api/v1/patients/{created!.PatientId}", doctorToken, updateDto);
        var response = await _client.SendAsync(updateReq);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await response.Content.ReadFromJsonAsync<PatientDto>(JsonOptions);
        updated!.FullName.Should().Be("Modified Patient Name");
        updated.Address.Should().Be("New District, Cairo");
        updated.EmergencyContact.Should().Be("Updated Contact (+201000000000)");
    }

    [Fact]
    public async Task SubResources_AllergiesMedicationsTestsScans_CrudEndToEnd()
    {
        // Arrange
        var receptionistToken = await GetUserTokenAsync("Receptionist");
        var doctorToken = await GetUserTokenAsync("Doctor");

        var createDto = new CreatePatientDto
        {
            FullName = "SubResource Test Patient",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            Gender = Gender.Male,
            DateOfBirth = new DateOnly(1994, 3, 21)
        };
        var createRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/patients", receptionistToken, createDto));
        var patient = await createRes.Content.ReadFromJsonAsync<PatientDto>(JsonOptions);
        var pid = patient!.PatientId;

        // 1. Allergies
        var addAllergyReq = CreateAuthorizedRequest(HttpMethod.Post, $"/api/v1/patients/{pid}/allergies", doctorToken, new CreateAllergyDto
        {
            AllergyName = "Sulfonamides",
            Reaction = "Urticaria"
        });
        var addAllergyRes = await _client.SendAsync(addAllergyReq);
        addAllergyRes.StatusCode.Should().Be(HttpStatusCode.Created);
        var allergy = await addAllergyRes.Content.ReadFromJsonAsync<AllergyDto>(JsonOptions);

        var getAllergiesRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Get, $"/api/v1/patients/{pid}/allergies", doctorToken));
        getAllergiesRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var allergies = await getAllergiesRes.Content.ReadFromJsonAsync<List<AllergyDto>>(JsonOptions);
        allergies.Should().Contain(a => a.AllergyName == "Sulfonamides");

        var delAllergyRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Delete, $"/api/v1/patients/{pid}/allergies/{allergy!.AllergyId}", doctorToken));
        delAllergyRes.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // 2. Medications
        var addMedReq = CreateAuthorizedRequest(HttpMethod.Post, $"/api/v1/patients/{pid}/medications", doctorToken, new CreateMedicationDto
        {
            MedicationName = "Amoxicillin",
            Dosage = "500mg",
            Frequency = "3 times daily",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow)
        });
        var addMedRes = await _client.SendAsync(addMedReq);
        addMedRes.StatusCode.Should().Be(HttpStatusCode.Created);
        var med = await addMedRes.Content.ReadFromJsonAsync<MedicationDto>(JsonOptions);

        var getMedsRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Get, $"/api/v1/patients/{pid}/medications", doctorToken));
        getMedsRes.StatusCode.Should().Be(HttpStatusCode.OK);

        var delMedRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Delete, $"/api/v1/patients/{pid}/medications/{med!.MedicationId}", doctorToken));
        delMedRes.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // 3. Tests
        var addTestReq = CreateAuthorizedRequest(HttpMethod.Post, $"/api/v1/patients/{pid}/tests", doctorToken, new CreateTestDto
        {
            TestName = "Fasting Blood Sugar",
            TestDate = DateOnly.FromDateTime(DateTime.UtcNow),
            Result = "95 mg/dL"
        });
        var addTestRes = await _client.SendAsync(addTestReq);
        addTestRes.StatusCode.Should().Be(HttpStatusCode.Created);
        var test = await addTestRes.Content.ReadFromJsonAsync<TestDto>(JsonOptions);

        var getTestsRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Get, $"/api/v1/patients/{pid}/tests", doctorToken));
        getTestsRes.StatusCode.Should().Be(HttpStatusCode.OK);

        var delTestRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Delete, $"/api/v1/patients/{pid}/tests/{test!.TestId}", doctorToken));
        delTestRes.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // 4. Scans
        var addScanReq = CreateAuthorizedRequest(HttpMethod.Post, $"/api/v1/patients/{pid}/scans", doctorToken, new CreateScanDto
        {
            ScanType = "Abdominal Ultrasound",
            ScanDate = DateOnly.FromDateTime(DateTime.UtcNow),
            Result = "Normal liver and gallbladder"
        });
        var addScanRes = await _client.SendAsync(addScanReq);
        addScanRes.StatusCode.Should().Be(HttpStatusCode.Created);
        var scan = await addScanRes.Content.ReadFromJsonAsync<ScanDto>(JsonOptions);

        var getScansRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Get, $"/api/v1/patients/{pid}/scans", doctorToken));
        getScansRes.StatusCode.Should().Be(HttpStatusCode.OK);

        var delScanRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Delete, $"/api/v1/patients/{pid}/scans/{scan!.ScanId}", doctorToken));
        delScanRes.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }
}
