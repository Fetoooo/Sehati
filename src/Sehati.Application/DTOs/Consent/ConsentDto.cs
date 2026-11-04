using Sehati.Domain.Enums;

namespace Sehati.Application.DTOs.Consent;

public class AccessPermissionDto
{
    public int AccessPermissionId { get; set; }
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string UnifiedPatientId { get; set; } = string.Empty;
    public int? DoctorId { get; set; }
    public string? DoctorName { get; set; }
    public string? DoctorSpecialty { get; set; }
    public int? ClinicId { get; set; }
    public string? ClinicName { get; set; }
    public AccessType AccessType { get; set; }
    public DateTime GrantedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public AccessPermissionStatus Status { get; set; }
}

public class GrantAccessPermissionDto
{
    public int? DoctorId { get; set; }
    public int? ClinicId { get; set; }
    public AccessType AccessType { get; set; } = AccessType.ViewOnly;
    public DateTime? ExpiresAt { get; set; }
}

public class CheckAccessDto
{
    public int PatientId { get; set; }
    public int? DoctorId { get; set; }
    public int? ClinicId { get; set; }
}

public class AccessCheckResultDto
{
    public bool HasAccess { get; set; }
    public AccessType? AccessType { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string Reason { get; set; } = string.Empty;
}

