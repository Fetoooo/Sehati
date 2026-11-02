using Sehati.Domain.Enums;

namespace Sehati.Domain.Entities;

public class Visit
{
    public int VisitId { get; set; }
    public int PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public int DoctorId { get; set; }
    public Doctor Doctor { get; set; } = null!;
    public int ClinicId { get; set; }
    public Clinic Clinic { get; set; } = null!;
    public DateTime VisitDate { get; set; } = DateTime.UtcNow;
    public string ChiefComplaint { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public VisitStatus Status { get; set; } = VisitStatus.Completed;

    // Navigation properties
    public ICollection<Diagnosis> Diagnoses { get; set; } = new List<Diagnosis>();
    public ICollection<Treatment> Treatments { get; set; } = new List<Treatment>();
    public ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
    public ICollection<Test> Tests { get; set; } = new List<Test>();
    public ICollection<Scan> Scans { get; set; } = new List<Scan>();
    public ICollection<FollowUp> FollowUps { get; set; } = new List<FollowUp>();
}
