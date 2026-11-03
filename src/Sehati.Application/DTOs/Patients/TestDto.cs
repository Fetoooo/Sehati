namespace Sehati.Application.DTOs.Patients;

public class TestDto
{
    public int TestId { get; set; }
    public int PatientId { get; set; }
    public int? VisitId { get; set; }
    public string TestName { get; set; } = string.Empty;
    public DateOnly TestDate { get; set; }
    public string? Result { get; set; }
    public string? Notes { get; set; }
    public string? FileUrl { get; set; }
}

public class CreateTestDto
{
    public int? VisitId { get; set; }
    public string TestName { get; set; } = string.Empty;
    public DateOnly TestDate { get; set; }
    public string? Result { get; set; }
    public string? Notes { get; set; }
    public string? FileUrl { get; set; }
}

