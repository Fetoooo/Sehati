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
using Sehati.Application.DTOs.Prescriptions;
using Sehati.Application.DTOs.Visits;
using Sehati.Domain.Enums;
using Sehati.Tests.Common;

namespace Sehati.Tests.Integration.Controllers;

public class PrescriptionsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public PrescriptionsControllerTests(CustomWebApplicationFactory factory)
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

    private async Task<(int visitId, int doctorId, int patientId, string docToken)> SetupDependenciesAsync()
    {
        var adminToken = await GetUserTokenAsync("ClinicAdmin");
        var docToken = await GetUserTokenAsync("Doctor");
        var uniqueSuffix = Guid.NewGuid().ToString("N")[..8];

        // 1. Create Clinic
        var clinicDto = new CreateClinicDto
        {
            ClinicName = $"Rx Clinic {uniqueSuffix}",
            Specialty = "General",
            Address = "Dokki",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            Email = $"rx_clinic_{uniqueSuffix}@sehati.com",
            WorkingHours = "08:00 - 18:00",
            Status = ClinicStatus.Active
        };
        var clinicRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/clinics", adminToken, clinicDto));
        var clinic = await clinicRes.Content.ReadFromJsonAsync<ClinicDto>(JsonOptions);

        // 2. Create Doctor
        var docDto = new CreateDoctorDto
        {
            FullName = $"Dr. Prescriber {uniqueSuffix}",
            Specialty = "Cardiology",
            LicenseNumber = $"LIC-P-{uniqueSuffix}",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            Email = $"dr.rx_{uniqueSuffix}@sehati.com",
            Password = TestAuthHelper.CreateValidPassword(),
            InitialClinicId = clinic!.ClinicId
        };
        var docRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/doctors", adminToken, docDto));
        var doctor = await docRes.Content.ReadFromJsonAsync<DoctorDto>(JsonOptions);

        // 3. Create Patient
        var patientDto = new CreatePatientDto
        {
            FullName = $"Patient Rx {uniqueSuffix}",
            DateOfBirth = new DateOnly(1987, 4, 15),
            Gender = Gender.Male,
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            Email = $"patient_rx_{uniqueSuffix}@sehati.com",
            Address = "Zamalek",
            EmergencyContact = "+201077776666"
        };
        var patientRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/patients", adminToken, patientDto));
        var patient = await patientRes.Content.ReadFromJsonAsync<PatientDto>(JsonOptions);

        // 4. Create Visit
        var visitDto = new CreateVisitDto
        {
            ClinicId = clinic.ClinicId,
            DoctorId = doctor!.DoctorId,
            PatientId = patient!.PatientId,
            ChiefComplaint = "Chronic cough",
            Status = VisitStatus.Completed
        };
        var visitRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/visits", docToken, visitDto));
        var visit = await visitRes.Content.ReadFromJsonAsync<VisitDto>(JsonOptions);

        return (visit!.VisitId, doctor.DoctorId, patient.PatientId, docToken);
    }

    [Fact]
    public async Task CreatePrescription_AsDoctor_ReturnsCreated()
    {
        // Arrange
        var (visitId, doctorId, patientId, docToken) = await SetupDependenciesAsync();
        var dto = new CreatePrescriptionDto
        {
            VisitId = visitId,
            DoctorId = doctorId,
            PatientId = patientId,
            Notes = "Complete full antibiotic course",
            Items = new List<CreatePrescriptionItemDto>
            {
                new()
                {
                    MedicationName = "Amoxicillin",
                    Dosage = "500mg",
                    Frequency = "Three times daily",
                    Duration = "7 days",
                    Instructions = "Take with water after meals"
                }
            }
        };

        // Act
        var request = CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/prescriptions", docToken, dto);
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await response.Content.ReadFromJsonAsync<PrescriptionDetailDto>(JsonOptions);
        created.Should().NotBeNull();
        created!.PrescriptionId.Should().BeGreaterThan(0);
        created.Items.Should().HaveCount(1);
        created.Items[0].MedicationName.Should().Be("Amoxicillin");
    }

    [Fact]
    public async Task GetPrescriptionById_WithValidId_ReturnsDetail()
    {
        // Arrange
        var (visitId, doctorId, patientId, docToken) = await SetupDependenciesAsync();
        var createDto = new CreatePrescriptionDto
        {
            VisitId = visitId,
            DoctorId = doctorId,
            PatientId = patientId,
            Items = new List<CreatePrescriptionItemDto>
            {
                new() { MedicationName = "Paracetamol", Dosage = "1000mg", Frequency = "PRN", Duration = "3 days" }
            }
        };

        var postRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/prescriptions", docToken, createDto));
        var created = await postRes.Content.ReadFromJsonAsync<PrescriptionDetailDto>(JsonOptions);

        // Act
        var getReq = CreateAuthorizedRequest(HttpMethod.Get, $"/api/v1/prescriptions/{created!.PrescriptionId}", docToken);
        var getRes = await _client.SendAsync(getReq);

        // Assert
        getRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var detail = await getRes.Content.ReadFromJsonAsync<PrescriptionDetailDto>(JsonOptions);
        detail.Should().NotBeNull();
        detail!.PrescriptionId.Should().Be(created.PrescriptionId);
        detail.Items.Should().HaveCount(1);
    }
}

