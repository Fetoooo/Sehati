namespace Sehati.Domain.Entities;

public class MedicalRecord
{
    public int MedicalRecordId { get; set; }
    public int PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastUpdatedAt { get; set; } = DateTime.UtcNow;
}
