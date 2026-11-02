namespace Sehati.Domain.Entities;

public class Treatment
{
    public int TreatmentId { get; set; }
    public int VisitId { get; set; }
    public Visit Visit { get; set; } = null!;
    public string TreatmentDescription { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string? Instructions { get; set; }
}
