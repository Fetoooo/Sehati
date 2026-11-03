using Sehati.Domain.Enums;

namespace Sehati.Application.DTOs.Patients;

public class UpdatePatientDto
{
    public string FullName { get; set; } = string.Empty;
    public DateOnly DateOfBirth { get; set; }
    public Gender Gender { get; set; }
    public string? Address { get; set; }
    public string? EmergencyContact { get; set; }
    public string? Phone { get; set; }
}
