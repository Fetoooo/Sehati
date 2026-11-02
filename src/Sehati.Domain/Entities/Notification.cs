using Sehati.Domain.Enums;

namespace Sehati.Domain.Entities;

public class Notification
{
    public int NotificationId { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; } = NotificationType.System;
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
