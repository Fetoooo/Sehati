using Sehati.Domain.Enums;

namespace Sehati.Domain.Entities;

public class Patient
{
    public int PatientId { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string UnifiedPatientId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateOnly DateOfBirth { get; set; }
    public Gender Gender { get; set; }
    public string? Address { get; set; }
    public string? EmergencyContact { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public MedicalRecord? MedicalRecord { get; set; }
    public EmergencyProfile? EmergencyProfile { get; set; }
    public ICollection<Visit> Visits { get; set; } = new List<Visit>();
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<FollowUp> FollowUps { get; set; } = new List<FollowUp>();
    public ICollection<AccessPermission> AccessPermissions { get; set; } = new List<AccessPermission>();
    public ICollection<Allergy> Allergies { get; set; } = new List<Allergy>();
    public ICollection<Medication> Medications { get; set; } = new List<Medication>();
    public ICollection<Test> Tests { get; set; } = new List<Test>();
    public ICollection<Scan> Scans { get; set; } = new List<Scan>();
    public ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
}
