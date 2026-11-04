using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Appointments;
using Sehati.Application.DTOs.Auth;
using Sehati.Application.DTOs.Clinics;
using Sehati.Application.DTOs.Doctors;
using Sehati.Application.DTOs.Patients;
using Sehati.Domain.Enums;
using Sehati.Tests.Common;

namespace Sehati.Tests.Integration.Controllers;

public class AppointmentsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public AppointmentsControllerTests(CustomWebApplicationFactory factory)
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

    private async Task<(int clinicId, int doctorId, int patientId, string adminToken)> SetupDependenciesAsync()
    {
        var adminToken = await GetUserTokenAsync("ClinicAdmin");
        var uniqueSuffix = Guid.NewGuid().ToString("N")[..8];

        // 1. Create Clinic
        var clinicDto = new CreateClinicDto
        {
            ClinicName = $"Test Clinic {uniqueSuffix}",
            Specialty = "General Care",
            Address = "Road 9, Maadi",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            Email = $"clinic_{uniqueSuffix}@sehati.com",
            WorkingHours = "09:00 - 18:00",
            Status = ClinicStatus.Active
        };
        var clinicRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/clinics", adminToken, clinicDto));
        var clinic = await clinicRes.Content.ReadFromJsonAsync<ClinicDto>(JsonOptions);

        // 2. Create Doctor
        var docDto = new CreateDoctorDto
        {
            FullName = $"Dr. Appointment {uniqueSuffix}",
            Specialty = "Cardiology",
            LicenseNumber = $"LIC-AP-{uniqueSuffix}",
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            Email = $"dr.ap_{uniqueSuffix}@sehati.com",
            Password = TestAuthHelper.CreateValidPassword(),
            InitialClinicId = clinic!.ClinicId
        };
        var docRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/doctors", adminToken, docDto));
        var doctor = await docRes.Content.ReadFromJsonAsync<DoctorDto>(JsonOptions);

        // 3. Create Patient
        var patientDto = new CreatePatientDto
        {
            FullName = $"Patient {uniqueSuffix}",
            DateOfBirth = new DateOnly(1991, 7, 24),
            Gender = Gender.Female,
            Phone = "+2010" + Random.Shared.Next(10000000, 99999999),
            Email = $"patient_{uniqueSuffix}@sehati.com",
            Address = "Nasr City",
            EmergencyContact = "+201099998888"
        };
        var patientRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/patients", adminToken, patientDto));
        var patient = await patientRes.Content.ReadFromJsonAsync<PatientDto>(JsonOptions);

        return (clinic.ClinicId, doctor!.DoctorId, patient!.PatientId, adminToken);
    }

    [Fact]
    public async Task CreateAppointment_WithValidData_ReturnsCreated()
    {
        // Arrange
        var (clinicId, doctorId, patientId, adminToken) = await SetupDependenciesAsync();
        var tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2));

        var dto = new CreateAppointmentDto
        {
            ClinicId = clinicId,
            DoctorId = doctorId,
            PatientId = patientId,
            AppointmentDate = tomorrow,
            StartTime = new TimeOnly(10, 0),
            EndTime = new TimeOnly(10, 30),
            Notes = "First time consult"
        };

        // Act
        var request = CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/appointments", adminToken, dto);
        var response = await _client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await response.Content.ReadFromJsonAsync<AppointmentDto>(JsonOptions);
        created.Should().NotBeNull();
        created!.AppointmentId.Should().BeGreaterThan(0);
        created.ClinicId.Should().Be(clinicId);
        created.DoctorId.Should().Be(doctorId);
        created.PatientId.Should().Be(patientId);
        created.Status.Should().Be(AppointmentStatus.Pending);
    }

    [Fact]
    public async Task UpdateAppointmentStatus_AsReceptionist_ReturnsUpdated()
    {
        // Arrange
        var (clinicId, doctorId, patientId, adminToken) = await SetupDependenciesAsync();
        var recepToken = await GetUserTokenAsync("Receptionist");
        var tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(3));

        var createDto = new CreateAppointmentDto
        {
            ClinicId = clinicId,
            DoctorId = doctorId,
            PatientId = patientId,
            AppointmentDate = tomorrow,
            StartTime = new TimeOnly(14, 0),
            EndTime = new TimeOnly(14, 30)
        };
        var postRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/appointments", adminToken, createDto));
        var created = await postRes.Content.ReadFromJsonAsync<AppointmentDto>(JsonOptions);

        var updateDto = new UpdateAppointmentStatusDto
        {
            Status = AppointmentStatus.Confirmed,
            Notes = "Confirmed via SMS"
        };

        // Act
        var patchReq = CreateAuthorizedRequest(HttpMethod.Patch, $"/api/v1/appointments/{created!.AppointmentId}/status", recepToken, updateDto);
        var patchRes = await _client.SendAsync(patchReq);

        // Assert
        patchRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await patchRes.Content.ReadFromJsonAsync<AppointmentDto>(JsonOptions);
        updated.Should().NotBeNull();
        updated!.Status.Should().Be(AppointmentStatus.Confirmed);
        updated.Notes.Should().Be("Confirmed via SMS");
    }

    [Fact]
    public async Task RescheduleAppointment_WithValidSlot_ReturnsRescheduled()
    {
        // Arrange
        var (clinicId, doctorId, patientId, adminToken) = await SetupDependenciesAsync();
        var tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(4));
        var nextWeek = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7));

        var createDto = new CreateAppointmentDto
        {
            ClinicId = clinicId,
            DoctorId = doctorId,
            PatientId = patientId,
            AppointmentDate = tomorrow,
            StartTime = new TimeOnly(11, 0),
            EndTime = new TimeOnly(11, 30)
        };
        var postRes = await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/appointments", adminToken, createDto));
        var created = await postRes.Content.ReadFromJsonAsync<AppointmentDto>(JsonOptions);

        var rescheduleDto = new RescheduleAppointmentDto
        {
            AppointmentDate = nextWeek,
            StartTime = new TimeOnly(16, 0),
            EndTime = new TimeOnly(16, 30),
            Notes = "Rescheduled to next week"
        };

        // Act
        var putReq = CreateAuthorizedRequest(HttpMethod.Put, $"/api/v1/appointments/{created!.AppointmentId}/reschedule", adminToken, rescheduleDto);
        var putRes = await _client.SendAsync(putReq);

        // Assert
        putRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var rescheduled = await putRes.Content.ReadFromJsonAsync<AppointmentDto>(JsonOptions);
        rescheduled.Should().NotBeNull();
        rescheduled!.AppointmentDate.Should().Be(nextWeek);
        rescheduled.StartTime.Should().Be(new TimeOnly(16, 0));
    }

    [Fact]
    public async Task GetDailyQueue_AsReceptionist_ReturnsQueueItems()
    {
        // Arrange
        var (clinicId, doctorId, patientId, adminToken) = await SetupDependenciesAsync();
        var recepToken = await GetUserTokenAsync("Receptionist");
        var targetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(5));

        var createDto = new CreateAppointmentDto
        {
            ClinicId = clinicId,
            DoctorId = doctorId,
            PatientId = patientId,
            AppointmentDate = targetDate,
            StartTime = new TimeOnly(9, 30),
            EndTime = new TimeOnly(10, 0)
        };
        await _client.SendAsync(CreateAuthorizedRequest(HttpMethod.Post, "/api/v1/appointments", adminToken, createDto));

        // Act
        var dateStr = targetDate.ToString("yyyy-MM-dd");
        var queueReq = CreateAuthorizedRequest(HttpMethod.Get, $"/api/v1/appointments/queue?clinicId={clinicId}&date={dateStr}", recepToken);
        var queueRes = await _client.SendAsync(queueReq);

        // Assert
        queueRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var queue = await queueRes.Content.ReadFromJsonAsync<List<QueueItemDto>>(JsonOptions);
        queue.Should().NotBeNull();
        queue!.Should().Contain(q => q.AppointmentDate == targetDate);
    }
}

