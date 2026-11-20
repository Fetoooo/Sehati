using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Sehati.Application.Common.Exceptions;
using Sehati.Application.DTOs.Visits;
using Sehati.Application.Services;
using Sehati.Application.Validators.Visits;
using Sehati.Domain.Entities;
using Sehati.Domain.Enums;
using Sehati.Infrastructure.Persistence;

namespace Sehati.Tests.Unit.Services;

public class VisitServiceTests
{
    private readonly SehatiDbContext _context;
    private readonly VisitService _visitService;

    public VisitServiceTests()
    {
        var options = new DbContextOptionsBuilder<SehatiDbContext>()
            .UseInMemoryDatabase(databaseName: $"SehatiVisitTestDb_{Guid.NewGuid()}")
            .Options;

        _context = new SehatiDbContext(options);

        // Seed roles
        _context.Roles.AddRange(
            new Role { RoleId = 1, RoleName = "Patient" },
            new Role { RoleId = 2, RoleName = "Doctor" },
            new Role { RoleId = 3, RoleName = "Receptionist" },
            new Role { RoleId = 4, RoleName = "ClinicAdmin" },
            new Role { RoleId = 5, RoleName = "SystemAdmin" }
        );
        _context.SaveChanges();

        _visitService = new VisitService(
            _context,
            new CreateVisitDtoValidator(),
            new UpdateVisitDtoValidator(),
            new CreateDiagnosisDtoValidator(),
            new CreateTreatmentDtoValidator()
        );
    }

    private async Task<(Clinic clinic, Doctor doctor, Patient patient)> SeedBaseEntitiesAsync()
    {
        var clinic = new Clinic
        {
            ClinicName = "Al-Nour Medical Center",
            Specialty = "Internal Medicine",
            Address = "Dokki, Giza",
            Phone = "+201011110001",
            Email = "alnour@test.com",
            WorkingHours = "09:00 - 18:00",
            Status = ClinicStatus.Active
        };
        _context.Clinics.Add(clinic);

        var docUser = new User { Email = "dr.visit@test.com", Phone = "+201011110002", RoleId = 2, PasswordHash = "hash" };
        _context.Users.Add(docUser);
        await _context.SaveChangesAsync();

        var doctor = new Doctor
        {
            UserId = docUser.UserId,
            FullName = "Dr. Hazem Internal",
            Specialty = "Internal Medicine",
            LicenseNumber = "DOC-INT-99",
            Phone = docUser.Phone,
            Email = docUser.Email
        };
        _context.Doctors.Add(doctor);

        var patUser = new User { Email = "patient.visit@test.com", Phone = "+201011110003", RoleId = 1, PasswordHash = "hash" };
        _context.Users.Add(patUser);
        await _context.SaveChangesAsync();

        var patient = new Patient
        {
            UserId = patUser.UserId,
            FullName = "Mariam Samir",
            UnifiedPatientId = "SH-2026-000301",
            DateOfBirth = new DateOnly(1993, 8, 12),
            Gender = Gender.Female
        };
        _context.Patients.Add(patient);
        await _context.SaveChangesAsync();

        return (clinic, doctor, patient);
    }

    [Fact]
    public async Task CreateVisitAsync_WithValidData_CreatesVisit()
    {
        // Arrange
        var (clinic, doctor, patient) = await SeedBaseEntitiesAsync();
        var dto = new CreateVisitDto
        {
            PatientId = patient.PatientId,
            DoctorId = doctor.DoctorId,
            ClinicId = clinic.ClinicId,
            ChiefComplaint = "Severe headache and elevated blood pressure",
            Notes = "Patient has history of migraines",
            Status = VisitStatus.Completed
        };

        // Act
        var result = await _visitService.CreateVisitAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.VisitId.Should().BeGreaterThan(0);
        result.PatientName.Should().Be("Mariam Samir");
        result.DoctorName.Should().Be("Dr. Hazem Internal");
        result.ClinicName.Should().Be("Al-Nour Medical Center");
        result.ChiefComplaint.Should().Be("Severe headache and elevated blood pressure");
        result.Status.Should().Be(VisitStatus.Completed);

        var inDb = await _context.Visits.FindAsync(result.VisitId);
        inDb.Should().NotBeNull();
        inDb!.ChiefComplaint.Should().Be("Severe headache and elevated blood pressure");
    }

    [Fact]
    public async Task AddDiagnosisAsync_AddsDiagnosisToVisit()
    {
        // Arrange
        var (clinic, doctor, patient) = await SeedBaseEntitiesAsync();
        var visit = new Visit
        {
            ClinicId = clinic.ClinicId,
            DoctorId = doctor.DoctorId,
            PatientId = patient.PatientId,
            ChiefComplaint = "Chest tightness",
            Status = VisitStatus.InConsultation
        };
        _context.Visits.Add(visit);
        await _context.SaveChangesAsync();

        var dto = new CreateDiagnosisDto
        {
            DiagnosisName = "Hypertension Stage 1",
            Description = "BP reading 140/90 mmHg recorded at clinic"
        };

        // Act
        var result = await _visitService.AddDiagnosisAsync(visit.VisitId, dto);

        // Assert
        result.Should().NotBeNull();
        result.DiagnosisId.Should().BeGreaterThan(0);
        result.DiagnosisName.Should().Be("Hypertension Stage 1");

        var diagnoses = await _visitService.GetVisitDiagnosesAsync(visit.VisitId);
        diagnoses.Should().HaveCount(1);
        diagnoses.First().DiagnosisName.Should().Be("Hypertension Stage 1");
    }

