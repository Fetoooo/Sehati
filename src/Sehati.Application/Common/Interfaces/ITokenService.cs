using System.Security.Claims;
using Sehati.Application.DTOs.Auth;
using Sehati.Domain.Entities;

namespace Sehati.Application.Common.Interfaces;

public interface ITokenService
{
    TokenResponseDto GenerateTokens(User user, string roleName, string? fullName = null, string? unifiedPatientId = null, string? specialty = null);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    int GetTokenExpirySeconds();
}

