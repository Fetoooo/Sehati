namespace Sehati.Domain.Entities;

public class Scan
{
    public int ScanId { get; set; }
    public int PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public int? VisitId { get; set; }
    public Visit? Visit { get; set; }
    public string ScanType { get; set; } = string.Empty;
    public DateOnly ScanDate { get; set; }
    public string? Result { get; set; }
    public string? FileUrl { get; set; }
    public string? Notes { get; set; }
}
