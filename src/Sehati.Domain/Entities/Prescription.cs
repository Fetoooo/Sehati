namespace Sehati.Domain.Entities;

public class Prescription
{
    public int PrescriptionId { get; set; }
    public int VisitId { get; set; }
    public Visit Visit { get; set; } = null!;
    public int DoctorId { get; set; }
    public Doctor Doctor { get; set; } = null!;
    public int PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public DateTime PrescriptionDate { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }

    // Navigation properties
    public ICollection<PrescriptionItem> PrescriptionItems { get; set; } = new List<PrescriptionItem>();
}
