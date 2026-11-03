using Sehati.Domain.Enums;

namespace Sehati.Application.DTOs.Patients;

public class CreatePatientDto
{
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public Gender Gender { get; set; }
    public string? Address { get; set; }
    public string? EmergencyContact { get; set; }
    public BloodType BloodType { get; set; } = BloodType.Unknown;
    public string? EmergencyNotes { get; set; }
}
