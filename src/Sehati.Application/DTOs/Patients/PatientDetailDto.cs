using Sehati.Domain.Enums;

namespace Sehati.Application.DTOs.Patients;

public class PatientDetailDto : PatientDto
{
    public int MedicalRecordId { get; set; }
    public BloodType BloodType { get; set; }
    public string? EmergencyNotes { get; set; }
    public string EmergencyContactName { get; set; } = string.Empty;
    public string EmergencyContactPhone { get; set; } = string.Empty;

    public int AllergiesCount { get; set; }
    public int ActiveMedicationsCount { get; set; }
    public int TestsCount { get; set; }
    public int ScansCount { get; set; }
    public int VisitsCount { get; set; }

    public List<AllergyDto> Allergies { get; set; } = new();
    public List<MedicationDto> Medications { get; set; } = new();
    public List<TestDto> RecentTests { get; set; } = new();
    public List<ScanDto> RecentScans { get; set; } = new();
}
