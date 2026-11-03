namespace Sehati.Application.DTOs.Patients;

public class MedicationDto
{
    public int MedicationId { get; set; }
    public int PatientId { get; set; }
    public string MedicationName { get; set; } = string.Empty;
    public string Dosage { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string? Notes { get; set; }
    public bool IsActive => !EndDate.HasValue || EndDate.Value >= DateOnly.FromDateTime(DateTime.UtcNow);
}

public class CreateMedicationDto
{
    public string MedicationName { get; set; } = string.Empty;
    public string Dosage { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string? Notes { get; set; }
}

