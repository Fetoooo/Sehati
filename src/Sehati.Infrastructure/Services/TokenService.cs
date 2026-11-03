using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Sehati.Application.Common.Interfaces;
using Sehati.Application.DTOs.Auth;
using Sehati.Domain.Entities;

namespace Sehati.Infrastructure.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;
    private readonly byte[] _secretKey;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _expiryInMinutes;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
        var secret = _configuration["JwtSettings:Secret"]
            ?? "Sehati_Centralized_Digital_Health_Platform_Secure_JWT_Key_2026_Minimum_32_Chars";
        _secretKey = Encoding.UTF8.GetBytes(secret);
        _issuer = _configuration["JwtSettings:Issuer"] ?? "SehatiAPI";
        _audience = _configuration["JwtSettings:Audience"] ?? "SehatiClient";
        _expiryInMinutes = int.TryParse(_configuration["JwtSettings:ExpiryInMinutes"], out var minutes) ? minutes : 60;
    }

    public TokenResponseDto GenerateTokens(User user, string roleName, string? fullName = null, string? unifiedPatientId = null, string? specialty = null)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var displayName = string.IsNullOrWhiteSpace(fullName) ? user.Email : fullName;

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.Role, roleName),
            new("role", roleName),
            new(ClaimTypes.Name, displayName),
            new("phone", user.Phone),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        if (!string.IsNullOrWhiteSpace(unifiedPatientId))
        {
            claims.Add(new Claim("unified_patient_id", unifiedPatientId));
        }

        if (!string.IsNullOrWhiteSpace(specialty))
        {
            claims.Add(new Claim("specialty", specialty));
        }

        var expires = DateTime.UtcNow.AddMinutes(_expiryInMinutes);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expires,
            Issuer = _issuer,
            Audience = _audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(_secretKey), SecurityAlgorithms.HmacSha256Signature)
        };

        var securityToken = tokenHandler.CreateToken(tokenDescriptor);
        var accessToken = tokenHandler.WriteToken(securityToken);
        var refreshToken = GenerateRefreshToken();

        return new TokenResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            TokenType = "Bearer",
            ExpiresIn = _expiryInMinutes * 60,
            User = new UserDto
            {
                UserId = user.UserId,
                Email = user.Email,
                Phone = user.Phone,
                Role = roleName,
                FullName = displayName,
                UnifiedPatientId = unifiedPatientId,
                Specialty = specialty,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            }
        };
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(_secretKey),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = false,
            ClockSkew = TimeSpan.Zero
        };

        try
        {
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);

            if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                return null;
            }

            return principal;
        }
        catch
        {
            return null;
        }
    }

    public int GetTokenExpirySeconds()
    {
        return _expiryInMinutes * 60;
    }
}

