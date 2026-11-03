using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Sehati.Application.Common.Exceptions;
using Sehati.Application.DTOs.Patients;
using Sehati.Application.Services;
using Sehati.Application.Validators.Patients;
using Sehati.Domain.Entities;
using Sehati.Domain.Enums;
using Sehati.Infrastructure.Persistence;

namespace Sehati.Tests.Unit.Services;

public class EmergencyServiceTests
{
    private readonly SehatiDbContext _context;
    private readonly EmergencyService _emergencyService;

    public EmergencyServiceTests()
    {
        var options = new DbContextOptionsBuilder<SehatiDbContext>()
            .UseInMemoryDatabase(databaseName: $"SehatiEmergencyServiceTestDb_{Guid.NewGuid()}")
            .Options;

        _context = new SehatiDbContext(options);

        _emergencyService = new EmergencyService(
            _context,
            new UpdateEmergencyProfileDtoValidator()
        );
    }

    private async Task<Patient> SeedPatientWithEmergencyProfileAsync(
        string unifiedId = "SH-2026-000042",
        string fullName = "Ahmed Zewail",
        string phone = "+201012345678",
        BloodType bloodType = BloodType.OPositive)
    {
        var user = new User
        {
            Phone = phone,
            Email = $"{unifiedId.ToLower()}@sehati.com",
            PasswordHash = "hash",
            RoleId = 1, // Patient
            IsActive = true
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var patient = new Patient
        {
            UserId = user.UserId,
            FullName = fullName,
            UnifiedPatientId = unifiedId,
            Gender = Gender.Male,
            EmergencyContact = "Primary Contact",
            DateOfBirth = new DateOnly(1980, 1, 1)
        };
        _context.Patients.Add(patient);
        await _context.SaveChangesAsync();

        var profile = new EmergencyProfile
        {
            PatientId = patient.PatientId,
            BloodType = bloodType,
            EmergencyContactName = "Primary Contact",
            EmergencyContactPhone = "+201099887766",
            EmergencyNotes = "Diabetic patient - wears medical alert bracelet.",
            LastUpdatedAt = DateTime.UtcNow
        };
        _context.EmergencyProfiles.Add(profile);

        // Add an allergy
        _context.Allergies.Add(new Allergy
        {
            PatientId = patient.PatientId,
            AllergyName = "Iodine Contrast",
            Reaction = "Anaphylaxis"
        });

        // Add a medication
        _context.Medications.Add(new Medication
        {
            PatientId = patient.PatientId,
            MedicationName = "Insulin Glargine",
            Dosage = "20 units",
            Frequency = "Once daily at bedtime",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-6))
        });

        await _context.SaveChangesAsync();
        return patient;
    }

    [Fact]
    public async Task GetEmergencyProfileByUnifiedIdAsync_ReturnsEmergencyDetails()
    {
        // Arrange
        var patient = await SeedPatientWithEmergencyProfileAsync(unifiedId: "SH-2026-000100");

        // Act - case-insensitive test
        var profile = await _emergencyService.GetEmergencyProfileByUnifiedIdAsync("sh-2026-000100");

        // Assert
        profile.Should().NotBeNull();
        profile.UnifiedPatientId.Should().Be("SH-2026-000100");
        profile.PatientName.Should().Be("Ahmed Zewail");
        profile.BloodType.Should().Be(BloodType.OPositive);
        profile.EmergencyContactName.Should().Be("Primary Contact");
        profile.EmergencyContactPhone.Should().Be("+201099887766");
        profile.EmergencyNotes.Should().Be("Diabetic patient - wears medical alert bracelet.");
        profile.KnownAllergies.Should().Contain(a => a.Contains("Iodine Contrast"));
        profile.ActiveMedications.Should().Contain(m => m.Contains("Insulin Glargine"));
    }

    [Fact]
    public async Task GetEmergencyProfileByUnifiedIdAsync_WhenNotFound_ThrowsNotFoundException()
    {
        // Act
        var act = () => _emergencyService.GetEmergencyProfileByUnifiedIdAsync("SH-9999-999999");

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task GetEmergencyProfileByPatientIdAsync_WhenExists_ReturnsProfile()
    {
        // Arrange
        var patient = await SeedPatientWithEmergencyProfileAsync();

        // Act
        var profile = await _emergencyService.GetEmergencyProfileByPatientIdAsync(patient.PatientId);

        // Assert
        profile.Should().NotBeNull();
        profile.PatientId.Should().Be(patient.PatientId);
        profile.PatientName.Should().Be("Ahmed Zewail");
    }

    [Fact]
    public async Task UpdateEmergencyProfileAsync_WithValidData_UpdatesSuccessfully()
    {
        // Arrange
        var patient = await SeedPatientWithEmergencyProfileAsync();

        var updateDto = new UpdateEmergencyProfileDto
        {
            BloodType = BloodType.ABPositive,
            EmergencyContactName = "New Guardian",
            EmergencyContactPhone = "+201022334455",
            EmergencyNotes = "Pacemaker implanted in 2024."
        };

        // Act
        var updated = await _emergencyService.UpdateEmergencyProfileAsync(patient.PatientId, updateDto);

        // Assert
        updated.BloodType.Should().Be(BloodType.ABPositive);
        updated.EmergencyContactName.Should().Be("New Guardian");
        updated.EmergencyContactPhone.Should().Be("+201022334455");
        updated.EmergencyNotes.Should().Be("Pacemaker implanted in 2024.");

        var inDb = await _context.EmergencyProfiles.FirstOrDefaultAsync(p => p.PatientId == patient.PatientId);
        inDb!.BloodType.Should().Be(BloodType.ABPositive);
        inDb.EmergencyContactName.Should().Be("New Guardian");
    }

    [Fact]
    public async Task UpdateEmergencyProfileAsync_WithInvalidData_ThrowsValidationException()
    {
        // Arrange
        var patient = await SeedPatientWithEmergencyProfileAsync();

        var invalidDto = new UpdateEmergencyProfileDto
        {
            BloodType = BloodType.APositive,
            EmergencyContactName = "", // Empty name
            EmergencyContactPhone = "invalid-phone" // Bad phone
        };

        // Act
        var act = () => _emergencyService.UpdateEmergencyProfileAsync(patient.PatientId, invalidDto);

        // Assert
        await act.Should().ThrowAsync<ValidationException>();
    }
}
