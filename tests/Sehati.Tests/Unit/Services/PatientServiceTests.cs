using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Sehati.Application.Common.Exceptions;
using Sehati.Application.DTOs.Patients;
using Sehati.Application.Services;
using Sehati.Application.Validators.Patients;
using Sehati.Domain.Entities;
using Sehati.Domain.Enums;
using Sehati.Infrastructure.Persistence;
using Sehati.Infrastructure.Services;

namespace Sehati.Tests.Unit.Services;

public class PatientServiceTests
{
    private readonly SehatiDbContext _context;
    private readonly UnifiedPatientIdGenerator _idGenerator;
    private readonly PasswordHasherService _hasher;
    private readonly PatientService _patientService;

    public PatientServiceTests()
    {
        var options = new DbContextOptionsBuilder<SehatiDbContext>()
            .UseInMemoryDatabase(databaseName: $"SehatiPatientServiceTestDb_{Guid.NewGuid()}")
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

        _idGenerator = new UnifiedPatientIdGenerator();
        _hasher = new PasswordHasherService();

        _patientService = new PatientService(
            _context,
            _idGenerator,
            _hasher,
            new CreatePatientDtoValidator(),
            new UpdatePatientDtoValidator(),
            new CreateAllergyDtoValidator(),
            new CreateMedicationDtoValidator(),
            new CreateTestDtoValidator(),
            new CreateScanDtoValidator()
        );
    }

    [Fact]
    public async Task CreatePatientAsync_WithValidData_CreatesPatientWithUnifiedIdAndProfiles()
    {
        // Arrange
        var dto = new CreatePatientDto
        {
            FullName = "Tarek Hamed",
            Phone = "+201011112222",
            Email = "tarek.hamed@example.com",
            DateOfBirth = new DateOnly(1990, 5, 15),
            Gender = Gender.Male,
            BloodType = BloodType.APositive,
            Address = "Nasr City, Cairo, Egypt",
            EmergencyContact = "Noura Hamed (+201099998888)",
            EmergencyNotes = "No known chronic illnesses."
        };

        // Act
        var result = await _patientService.CreatePatientAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.PatientId.Should().BeGreaterThan(0);
        result.FullName.Should().Be(dto.FullName);
        result.Phone.Should().Be(dto.Phone);
        result.UnifiedPatientId.Should().StartWith("SH-");
        result.EmergencyContact.Should().Be("Noura Hamed (+201099998888)");

        var patientEntity = await _context.Patients
            .Include(p => p.User)
            .Include(p => p.EmergencyProfile)
            .Include(p => p.MedicalRecord)
            .FirstOrDefaultAsync(p => p.PatientId == result.PatientId);

        patientEntity.Should().NotBeNull();
        patientEntity!.UnifiedPatientId.Should().Be(result.UnifiedPatientId);
        patientEntity.EmergencyProfile.Should().NotBeNull();
        patientEntity.EmergencyProfile!.BloodType.Should().Be(BloodType.APositive);
        patientEntity.EmergencyProfile.EmergencyNotes.Should().Be("No known chronic illnesses.");
        patientEntity.MedicalRecord.Should().NotBeNull();
    }

