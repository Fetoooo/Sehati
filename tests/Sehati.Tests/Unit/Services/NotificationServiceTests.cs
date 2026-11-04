using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Sehati.Application.DTOs.Notifications;
using Sehati.Application.Services;
using Sehati.Application.Validators.Notifications;
using Sehati.Domain.Entities;
using Sehati.Domain.Enums;
using Sehati.Infrastructure.Persistence;

namespace Sehati.Tests.Unit.Services;

public class NotificationServiceTests
{
    private readonly SehatiDbContext _context;
    private readonly NotificationService _notificationService;

    public NotificationServiceTests()
    {
        var options = new DbContextOptionsBuilder<SehatiDbContext>()
            .UseInMemoryDatabase(databaseName: $"SehatiNotificationTestDb_{Guid.NewGuid()}")
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

        _notificationService = new NotificationService(_context, new CreateNotificationDtoValidator());
    }

    [Fact]
    public async Task CreateNotificationAsync_CreatesNotificationForUser()
    {
        // Arrange
        var user = new User { Email = "notif.user@test.com", Phone = "+201044440001", RoleId = 1, PasswordHash = "hash" };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var dto = new CreateNotificationDto
        {
            UserId = user.UserId,
            Title = "Appointment Reminder",
            Message = "You have an appointment tomorrow at 10:00 AM",
            Type = NotificationType.Appointment
        };

        // Act
        var result = await _notificationService.CreateNotificationAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.NotificationId.Should().BeGreaterThan(0);
        result.Title.Should().Be("Appointment Reminder");
        result.IsRead.Should().BeFalse();

        var inDb = await _context.Notifications.FindAsync(result.NotificationId);
        inDb.Should().NotBeNull();
        inDb!.IsRead.Should().BeFalse();
    }

    [Fact]
    public async Task MarkAsReadAsync_UpdatesIsReadToTrue()
    {
        // Arrange
        var user = new User { Email = "notif.user2@test.com", Phone = "+201044440002", RoleId = 1, PasswordHash = "hash" };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var notification = new Notification
        {
            UserId = user.UserId,
            Title = "Prescription Ready",
            Message = "Dr. Nader issued your prescription",
            Type = NotificationType.Prescription,
            IsRead = false
        };
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        // Act
        await _notificationService.MarkAsReadAsync(notification.NotificationId, user.UserId);

        // Assert
        var inDb = await _context.Notifications.FindAsync(notification.NotificationId);
        inDb!.IsRead.Should().BeTrue();
    }
}

