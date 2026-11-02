namespace Sehati.Domain.Entities;

public class Medication
{
    public int MedicationId { get; set; }
    public int PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public string MedicationName { get; set; } = string.Empty;
    public string Dosage { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string? Notes { get; set; }
}
