using Sehati.Domain.Enums;

namespace Sehati.Application.DTOs.Patients;

public class EmergencyProfileDto
{
    public int EmergencyProfileId { get; set; }
    public int PatientId { get; set; }
    public string UnifiedPatientId { get; set; } = string.Empty;
    public string PatientName { get; set; } = string.Empty;
    public DateOnly DateOfBirth { get; set; }
    public Gender Gender { get; set; }
    public BloodType BloodType { get; set; }
    public string? EmergencyNotes { get; set; }
    public string EmergencyContactName { get; set; } = string.Empty;
    public string EmergencyContactPhone { get; set; } = string.Empty;
    public DateTime LastUpdatedAt { get; set; }

    public List<string> KnownAllergies { get; set; } = new();
    public List<string> ActiveMedications { get; set; } = new();
}

public class UpdateEmergencyProfileDto
{
    public BloodType BloodType { get; set; }
    public string? EmergencyNotes { get; set; }
    public string EmergencyContactName { get; set; } = string.Empty;
    public string EmergencyContactPhone { get; set; } = string.Empty;
}