    [Fact]
    public async Task CreatePatientAsync_WithDuplicatePhone_ThrowsConflictException()
    {
        // Arrange
        var dto1 = new CreatePatientDto
        {
            FullName = "First Patient",
            Phone = "+201012345678",
            Gender = Gender.Male,
            DateOfBirth = new DateOnly(1990, 1, 1)
        };
        await _patientService.CreatePatientAsync(dto1);

        var dto2 = new CreatePatientDto
        {
            FullName = "Second Patient",
            Phone = "+201012345678",
            Gender = Gender.Female,
            DateOfBirth = new DateOnly(1992, 2, 2)
        };

        // Act
        var act = () => _patientService.CreatePatientAsync(dto2);

        // Assert
        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task CreatePatientAsync_WithInvalidData_ThrowsValidationException()
    {
        // Arrange
        var dto = new CreatePatientDto
        {
            FullName = "", // Missing name
            Phone = "123", // Invalid phone
        };

        // Act
        var act = () => _patientService.CreatePatientAsync(dto);

        // Assert
        await act.Should().ThrowAsync<ValidationException>();
    }

    [Fact]
    public async Task GetPatientsAsync_ReturnsPaginatedList()
    {
        // Arrange
        for (int i = 1; i <= 15; i++)
        {
            await _patientService.CreatePatientAsync(new CreatePatientDto
            {
                FullName = $"Patient {i}",
                Phone = $"+2010000000{i:D2}",
                Gender = Gender.Male,
                DateOfBirth = new DateOnly(1990, 1, 1)
            });
        }

        // Act
        var page1 = await _patientService.GetPatientsAsync(pageNumber: 1, pageSize: 10);
        var page2 = await _patientService.GetPatientsAsync(pageNumber: 2, pageSize: 10);

        // Assert
        page1.Should().NotBeNull();
        page1.Items.Count.Should().Be(10);
        page1.TotalCount.Should().Be(15);
        page1.TotalPages.Should().Be(2);
        page1.HasNextPage.Should().BeTrue();
        page1.HasPreviousPage.Should().BeFalse();

        page2.Should().NotBeNull();
        page2.Items.Count.Should().Be(5);
        page2.HasNextPage.Should().BeFalse();
        page2.HasPreviousPage.Should().BeTrue();
    }

    [Fact]
    public async Task GetPatientByIdAsync_WhenExists_ReturnsDetailedPatientProfile()
    {
        // Arrange
        var created = await _patientService.CreatePatientAsync(new CreatePatientDto
        {
            FullName = "Kareem Hassan",
            Phone = "+201012344321",
            Gender = Gender.Male,
            DateOfBirth = new DateOnly(1985, 7, 20),
            BloodType = BloodType.ONegative
        });

        // Add allergy and medication
        await _patientService.AddAllergyAsync(created.PatientId, new CreateAllergyDto
        {
            AllergyName = "Penicillin",
            Reaction = "Severe rash and swelling"
        });
        await _patientService.AddMedicationAsync(created.PatientId, new CreateMedicationDto
        {
            MedicationName = "Panadol Extra",
            Dosage = "500mg",
            Frequency = "Twice daily",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow)
        });

        // Act
        var detail = await _patientService.GetPatientByIdAsync(created.PatientId);

        // Assert
        detail.Should().NotBeNull();
        detail.PatientId.Should().Be(created.PatientId);
        detail.FullName.Should().Be("Kareem Hassan");
        detail.Allergies.Should().HaveCount(1);
        detail.Allergies.First().AllergyName.Should().Be("Penicillin");
        detail.Medications.Should().HaveCount(1);
        detail.Medications.First().MedicationName.Should().Be("Panadol Extra");
        detail.BloodType.Should().Be(BloodType.ONegative);
    }

    [Fact]
    public async Task GetPatientByIdAsync_WhenNotExists_ThrowsNotFoundException()
    {
        // Act
        var act = () => _patientService.GetPatientByIdAsync(99999);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task SearchPatientsAsync_FindsByUnifiedIdNameOrPhone()
    {
        // Arrange
        var p1 = await _patientService.CreatePatientAsync(new CreatePatientDto
        {
            FullName = "Mahmoud Soliman",
            Phone = "+201123456789",
            Gender = Gender.Male,
            DateOfBirth = new DateOnly(1988, 3, 15)
        });

        var p2 = await _patientService.CreatePatientAsync(new CreatePatientDto
        {
            FullName = "Sara Zaki",
            Phone = "+201198765432",
            Gender = Gender.Female,
            DateOfBirth = new DateOnly(1994, 6, 10)
        });

        // Act & Assert - Search by Full Name
        var byName = await _patientService.SearchPatientsAsync("soliman");
        byName.Should().ContainSingle(p => p.PatientId == p1.PatientId);

        // Act & Assert - Search by Phone
        var byPhone = await _patientService.SearchPatientsAsync("98765432");
        byPhone.Should().ContainSingle(p => p.PatientId == p2.PatientId);

        // Act & Assert - Search by Unified ID
        var byUnifiedId = await _patientService.SearchPatientsAsync(p1.UnifiedPatientId);
        byUnifiedId.Should().ContainSingle(p => p.PatientId == p1.PatientId);

        // Act & Assert - Empty or Whitespace
        var empty = await _patientService.SearchPatientsAsync("   ");
        empty.Should().BeEmpty();
    }

    [Fact]
    public async Task UpdatePatientAsync_UpdatesDemographicFieldsSuccessfully()
    {
        // Arrange
        var created = await _patientService.CreatePatientAsync(new CreatePatientDto
        {
            FullName = "Old Name",
            Phone = "+201088776655",
            Gender = Gender.Male,
            DateOfBirth = new DateOnly(1990, 1, 1),
            BloodType = BloodType.BPositive
        });

        var updateDto = new UpdatePatientDto
        {
            FullName = "Updated Name",
            DateOfBirth = new DateOnly(1992, 8, 20),
            Gender = Gender.Male,
            Address = "New Address, Alexandria",
            EmergencyContact = "Contact Person (+201011223344)"
        };

        // Act
        var updated = await _patientService.UpdatePatientAsync(created.PatientId, updateDto);

        // Assert
        updated.FullName.Should().Be("Updated Name");
        updated.Address.Should().Be("New Address, Alexandria");
        updated.EmergencyContact.Should().Be("Contact Person (+201011223344)");

        var patientInDb = await _context.Patients.FindAsync(created.PatientId);
        patientInDb!.FullName.Should().Be("Updated Name");
    }

    [Fact]
    public async Task AllergyCrud_WorksAsExpected()
    {
        // Arrange
        var patient = await _patientService.CreatePatientAsync(new CreatePatientDto
        {
            FullName = "Allergy Patient",
            Phone = "+201055554444",
            Gender = Gender.Female,
            DateOfBirth = new DateOnly(1991, 2, 2)
        });

        // Add
        var allergyDto = await _patientService.AddAllergyAsync(patient.PatientId, new CreateAllergyDto
        {
            AllergyName = "Aspirin",
            Reaction = "Skin hives and itching",
            Notes = "Diagnosed in 2023"
        });

        allergyDto.AllergyId.Should().BeGreaterThan(0);
        allergyDto.AllergyName.Should().Be("Aspirin");

        // List
        var allergies = await _patientService.GetAllergiesAsync(patient.PatientId);
        allergies.Should().ContainSingle(a => a.AllergyName == "Aspirin");

        // Delete
        await _patientService.DeleteAllergyAsync(patient.PatientId, allergyDto.AllergyId);
        var remainingAllergies = await _patientService.GetAllergiesAsync(patient.PatientId);
        remainingAllergies.Should().BeEmpty();
    }

    [Fact]
    public async Task MedicationCrud_WorksAsExpected()
    {
        // Arrange
        var patient = await _patientService.CreatePatientAsync(new CreatePatientDto
        {
            FullName = "Medication Patient",
            Phone = "+201033332222",
            Gender = Gender.Male,
            DateOfBirth = new DateOnly(1987, 4, 18)
        });

        // Add
        var medDto = await _patientService.AddMedicationAsync(patient.PatientId, new CreateMedicationDto
        {
            MedicationName = "Metformin",
            Dosage = "850mg",
            Frequency = "Once daily with dinner",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-1))
        });

