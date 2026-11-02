using Sehati.Domain.Enums;

namespace Sehati.Domain.Entities;

public class FollowUp
{
    public int FollowUpId { get; set; }
    public int PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public int DoctorId { get; set; }
    public Doctor Doctor { get; set; } = null!;
    public int VisitId { get; set; }
    public Visit Visit { get; set; } = null!;
    public DateOnly FollowUpDate { get; set; }
    public string? Notes { get; set; }
    public FollowUpStatus Status { get; set; } = FollowUpStatus.Scheduled;
}
