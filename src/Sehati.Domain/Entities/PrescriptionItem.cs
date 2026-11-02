namespace Sehati.Domain.Entities;

public class PrescriptionItem
{
    public int PrescriptionItemId { get; set; }
    public int PrescriptionId { get; set; }
    public Prescription Prescription { get; set; } = null!;
    public string MedicationName { get; set; } = string.Empty;
    public string Dosage { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string? Instructions { get; set; }
}
