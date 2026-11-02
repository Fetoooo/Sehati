namespace Sehati.Domain.Entities;

public class Doctor
{
    public int DoctorId { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string FullName { get; set; } = string.Empty;
    public string Specialty { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<ClinicDoctor> ClinicDoctors { get; set; } = new List<ClinicDoctor>();
    public ICollection<Visit> Visits { get; set; } = new List<Visit>();
    public ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<FollowUp> FollowUps { get; set; } = new List<FollowUp>();
    public ICollection<AccessPermission> AccessPermissions { get; set; } = new List<AccessPermission>();
}
