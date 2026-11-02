using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Sehati.Domain.Entities;
using Sehati.Infrastructure.Persistence;

namespace Sehati.Tests.Unit.Entities;

public class DatabaseSchemaTests
{
    private readonly SehatiDbContext _context;

    public DatabaseSchemaTests()
    {
        var options = new DbContextOptionsBuilder<SehatiDbContext>()
            .UseSqlServer("Server=localhost;Database=SehatiTestDb;Trusted_Connection=True;TrustServerCertificate=True;")
            .Options;

        _context = new SehatiDbContext(options);
    }

    [Fact]
    public void Model_ShouldContainAll23EntityTypes()
    {
        // Arrange
        var expectedEntities = new[]
        {
            typeof(User),
            typeof(Role),
            typeof(Patient),
            typeof(Clinic),
            typeof(Doctor),
            typeof(ClinicDoctor),
            typeof(Receptionist),
            typeof(MedicalRecord),
            typeof(Visit),
            typeof(Diagnosis),
            typeof(Treatment),
            typeof(Prescription),
            typeof(PrescriptionItem),
            typeof(Allergy),
            typeof(Medication),
            typeof(Test),
            typeof(Scan),
            typeof(Appointment),
            typeof(FollowUp),
            typeof(EmergencyProfile),
            typeof(AccessPermission),
            typeof(Notification),
            typeof(AuditLog)
        };

        // Act
        var modelEntityTypes = _context.Model.GetEntityTypes()
            .Select(t => t.ClrType)
            .ToList();

        // Assert
        expectedEntities.Should().HaveCount(23);
        modelEntityTypes.Should().Contain(expectedEntities);
    }

    [Fact]
    public void Model_ShouldConfigureKeyIndexesCorrectly()
    {
        // Act
        var patientEntity = _context.Model.FindEntityType(typeof(Patient));
        var visitEntity = _context.Model.FindEntityType(typeof(Visit));
        var permissionEntity = _context.Model.FindEntityType(typeof(AccessPermission));
        var auditLogEntity = _context.Model.FindEntityType(typeof(AuditLog));

        // Assert
        patientEntity.Should().NotBeNull();
        patientEntity!.GetIndexes().Should().Contain(i => i.Properties.Any(p => p.Name == "UnifiedPatientId") && i.IsUnique);

        visitEntity.Should().NotBeNull();
        visitEntity!.GetIndexes().Should().Contain(i => i.Properties.Any(p => p.Name == "PatientId") && i.Properties.Any(p => p.Name == "VisitDate"));

        permissionEntity.Should().NotBeNull();
        permissionEntity!.GetIndexes().Should().Contain(i => i.Properties.Any(p => p.Name == "PatientId") && i.Properties.Any(p => p.Name == "DoctorId"));

        auditLogEntity.Should().NotBeNull();
        auditLogEntity!.GetIndexes().Should().Contain(i => i.Properties.Any(p => p.Name == "Timestamp"));
    }

    [Fact]
    public void Model_ShouldHaveRoleSeedData()
    {
        // Act
        var designTimeModel = Microsoft.EntityFrameworkCore.Infrastructure.AccessorExtensions
            .GetService<Microsoft.EntityFrameworkCore.Metadata.IDesignTimeModel>(_context).Model;
        var roleEntity = designTimeModel.FindEntityType(typeof(Role));

        // Assert
        roleEntity.Should().NotBeNull();
        var seedData = roleEntity!.GetSeedData().ToList();
        seedData.Should().HaveCount(5);
        seedData.Select(d => d["RoleName"]).Should().Contain(new[] { "Patient", "Doctor", "Receptionist", "ClinicAdmin", "SystemAdmin" });
    }
}
