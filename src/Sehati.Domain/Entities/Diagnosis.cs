namespace Sehati.Domain.Entities;

public class Diagnosis
{
    public int DiagnosisId { get; set; }
    public int VisitId { get; set; }
    public Visit Visit { get; set; } = null!;
    public string DiagnosisName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime DiagnosisDate { get; set; } = DateTime.UtcNow;
}
