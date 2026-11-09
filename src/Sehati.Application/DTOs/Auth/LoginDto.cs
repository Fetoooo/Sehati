namespace Sehati.Application.DTOs.Auth;

public class LoginDto
{
    private string _emailOrPhone = string.Empty;

    public string EmailOrPhone
    {
        get => _emailOrPhone;
        set => _emailOrPhone = value ?? string.Empty;
    }

    /// <summary>
    /// Supported for frontend compatibility when clients pass "identifier"
    /// </summary>
    public string? Identifier
    {
        get => _emailOrPhone;
        set
        {
            if (!string.IsNullOrWhiteSpace(value))
            {
                _emailOrPhone = value;
            }
        }
    }

    public string Password { get; set; } = string.Empty;
}
