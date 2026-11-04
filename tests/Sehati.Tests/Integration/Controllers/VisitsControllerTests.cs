using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Auth;
using Sehati.Application.DTOs.Clinics;
using Sehati.Application.DTOs.Doctors;
using Sehati.Application.DTOs.Patients;
using Sehati.Application.DTOs.Visits;
using Sehati.Domain.Enums;
using Sehati.Tests.Common;

namespace Sehati.Tests.Integration.Controllers;

public class VisitsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public VisitsControllerTests(CustomWebApplicationFactory factory)
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
            Specialty = roleName == "Doctor" ? "Internal Medicine" : null,
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

    private async Task<(int clinicId, int doctorId, int patientId, string docToken)> SetupDependenciesAsync()
    {
        var adminToken = await GetUserTokenAsync("ClinicAdmin");
        var docToken = await GetUserTokenAsync("Doctor");
        var uniqueSuffix = Guid.NewGuid().ToString("N")[..8];

        // 1. Create Clinic
        var clinicDto = new CreateClinicDto
        {
            ClinicName = $"Visit Center {uniqueSuffix}",
            Specialty = "Internal Medicine",
            Address = "Nasr City",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            Email = $"visit_clinic_{uniqueSuffix}@sehati.com",
            WorkingHours = "08:00 - 18:00",
            Status = ClinicStatus.Active
        };
        var clinicRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/clinics", adminToken, clinicDto));
        var clinic = await clinicRes.Content.ReadFromJsonAsync<ClinicDto>(JsonOptions);

        // 2. Create Doctor
        var docDto = new CreateDoctorDto
        {
            FullName = $"Dr. Visit {uniqueSuffix}",
            Specialty = "Internal Medicine",
            LicenseNumber = $"LIC-V-{uniqueSuffix}",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            Email = $"dr.visit_{uniqueSuffix}@sehati.com",
            Password = TestAuthHelper.CreateValidPassword(),
            InitialClinicId = clinic!.ClinicId
        };
        var docRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/doctors", adminToken, docDto));
        var doctor = await docRes.Content.ReadFromJsonAsync<DoctorDto>(JsonOptions);

        // 3. Create Patient
        var patientDto = new CreatePatientDto
        {
            FullName = $"Patient Visit {uniqueSuffix}",
            DateOfBirth = new DateOnly(1989, 5, 20),
            Gender = Gender.Male,
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            Email = $"patient_visit_{uniqueSuffix}@sehati.com",
            Address = "Giza",
            EmergencyContact = "+201088887777"
        };
        var patientRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/patients", adminToken, patientDto));
        var patient = await patientRes.Content.ReadFromJsonAsync<PatientDto>(JsonOptions);

        return (clinic.ClinicId, doctor!.DoctorId, patient!.PatientId, docToken);
    }

    [Fact]
    public async Task CreateVisit_AsDoctor_ReturnsCreated()
    {
        // Arrange
        var (clinicId, doctorId, patientId, docToken) = await SetupDependenciesAsync();
        var dto = new CreateVisitDto
        {
            ClinicId = clinicId,
            DoctorId = doctorId,
            PatientId = patientId,
            ChiefComplaint = "Abdominal cramps and fever",
            Notes = "Suspected acute gastroenteritis",
            Status = VisitStatus.Completed
        };

        // Act
        var request = CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/visits", docToken, dto);
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await response.Content.ReadFromJsonAsync<VisitDto>(JsonOptions);
        created.Should().NotBeNull();
        created!.VisitId.Should().BeGreaterThan(0);
        created.ChiefComplaint.Should().Be(dto.ChiefComplaint);
    }

    [Fact]
    public async Task AddDiagnosis_AsDoctor_ReturnsCreated()
    {
        // Arrange
        var (clinicId, doctorId, patientId, docToken) = await SetupDependenciesAsync();
        var visitDto = new CreateVisitDto
        {
            ClinicId = clinicId,
            DoctorId = doctorId,
            PatientId = patientId,
            ChiefComplaint = "Sore throat",
            Status = VisitStatus.InConsultation
        };
        var postRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/visits", docToken, visitDto));
        var visit = await postRes.Content.ReadFromJsonAsync<VisitDto>(JsonOptions);

        var diagnosisDto = new CreateDiagnosisDto
        {
            DiagnosisName = "Streptococcal Pharyngitis",
            Description = "Rapid strep test positive"
        };

        // Act
        var req = CreateAuthorizedRequest(HttpMethod.Post, $"/api/v1/visits/{visit!.VisitId}/diagnoses", docToken, diagnosisDto);
        var res = await _client.SendAsync(req);

        // Assert
        res.StatusCode.Should().Be(HttpStatusCode.Created);
        var diagnosis = await res.Content.ReadFromJsonAsync<DiagnosisDto>(JsonOptions);
        diagnosis.Should().NotBeNull();
        diagnosis!.DiagnosisName.Should().Be("Streptococcal Pharyngitis");
    }

    [Fact]
    public async Task GetVisits_Authorized_ReturnsPaginatedList()
    {
        // Arrange
        var docToken = await GetUserTokenAsync("Doctor");

        // Act
        var request = CreateAuthorizedRequest(HttpMethod.Get, "/api/v1/visits?page=1&pageSize=10", docToken);
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var list = await response.Content.ReadFromJsonAsync<PaginatedList<VisitDto>>(JsonOptions);
        list.Should().NotBeNull();
    }
}