    [Fact]
    public async Task AddTreatmentAsync_AddsTreatmentPlanToVisit()
    {
        // Arrange
        var (clinic, doctor, patient) = await SeedBaseEntitiesAsync();
        var visit = new Visit
        {
            ClinicId = clinic.ClinicId,
            DoctorId = doctor.DoctorId,
            PatientId = patient.PatientId,
            ChiefComplaint = "Knee pain",
            Status = VisitStatus.InConsultation
        };
        _context.Visits.Add(visit);
        await _context.SaveChangesAsync();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var dto = new CreateTreatmentDto
        {
            TreatmentDescription = "Physical Therapy & Ice Therapy",
            StartDate = today,
            EndDate = today.AddDays(14),
            Instructions = "Apply ice twice daily for 20 minutes"
        };

        // Act
        var result = await _visitService.AddTreatmentAsync(visit.VisitId, dto);

        // Assert
        result.Should().NotBeNull();
        result.TreatmentId.Should().BeGreaterThan(0);
        result.TreatmentDescription.Should().Be("Physical Therapy & Ice Therapy");
        result.Instructions.Should().Be("Apply ice twice daily for 20 minutes");

        var treatments = await _visitService.GetVisitTreatmentsAsync(visit.VisitId);
        treatments.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetVisitByIdAsync_WithValidId_ReturnsVisitDetails()
    {
        // Arrange
        var (clinic, doctor, patient) = await SeedBaseEntitiesAsync();
        var visit = new Visit
        {
            ClinicId = clinic.ClinicId,
            DoctorId = doctor.DoctorId,
            PatientId = patient.PatientId,
            ChiefComplaint = "Chest pain",
            Notes = "ECG recommended",
            Status = VisitStatus.CheckedIn
        };
        _context.Visits.Add(visit);
        await _context.SaveChangesAsync();

        // Act
        var result = await _visitService.GetVisitByIdAsync(visit.VisitId);

        // Assert
        result.Should().NotBeNull();
        result.VisitId.Should().Be(visit.VisitId);
        result.PatientName.Should().Be("Mariam Samir");
        result.DoctorName.Should().Be("Dr. Hazem Internal");
        result.ClinicName.Should().Be("Al-Nour Medical Center");
    }

    [Fact]
    public async Task GetVisitByIdAsync_WithInvalidId_ThrowsNotFoundException()
    {
        // Act
        var act = async () => await _visitService.GetVisitByIdAsync(99999);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task UpdateVisitAsync_WithValidData_UpdatesVisit()
    {
        // Arrange
        var (clinic, doctor, patient) = await SeedBaseEntitiesAsync();
        var visit = new Visit
        {
            ClinicId = clinic.ClinicId,
            DoctorId = doctor.DoctorId,
            PatientId = patient.PatientId,
            ChiefComplaint = "Old complaint",
            Status = VisitStatus.CheckedIn
        };
        _context.Visits.Add(visit);
        await _context.SaveChangesAsync();

        var dto = new UpdateVisitDto
        {
            ChiefComplaint = "Updated headache",
            Notes = "Patient resting well",
            Status = VisitStatus.Completed
        };

        // Act
        var result = await _visitService.UpdateVisitAsync(visit.VisitId, dto);

        // Assert
        result.Should().NotBeNull();
        result.ChiefComplaint.Should().Be("Updated headache");
        result.Notes.Should().Be("Patient resting well");
        result.Status.Should().Be(VisitStatus.Completed);
    }

    [Fact]
    public async Task DeleteDiagnosisAsync_RemovesDiagnosis()
    {
        // Arrange
        var (clinic, doctor, patient) = await SeedBaseEntitiesAsync();
        var visit = new Visit
        {
            ClinicId = clinic.ClinicId,
            DoctorId = doctor.DoctorId,
            PatientId = patient.PatientId,
            ChiefComplaint = "Fever"
        };
        _context.Visits.Add(visit);
        await _context.SaveChangesAsync();

        var diagnosis = new Diagnosis
        {
            VisitId = visit.VisitId,
            DiagnosisName = "Seasonal Flu",
            DiagnosisDate = DateTime.UtcNow
        };
        _context.Diagnoses.Add(diagnosis);
        await _context.SaveChangesAsync();

        // Act
        await _visitService.DeleteDiagnosisAsync(visit.VisitId, diagnosis.DiagnosisId);

        // Assert
        var exists = await _context.Diagnoses.AnyAsync(d => d.DiagnosisId == diagnosis.DiagnosisId);
        exists.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteTreatmentAsync_RemovesTreatment()
    {
        // Arrange
        var (clinic, doctor, patient) = await SeedBaseEntitiesAsync();
        var visit = new Visit
        {
            ClinicId = clinic.ClinicId,
            DoctorId = doctor.DoctorId,
            PatientId = patient.PatientId,
            ChiefComplaint = "Back pain"
        };
        _context.Visits.Add(visit);
        await _context.SaveChangesAsync();

        var treatment = new Treatment
        {
            VisitId = visit.VisitId,
            TreatmentDescription = "Rest",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow)
        };
        _context.Treatments.Add(treatment);
        await _context.SaveChangesAsync();

        // Act
        await _visitService.DeleteTreatmentAsync(visit.VisitId, treatment.TreatmentId);

        // Assert
        var exists = await _context.Treatments.AnyAsync(t => t.TreatmentId == treatment.TreatmentId);
        exists.Should().BeFalse();
    }
}

