using Sehati.Domain.Enums;

namespace Sehati.Domain.Entities;

public class Clinic
{
    public int ClinicId { get; set; }
    public string ClinicName { get; set; } = string.Empty;
    public string Specialty { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string WorkingHours { get; set; } = string.Empty;
    public ClinicStatus Status { get; set; } = ClinicStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<ClinicDoctor> ClinicDoctors { get; set; } = new List<ClinicDoctor>();
    public ICollection<Receptionist> Receptionists { get; set; } = new List<Receptionist>();
    public ICollection<Visit> Visits { get; set; } = new List<Visit>();
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<AccessPermission> AccessPermissions { get; set; } = new List<AccessPermission>();
}
