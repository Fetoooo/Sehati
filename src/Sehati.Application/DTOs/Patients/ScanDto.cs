namespace Sehati.Application.DTOs.Patients;

public class ScanDto
{
    public int ScanId { get; set; }
    public int PatientId { get; set; }
    public int? VisitId { get; set; }
    public string ScanType { get; set; } = string.Empty;
    public DateOnly ScanDate { get; set; }
    public string? Result { get; set; }
    public string? FileUrl { get; set; }
    public string? Notes { get; set; }
}

public class CreateScanDto
{
    public int? VisitId { get; set; }
    public string ScanType { get; set; } = string.Empty;
    public DateOnly ScanDate { get; set; }
    public string? Result { get; set; }
    public string? FileUrl { get; set; }
    public string? Notes { get; set; }
}

