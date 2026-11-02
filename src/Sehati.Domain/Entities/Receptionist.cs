namespace Sehati.Domain.Entities;

public class Receptionist
{
    public int ReceptionistId { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int ClinicId { get; set; }
    public Clinic Clinic { get; set; } = null!;
    public string FullName { get; set; } = string.Empty;
}
