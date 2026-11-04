using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Sehati.Application.DTOs.Prescriptions;
using Sehati.Application.Services;
using Sehati.Application.Validators.Prescriptions;
using Sehati.Domain.Entities;
using Sehati.Domain.Enums;
using Sehati.Infrastructure.Persistence;

namespace Sehati.Tests.Unit.Services;

public class PrescriptionServiceTests
{
    private readonly SehatiDbContext _context;
    private readonly PrescriptionService _prescriptionService;

    public PrescriptionServiceTests()
    {
        var options = new DbContextOptionsBuilder<SehatiDbContext>()
            .UseInMemoryDatabase(databaseName: $"SehatiPrescriptionTestDb_{Guid.NewGuid()}")
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

        _prescriptionService = new PrescriptionService(
            _context,
            new CreatePrescriptionDtoValidator(),
            new CreatePrescriptionItemDtoValidator()
        );
    }

    private async Task<(Visit visit, Doctor doctor, Patient patient)> SeedBaseEntitiesAsync()
    {
        var clinic = new Clinic
        {
            ClinicName = "Al-Hikma Clinic",
            Specialty = "General",
            Address = "Giza",
            Phone = "+201022220001",
            Email = "alhikma@test.com",
            WorkingHours = "09:00 - 17:00",
            Status = ClinicStatus.Active
        };
        _context.Clinics.Add(clinic);

        var docUser = new User { Email = "dr.rx@test.com", Phone = "+201022220002", RoleId = 2, PasswordHash = "hash" };
        _context.Users.Add(docUser);
        await _context.SaveChangesAsync();

        var doctor = new Doctor
        {
            UserId = docUser.UserId,
            FullName = "Dr. Nader Rx",
            Specialty = "Cardiology",
            LicenseNumber = "DOC-RX-12",
            Phone = docUser.Phone,
            Email = docUser.Email
        };
        _context.Doctors.Add(doctor);

        var patUser = new User { Email = "patient.rx@test.com", Phone = "+201022220003", RoleId = 1, PasswordHash = "hash" };
        _context.Users.Add(patUser);
        await _context.SaveChangesAsync();

        var patient = new Patient
        {
            UserId = patUser.UserId,
            FullName = "Youssef Rx",
            UnifiedPatientId = "SH-2026-000302",
            DateOfBirth = new DateOnly(1988, 12, 1),
            Gender = Gender.Male
        };
        _context.Patients.Add(patient);
        await _context.SaveChangesAsync();

        var visit = new Visit
        {
            ClinicId = clinic.ClinicId,
            DoctorId = doctor.DoctorId,
            PatientId = patient.PatientId,
            ChiefComplaint = "High blood pressure",
            Status = VisitStatus.Completed
        };
        _context.Visits.Add(visit);
        await _context.SaveChangesAsync();

        return (visit, doctor, patient);
    }

    [Fact]
    public async Task CreatePrescriptionAsync_WithItems_CreatesDigitalPrescription()
    {
        // Arrange
        var (visit, doctor, patient) = await SeedBaseEntitiesAsync();
        var dto = new CreatePrescriptionDto
        {
            VisitId = visit.VisitId,
            DoctorId = doctor.DoctorId,
            PatientId = patient.PatientId,
            Notes = "Take after meals",
            Items = new List<CreatePrescriptionItemDto>
            {
                new()
                {
                    MedicationName = "Amlodipine",
                    Dosage = "5mg",
                    Frequency = "Once daily in morning",
                    Duration = "30 days",
                    Instructions = "Monitor blood pressure weekly"
                },
                new()
                {
                    MedicationName = "Aspirin",
                    Dosage = "81mg",
                    Frequency = "Once daily after lunch",
                    Duration = "30 days"
                }
            }
        };

        // Act
        var result = await _prescriptionService.CreatePrescriptionAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.PrescriptionId.Should().BeGreaterThan(0);
        result.DoctorName.Should().Be("Dr. Nader Rx");
        result.PatientName.Should().Be("Youssef Rx");
        result.ItemsCount.Should().Be(2);
        result.Items.Should().HaveCount(2);
        result.Items.First().MedicationName.Should().Be("Amlodipine");

        var inDb = await _context.Prescriptions
            .Include(p => p.PrescriptionItems)
            .FirstOrDefaultAsync(p => p.PrescriptionId == result.PrescriptionId);
        inDb.Should().NotBeNull();
        inDb!.PrescriptionItems.Should().HaveCount(2);
    }

    [Fact]
    public async Task AddPrescriptionItemAsync_AddsItemToPrescription()
    {
        // Arrange
        var (visit, doctor, patient) = await SeedBaseEntitiesAsync();
        var prescription = new Prescription
        {
            VisitId = visit.VisitId,
            DoctorId = doctor.DoctorId,
            PatientId = patient.PatientId,
            PrescriptionDate = DateTime.UtcNow
        };
        _context.Prescriptions.Add(prescription);
        await _context.SaveChangesAsync();

        var itemDto = new CreatePrescriptionItemDto
        {
            MedicationName = "Concor",
            Dosage = "2.5mg",
            Frequency = "Once daily",
            Duration = "14 days",
            Instructions = "Do not discontinue abruptly"
        };

        // Act
        var result = await _prescriptionService.AddPrescriptionItemAsync(prescription.PrescriptionId, itemDto);

        // Assert
        result.Should().NotBeNull();
        result.MedicationName.Should().Be("Concor");
        result.Dosage.Should().Be("2.5mg");

        var detail = await _prescriptionService.GetPrescriptionByIdAsync(prescription.PrescriptionId);
        detail.ItemsCount.Should().Be(1);
    }
}

