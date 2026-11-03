namespace Sehati.Application.DTOs.Auth;

public class UserDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? UnifiedPatientId { get; set; }
    public string? Specialty { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

