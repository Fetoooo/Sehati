namespace Sehati.Application.DTOs.Patients;

public class AllergyDto
{
    public int AllergyId { get; set; }
    public int PatientId { get; set; }
    public string AllergyName { get; set; } = string.Empty;
    public string Reaction { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class CreateAllergyDto
{
    public string AllergyName { get; set; } = string.Empty;
    public string Reaction { get; set; } = string.Empty;
    public string? Notes { get; set; }
}
