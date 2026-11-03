using Sehati.Domain.Enums;

namespace Sehati.Application.DTOs.Patients;

public class PatientDto
{
    public int PatientId { get; set; }
    public int UserId { get; set; }
    public string UnifiedPatientId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateOnly DateOfBirth { get; set; }
    public Gender Gender { get; set; }
    public string? Address { get; set; }
    public string? EmergencyContact { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
