using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Sehati.Application.Common.Exceptions;
using Sehati.Application.Common.Interfaces;
using Sehati.Application.DTOs.Notifications;
using Sehati.Domain.Entities;
using ValidationException = Sehati.Application.Common.Exceptions.ValidationException;

namespace Sehati.Application.Services;

public class NotificationService : INotificationService
{
    private readonly IApplicationDbContext _context;
    private readonly IValidator<CreateNotificationDto> _validator;

    public NotificationService(
        IApplicationDbContext context,
        IValidator<CreateNotificationDto> validator)
    {
        _context = context;
        _validator = validator;
    }

    public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(int userId, bool? unreadOnly = null, CancellationToken cancellationToken = default)
    {
        var userExists = await _context.Users.AnyAsync(u => u.UserId == userId, cancellationToken);
        if (!userExists)
        {
            throw new NotFoundException("User", userId);
        }

        var query = _context.Notifications
            .Where(n => n.UserId == userId);

        if (unreadOnly.HasValue && unreadOnly.Value)
        {
            query = query.Where(n => !n.IsRead);
        }

        return await query
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .Select(n => new NotificationDto
            {
                NotificationId = n.NotificationId,
                UserId = n.UserId,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            throw new ValidationException(errors);
        }

        var user = await _context.Users.FindAsync(new object[] { dto.UserId }, cancellationToken);
        if (user == null)
        {
            throw new NotFoundException("User", dto.UserId);
        }

        var notification = new Notification
        {
            UserId = dto.UserId,
            Title = dto.Title.Trim(),
            Message = dto.Message.Trim(),
            Type = dto.Type,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync(cancellationToken);

        return new NotificationDto
        {
            NotificationId = notification.NotificationId,
            UserId = notification.UserId,
            Title = notification.Title,
            Message = notification.Message,
            Type = notification.Type,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt
        };
    }

    public async Task MarkAsReadAsync(int notificationId, int userId, CancellationToken cancellationToken = default)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.UserId == userId, cancellationToken);

        if (notification == null)
        {
            throw new NotFoundException($"Notification {notificationId} was not found for user {userId}.");
        }

        notification.IsRead = true;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task MarkAllAsReadAsync(int userId, CancellationToken cancellationToken = default)
    {
        var unread = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync(cancellationToken);

        foreach (var notification in unread)
        {
            notification.IsRead = true;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}

