using Sehati.Domain.Enums;

namespace Sehati.Application.DTOs.Auth;

public class RegisterDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string RoleName { get; set; } = "Patient";

    // Patient-specific properties
    public DateOnly? DateOfBirth { get; set; }
    public Gender? Gender { get; set; }
    public string? Address { get; set; }
    public string? EmergencyContact { get; set; }

    // Doctor-specific properties
    public string? Specialty { get; set; }
    public string? LicenseNumber { get; set; }
}

