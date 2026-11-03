using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Sehati.Domain.Entities;
using Sehati.Infrastructure.Services;

namespace Sehati.Tests.Unit.Services;

public class TokenServiceTests
{
    private readonly TokenService _tokenService;

    public TokenServiceTests()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "JwtSettings:Secret", "Super_Secret_Key_For_Unit_Testing_Purposes_32_Bytes_Long" },
                { "JwtSettings:Issuer", "SehatiTestAPI" },
                { "JwtSettings:Audience", "SehatiTestClient" },
                { "JwtSettings:ExpiryInMinutes", "30" }
            })
            .Build();

        _tokenService = new TokenService(config);
    }

    [Fact]
    public void GenerateTokens_ShouldReturnValidTokensAndUserDto()
    {
        // Arrange
        var user = new User
        {
            UserId = 42,
            Email = "doctor@sehati.com",
            Phone = "+201012345678",
            IsActive = true
        };

        // Act
        var result = _tokenService.GenerateTokens(user, "Doctor", "Dr. Ahmed Hassan", specialty: "Cardiology");

        // Assert
        result.Should().NotBeNull();
        result.AccessToken.Should().NotBeNullOrWhiteSpace();
        result.RefreshToken.Should().NotBeNullOrWhiteSpace();
        result.TokenType.Should().Be("Bearer");
        result.ExpiresIn.Should().Be(1800);
        result.User.UserId.Should().Be(42);
        result.User.Role.Should().Be("Doctor");
        result.User.FullName.Should().Be("Dr. Ahmed Hassan");
        result.User.Specialty.Should().Be("Cardiology");
    }

    [Fact]
    public void GenerateTokens_TokenClaims_ShouldMatchProvidedUser()
    {
        // Arrange
        var user = new User
        {
            UserId = 10,
            Email = "patient@sehati.com",
            Phone = "+201098765432",
            IsActive = true
        };

        // Act
        var result = _tokenService.GenerateTokens(user, "Patient", "Mariam Ali", unifiedPatientId: "SH-2026-000010");

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(result.AccessToken);

        // Assert
        jwt.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Sub && c.Value == "10");
        jwt.Claims.Should().Contain(c => (c.Type == ClaimTypes.Role || c.Type == "role") && c.Value == "Patient");
        jwt.Claims.Should().Contain(c => c.Type == "unified_patient_id" && c.Value == "SH-2026-000010");
        jwt.Claims.Should().Contain(c => (c.Type == ClaimTypes.Name || c.Type == "unique_name") && c.Value == "Mariam Ali");
    }

    [Fact]
    public void GenerateRefreshToken_ShouldProduceCryptographicallyRandomBase64String()
    {
        // Act
        var token1 = _tokenService.GenerateRefreshToken();
        var token2 = _tokenService.GenerateRefreshToken();

        // Assert
        token1.Should().NotBeNullOrWhiteSpace();
        token2.Should().NotBeNullOrWhiteSpace();
        token1.Should().NotBe(token2);
        token1.Length.Should().BeGreaterThan(50);
    }

    [Fact]
    public void GetPrincipalFromExpiredToken_ShouldExtractClaimsSuccessfully()
    {
        // Arrange
        var user = new User
        {
            UserId = 99,
            Email = "test@sehati.com",
            Phone = "+201000000000"
        };
        var tokenResult = _tokenService.GenerateTokens(user, "SystemAdmin");

        // Act
        var principal = _tokenService.GetPrincipalFromExpiredToken(tokenResult.AccessToken);

        // Assert
        principal.Should().NotBeNull();
        principal!.FindFirst(ClaimTypes.NameIdentifier)?.Value.Should().Be("99");
        principal.FindFirst(ClaimTypes.Role)?.Value.Should().Be("SystemAdmin");
    }

    [Fact]
    public void GetPrincipalFromExpiredToken_WithTamperedToken_ShouldReturnNull()
    {
        // Arrange
        const string invalidToken = "eyInvalidHeader.eyInvalidPayload.invalidSignature";

        // Act
        var principal = _tokenService.GetPrincipalFromExpiredToken(invalidToken);

        // Assert
        principal.Should().BeNull();
    }
}
