using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Sehati.Application.DTOs.Consent;
using Sehati.Application.Services;
using Sehati.Application.Validators.Consent;
using Sehati.Domain.Entities;
using Sehati.Domain.Enums;
using Sehati.Infrastructure.Persistence;

namespace Sehati.Tests.Unit.Services;

public class ConsentServiceTests
{
    private readonly SehatiDbContext _context;
    private readonly ConsentService _consentService;

    public ConsentServiceTests()
    {
        var options = new DbContextOptionsBuilder<SehatiDbContext>()
            .UseInMemoryDatabase(databaseName: $"SehatiConsentTestDb_{Guid.NewGuid()}")
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

        _consentService = new ConsentService(_context, new GrantAccessPermissionDtoValidator());
    }

    private async Task<(Patient patient, Doctor doctor, Clinic clinic)> SeedBaseEntitiesAsync()
    {
        var clinic = new Clinic
        {
            ClinicName = "Al-Salam Clinic",
            Specialty = "General Care",
            Address = "Nasr City",
            Phone = "+201033330001",
            Email = "alsalam@test.com",
            WorkingHours = "09:00 - 18:00",
            Status = ClinicStatus.Active
        };
        _context.Clinics.Add(clinic);

        var docUser = new User { Email = "dr.consent@test.com", Phone = "+201033330002", RoleId = 2, PasswordHash = "hash" };
        _context.Users.Add(docUser);
        await _context.SaveChangesAsync();

        var doctor = new Doctor
        {
            UserId = docUser.UserId,
            FullName = "Dr. Walid Consent",
            Specialty = "Dermatology",
            LicenseNumber = "DOC-CON-1",
            Phone = docUser.Phone,
            Email = docUser.Email
        };
        _context.Doctors.Add(doctor);

        var patUser = new User { Email = "patient.consent@test.com", Phone = "+201033330003", RoleId = 1, PasswordHash = "hash" };
        _context.Users.Add(patUser);
        await _context.SaveChangesAsync();

        var patient = new Patient
        {
            UserId = patUser.UserId,
            FullName = "Amr Consent",
            UnifiedPatientId = "SH-2026-000303",
            DateOfBirth = new DateOnly(1995, 4, 18),
            Gender = Gender.Male
        };
        _context.Patients.Add(patient);
        await _context.SaveChangesAsync();

        return (patient, doctor, clinic);
    }

    [Fact]
    public async Task GrantAccessAsync_GrantsActivePermission()
    {
        // Arrange
        var (patient, doctor, clinic) = await SeedBaseEntitiesAsync();
        var expires = DateTime.UtcNow.AddMonths(1);
        var dto = new GrantAccessPermissionDto
        {
            DoctorId = doctor.DoctorId,
            AccessType = AccessType.ViewAndAddRecords,
            ExpiresAt = expires
        };

        // Act
        var result = await _consentService.GrantAccessAsync(patient.PatientId, dto);

        // Assert
        result.Should().NotBeNull();
        result.AccessPermissionId.Should().BeGreaterThan(0);
        result.PatientName.Should().Be("Amr Consent");
        result.DoctorName.Should().Be("Dr. Walid Consent");
        result.AccessType.Should().Be(AccessType.ViewAndAddRecords);
        result.Status.Should().Be(AccessPermissionStatus.Active);
    }

    [Fact]
    public async Task CheckAccessAsync_WhenActivePermissionExists_ReturnsHasAccessTrue()
    {
        // Arrange
        var (patient, doctor, clinic) = await SeedBaseEntitiesAsync();
        _context.AccessPermissions.Add(new AccessPermission
        {
            PatientId = patient.PatientId,
            DoctorId = doctor.DoctorId,
            AccessType = AccessType.ViewOnly,
            GrantedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            Status = AccessPermissionStatus.Active
        });
        await _context.SaveChangesAsync();

        // Act
        var result = await _consentService.CheckAccessAsync(patient.PatientId, doctor.DoctorId, null);

        // Assert
        result.HasAccess.Should().BeTrue();
        result.AccessType.Should().Be(AccessType.ViewOnly);
    }

