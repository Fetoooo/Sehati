using Sehati.Domain.Enums;

namespace Sehati.Domain.Entities;

public class ClinicDoctor
{
    public int ClinicDoctorId { get; set; }
    public int ClinicId { get; set; }
    public Clinic Clinic { get; set; } = null!;
    public int DoctorId { get; set; }
    public Doctor Doctor { get; set; } = null!;
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public ClinicStatus Status { get; set; } = ClinicStatus.Active;
}
