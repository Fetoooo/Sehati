using Sehati.Domain.Enums;

namespace Sehati.Domain.Entities;

public class EmergencyProfile
{
    public int EmergencyProfileId { get; set; }
    public int PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public BloodType BloodType { get; set; } = BloodType.Unknown;
    public string? EmergencyNotes { get; set; }
    public string EmergencyContactName { get; set; } = string.Empty;
    public string EmergencyContactPhone { get; set; } = string.Empty;
    public DateTime LastUpdatedAt { get; set; } = DateTime.UtcNow;
}