        medDto.MedicationId.Should().BeGreaterThan(0);
        medDto.MedicationName.Should().Be("Metformin");

        // List
        var meds = await _patientService.GetMedicationsAsync(patient.PatientId);
        meds.Should().ContainSingle(m => m.MedicationName == "Metformin");

        // Delete
        await _patientService.DeleteMedicationAsync(patient.PatientId, medDto.MedicationId);
        var remainingMeds = await _patientService.GetMedicationsAsync(patient.PatientId);
        remainingMeds.Should().BeEmpty();
    }

    [Fact]
    public async Task TestCrud_WorksAsExpected()
    {
        // Arrange
        var patient = await _patientService.CreatePatientAsync(new CreatePatientDto
        {
            FullName = "Test Patient",
            Phone = "+201022221111",
            Gender = Gender.Male,
            DateOfBirth = new DateOnly(1993, 11, 5)
        });

        // Add
        var testDto = await _patientService.AddTestAsync(patient.PatientId, new CreateTestDto
        {
            TestName = "Complete Blood Count (CBC)",
            TestDate = DateOnly.FromDateTime(DateTime.UtcNow),
            Result = "Normal hemogram",
            Notes = "Routine check"
        });

        testDto.TestId.Should().BeGreaterThan(0);
        testDto.TestName.Should().Be("Complete Blood Count (CBC)");

        // List
        var tests = await _patientService.GetTestsAsync(patient.PatientId);
        tests.Should().ContainSingle(t => t.TestName == "Complete Blood Count (CBC)");

        // Delete
        await _patientService.DeleteTestAsync(patient.PatientId, testDto.TestId);
        var remainingTests = await _patientService.GetTestsAsync(patient.PatientId);
        remainingTests.Should().BeEmpty();
    }

    [Fact]
    public async Task ScanCrud_WorksAsExpected()
    {
        // Arrange
        var patient = await _patientService.CreatePatientAsync(new CreatePatientDto
        {
            FullName = "Scan Patient",
            Phone = "+201066667777",
            Gender = Gender.Female,
            DateOfBirth = new DateOnly(1996, 9, 30)
        });

        // Add
        var scanDto = await _patientService.AddScanAsync(patient.PatientId, new CreateScanDto
        {
            ScanType = "Chest X-Ray",
            ScanDate = DateOnly.FromDateTime(DateTime.UtcNow),
            Result = "Clear lung fields, no infiltrates or consolidations.",
            Notes = "Imaging normal"
        });

        scanDto.ScanId.Should().BeGreaterThan(0);
        scanDto.ScanType.Should().Be("Chest X-Ray");

        // List
        var scans = await _patientService.GetScansAsync(patient.PatientId);
        scans.Should().ContainSingle(s => s.ScanType == "Chest X-Ray");

        // Delete
        await _patientService.DeleteScanAsync(patient.PatientId, scanDto.ScanId);
        var remainingScans = await _patientService.GetScansAsync(patient.PatientId);
        remainingScans.Should().BeEmpty();
    }
}