    [Fact]
    public async Task RevokeAccessAsync_SetsStatusToRevoked()
    {
        // Arrange
        var (patient, doctor, clinic) = await SeedBaseEntitiesAsync();
        var permission = new AccessPermission
        {
            PatientId = patient.PatientId,
            DoctorId = doctor.DoctorId,
            AccessType = AccessType.ViewOnly,
            GrantedAt = DateTime.UtcNow,
            Status = AccessPermissionStatus.Active
        };
        _context.AccessPermissions.Add(permission);
        await _context.SaveChangesAsync();

        // Act
        await _consentService.RevokeAccessAsync(permission.AccessPermissionId, patient.PatientId);

        // Assert
        var inDb = await _context.AccessPermissions.FindAsync(permission.AccessPermissionId);
        inDb!.Status.Should().Be(AccessPermissionStatus.Revoked);

        var check = await _consentService.CheckAccessAsync(patient.PatientId, doctor.DoctorId, null);
        check.HasAccess.Should().BeFalse();
    }

    [Fact]
    public async Task GetPatientPermissionsAsync_ReturnsPermissions()
    {
        // Arrange
        var (patient, doctor, clinic) = await SeedBaseEntitiesAsync();
        _context.AccessPermissions.Add(new AccessPermission
        {
            PatientId = patient.PatientId,
            DoctorId = doctor.DoctorId,
            AccessType = AccessType.ViewAndAddRecords,
            GrantedAt = DateTime.UtcNow,
            Status = AccessPermissionStatus.Active
        });
        await _context.SaveChangesAsync();

        // Act
        var result = (await _consentService.GetPatientPermissionsAsync(patient.PatientId)).ToList();

        // Assert
        result.Should().NotBeEmpty();
        result[0].PatientId.Should().Be(patient.PatientId);
        result[0].AccessType.Should().Be(AccessType.ViewAndAddRecords);
    }

    [Fact]
    public async Task GetDoctorPermissionsAsync_ReturnsActivePermissions()
    {
        // Arrange
        var (patient, doctor, clinic) = await SeedBaseEntitiesAsync();
        _context.AccessPermissions.Add(new AccessPermission
        {
            PatientId = patient.PatientId,
            DoctorId = doctor.DoctorId,
            AccessType = AccessType.ViewOnly,
            GrantedAt = DateTime.UtcNow,
            Status = AccessPermissionStatus.Active
        });
        await _context.SaveChangesAsync();

        // Act
        var result = (await _consentService.GetDoctorPermissionsAsync(doctor.DoctorId)).ToList();

        // Assert
        result.Should().NotBeEmpty();
        result[0].DoctorId.Should().Be(doctor.DoctorId);
    }

    [Fact]
    public async Task CheckAccessAsync_WithExpiredPermission_ReturnsFalse()
    {
        // Arrange
        var (patient, doctor, clinic) = await SeedBaseEntitiesAsync();
        _context.AccessPermissions.Add(new AccessPermission
        {
            PatientId = patient.PatientId,
            DoctorId = doctor.DoctorId,
            AccessType = AccessType.ViewAndAddRecords,
            GrantedAt = DateTime.UtcNow.AddDays(-10),
            ExpiresAt = DateTime.UtcNow.AddDays(-1), // Expired yesterday
            Status = AccessPermissionStatus.Active
        });
        await _context.SaveChangesAsync();

        // Act
        var result = await _consentService.CheckAccessAsync(patient.PatientId, doctor.DoctorId, null);

        // Assert
        result.HasAccess.Should().BeFalse();
        result.Reason.Should().Contain("No active consent");
    }

    [Fact]
    public async Task CheckAccessAsync_WithNeitherDoctorNorClinic_ReturnsFalse()
    {
        // Arrange
        var (patient, _, _) = await SeedBaseEntitiesAsync();

        // Act
        var result = await _consentService.CheckAccessAsync(patient.PatientId, null, null);

        // Assert
        result.HasAccess.Should().BeFalse();
        result.Reason.Should().Contain("Neither doctor nor clinic");
    }
}

