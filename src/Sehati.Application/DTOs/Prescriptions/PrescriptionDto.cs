namespace Sehati.Application.DTOs.Prescriptions;

public class PrescriptionDto
{
    public int PrescriptionId { get; set; }
    public int VisitId { get; set; }
    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public string DoctorSpecialty { get; set; } = string.Empty;
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string UnifiedPatientId { get; set; } = string.Empty;
    public DateTime PrescriptionDate { get; set; }
    public string? Notes { get; set; }
    public int ItemsCount { get; set; }
}

public class PrescriptionDetailDto : PrescriptionDto
{
    public List<PrescriptionItemDto> Items { get; set; } = new();
}

public class CreatePrescriptionDto
{
    public int VisitId { get; set; }
    public int DoctorId { get; set; }
    public int PatientId { get; set; }
    public string? Notes { get; set; }
    public List<CreatePrescriptionItemDto> Items { get; set; } = new();
}

public class PrescriptionItemDto
{
    public int PrescriptionItemId { get; set; }
    public int PrescriptionId { get; set; }
    public string MedicationName { get; set; } = string.Empty;
    public string Dosage { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string? Instructions { get; set; }
}

public class CreatePrescriptionItemDto
{
    public string MedicationName { get; set; } = string.Empty;
    public string Dosage { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string? Instructions { get; set; }
}

