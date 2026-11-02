namespace Sehati.Domain.Entities;

public class Test
{
    public int TestId { get; set; }
    public int PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public int? VisitId { get; set; }
    public Visit? Visit { get; set; }
    public string TestName { get; set; } = string.Empty;
    public DateOnly TestDate { get; set; }
    public string? Result { get; set; }
    public string? Notes { get; set; }
    public string? FileUrl { get; set; }
}
