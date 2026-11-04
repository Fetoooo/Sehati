namespace Sehati.Application.DTOs.Audit;

public class AuditLogDto
{
    public int AuditLogId { get; set; }
    public int UserId { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
    public int? PatientId { get; set; }
    public string? PatientName { get; set; }
    public string? UnifiedPatientId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public int? EntityId { get; set; }
    public DateTime Timestamp { get; set; }
    public string IPAddress { get; set; } = string.Empty;
}

public class AuditLogFilterDto
{
    public int? UserId { get; set; }
    public int? PatientId { get; set; }
    public string? EntityName { get; set; }
    public string? Action { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}

