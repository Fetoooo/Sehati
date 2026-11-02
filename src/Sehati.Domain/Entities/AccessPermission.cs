using Sehati.Domain.Enums;

namespace Sehati.Domain.Entities;

public class AccessPermission
{
    public int AccessPermissionId { get; set; }
    public int PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public int? DoctorId { get; set; }
    public Doctor? Doctor { get; set; }
    public int? ClinicId { get; set; }
    public Clinic? Clinic { get; set; }
    public AccessType AccessType { get; set; } = AccessType.ViewOnly;
    public DateTime GrantedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
    public AccessPermissionStatus Status { get; set; } = AccessPermissionStatus.Active;
}
