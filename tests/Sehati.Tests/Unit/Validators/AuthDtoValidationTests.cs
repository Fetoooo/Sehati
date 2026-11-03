using FluentAssertions;
using Sehati.Application.DTOs.Auth;
using Sehati.Application.Validators.Auth;

namespace Sehati.Tests.Unit.Validators;

public class AuthDtoValidationTests
{
    private readonly RegisterDtoValidator _registerValidator = new();
    private readonly LoginDtoValidator _loginValidator = new();
    private readonly RefreshTokenDtoValidator _refreshTokenValidator = new();

    [Fact]
    public void RegisterValidator_WithValidPatientData_ShouldBeValid()
    {
        // Arrange
        var dto = new RegisterDto
        {
            Email = "patient.test@sehati.com",
            Password = "Password@2026",
            Phone = "+201012345678",
            FullName = "Ahmed Mahmoud",
            RoleName = "Patient",
            DateOfBirth = new DateOnly(1995, 5, 20)
        };

        // Act
        var result = _registerValidator.Validate(dto);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("")]
    [InlineData("notanemail")]
    [InlineData("test@")]
    public void RegisterValidator_WithInvalidEmail_ShouldFail(string email)
    {
        // Arrange
        var dto = new RegisterDto
        {
            Email = email,
            Password = "Password@2026",
            Phone = "+201012345678",
            FullName = "Ahmed Mahmoud",
            RoleName = "Patient"
        };

        // Act
        var result = _registerValidator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterDto.Email));
    }

    [Theory]
    [InlineData("short")] // < 8 chars
    [InlineData("alllowercase123!")] // no uppercase
    [InlineData("ALLUPPERCASE123!")] // no lowercase
    [InlineData("NoSpecialNumber12")] // no special char
    [InlineData("NoDigitSpecialChar!@#")] // no digit
    public void RegisterValidator_WithWeakPassword_ShouldFail(string weakPassword)
    {
        // Arrange
        var dto = new RegisterDto
        {
            Email = "valid@sehati.com",
            Password = weakPassword,
            Phone = "+201012345678",
            FullName = "User Name",
            RoleName = "Patient"
        };

        // Act
        var result = _registerValidator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterDto.Password));
    }

    [Fact]
    public void RegisterValidator_DoctorWithoutSpecialtyOrLicense_ShouldFail()
    {
        // Arrange
        var dto = new RegisterDto
        {
            Email = "doctor@sehati.com",
            Password = "Password@2026",
            Phone = "+201012345678",
            FullName = "Dr. Sameh",
            RoleName = "Doctor",
            Specialty = "",
            LicenseNumber = ""
        };

        // Act
        var result = _registerValidator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterDto.Specialty));
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterDto.LicenseNumber));
    }

    [Fact]
    public void RegisterValidator_WithFutureDateOfBirth_ShouldFail()
    {
        // Arrange
        var dto = new RegisterDto
        {
            Email = "patient@sehati.com",
            Password = "Password@2026",
            Phone = "+201012345678",
            FullName = "Future Person",
            RoleName = "Patient",
            DateOfBirth = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1))
        };

        // Act
        var result = _registerValidator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterDto.DateOfBirth));
    }

    [Fact]
    public void LoginValidator_WithValidData_ShouldBeValid()
    {
        // Arrange
        var dto = new LoginDto
        {
            EmailOrPhone = "user@sehati.com",
            Password = "Password123"
        };

        // Act
        var result = _loginValidator.Validate(dto);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void LoginValidator_WithEmptyFields_ShouldFail()
    {
        // Arrange
        var dto = new LoginDto
        {
            EmailOrPhone = "",
            Password = ""
        };

        // Act
        var result = _loginValidator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(LoginDto.EmailOrPhone));
        result.Errors.Should().Contain(e => e.PropertyName == nameof(LoginDto.Password));
    }

    [Fact]
    public void RefreshTokenValidator_WithValidData_ShouldBeValid()
    {
        // Arrange
        var dto = new RefreshTokenDto
        {
            AccessToken = "valid.access.token",
            RefreshToken = "valid_refresh_token"
        };

        // Act
        var result = _refreshTokenValidator.Validate(dto);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void RefreshTokenValidator_WithEmptyTokens_ShouldFail()
    {
        // Arrange
        var dto = new RefreshTokenDto
        {
            AccessToken = "",
            RefreshToken = ""
        };

        // Act
        var result = _refreshTokenValidator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RefreshTokenDto.AccessToken));
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RefreshTokenDto.RefreshToken));
    }
}
