namespace Sehati.Domain.Entities;

public class AuditLog
{
    public int AuditLogId { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int? PatientId { get; set; }
    public Patient? Patient { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public int? EntityId { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string IPAddress { get; set; } = string.Empty;
}
