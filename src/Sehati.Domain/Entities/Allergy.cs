namespace Sehati.Domain.Entities;

public class Allergy
{
    public int AllergyId { get; set; }
    public int PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public string AllergyName { get; set; } = string.Empty;
    public string Reaction { get; set; } = string.Empty;
    public string? Notes { get; set; }
}
