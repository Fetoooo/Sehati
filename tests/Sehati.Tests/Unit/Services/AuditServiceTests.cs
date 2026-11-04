using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Sehati.Application.DTOs.Audit;
using Sehati.Application.Services;
using Sehati.Domain.Entities;
using Sehati.Infrastructure.Persistence;

namespace Sehati.Tests.Unit.Services;

public class AuditServiceTests
{
    private readonly SehatiDbContext _context;
    private readonly AuditService _auditService;

    public AuditServiceTests()
    {
        var options = new DbContextOptionsBuilder<SehatiDbContext>()
            .UseInMemoryDatabase(databaseName: $"SehatiAuditTestDb_{Guid.NewGuid()}")
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

        _auditService = new AuditService(_context);
    }

    [Fact]
    public async Task LogActionAsync_CreatesImmutableAuditLogEntry()
    {
        // Arrange
        var user = new User { Email = "audit.user@test.com", Phone = "+201055550001", RoleId = 2, PasswordHash = "hash" };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Act
        await _auditService.LogActionAsync(
            userId: user.UserId,
            action: "VIEW_MEDICAL_RECORD",
            entityName: "MedicalRecord",
            entityId: 45,
            patientId: 10,
            ipAddress: "192.168.1.100"
        );

        // Assert
        var logs = await _context.AuditLogs.ToListAsync();
        logs.Should().HaveCount(1);
        logs[0].Action.Should().Be("VIEW_MEDICAL_RECORD");
        logs[0].EntityName.Should().Be("MedicalRecord");
        logs[0].EntityId.Should().Be(45);
        logs[0].PatientId.Should().Be(10);
        logs[0].IPAddress.Should().Be("192.168.1.100");
    }

    [Fact]
    public async Task GetAuditLogsAsync_WithFilter_ReturnsPaginatedMatchingLogs()
    {
        // Arrange
        var user = new User { Email = "audit.user2@test.com", Phone = "+201055550002", RoleId = 2, PasswordHash = "hash" };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        _context.AuditLogs.AddRange(
            new AuditLog { UserId = user.UserId, Action = "EXPORT_PDF", EntityName = "Prescription", IPAddress = "127.0.0.1", Timestamp = DateTime.UtcNow },
            new AuditLog { UserId = user.UserId, Action = "LOGIN", EntityName = "User", IPAddress = "127.0.0.1", Timestamp = DateTime.UtcNow }
        );
        await _context.SaveChangesAsync();

        var filter = new AuditLogFilterDto { EntityName = "Prescription" };

        // Act
        var result = await _auditService.GetAuditLogsAsync(filter, pageNumber: 1, pageSize: 10);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items.First().Action.Should().Be("EXPORT_PDF");
    }
}

