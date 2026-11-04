using Sehati.Domain.Enums;

namespace Sehati.Application.DTOs.Visits;

public class VisitDto
{
    public int VisitId { get; set; }
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string UnifiedPatientId { get; set; } = string.Empty;
    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public string DoctorSpecialty { get; set; } = string.Empty;
    public int ClinicId { get; set; }
    public string ClinicName { get; set; } = string.Empty;
    public DateTime VisitDate { get; set; }
    public string ChiefComplaint { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public VisitStatus Status { get; set; }
    public int DiagnosesCount { get; set; }
    public int TreatmentsCount { get; set; }
    public int PrescriptionsCount { get; set; }
}

public class VisitDetailDto : VisitDto
{
    public List<DiagnosisDto> Diagnoses { get; set; } = new();
    public List<TreatmentDto> Treatments { get; set; } = new();
    public List<int> PrescriptionIds { get; set; } = new();
}

public class CreateVisitDto
{
    public int PatientId { get; set; }
    public int DoctorId { get; set; }
    public int ClinicId { get; set; }
    public string ChiefComplaint { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public VisitStatus Status { get; set; } = VisitStatus.Completed;
}

public class UpdateVisitDto
{
    public string? ChiefComplaint { get; set; }
    public string? Notes { get; set; }
    public VisitStatus Status { get; set; }
}

public class DiagnosisDto
{
    public int DiagnosisId { get; set; }
    public int VisitId { get; set; }
    public string DiagnosisName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime DiagnosisDate { get; set; }
}

public class CreateDiagnosisDto
{
    public string DiagnosisName { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class TreatmentDto
{
    public int TreatmentId { get; set; }
    public int VisitId { get; set; }
    public string TreatmentDescription { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string? Instructions { get; set; }
}

public class CreateTreatmentDto
{
    public string TreatmentDescription { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string? Instructions { get; set; }
}

