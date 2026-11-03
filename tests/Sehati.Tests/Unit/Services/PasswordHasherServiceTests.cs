using FluentAssertions;
using Sehati.Domain.Entities;
using Sehati.Infrastructure.Services;

namespace Sehati.Tests.Unit.Services;

public class PasswordHasherServiceTests
{
    private readonly PasswordHasherService _hasher = new();
    private readonly User _dummyUser = new() { UserId = 1, Email = "test@sehati.com" };

    [Fact]
    public void HashPassword_ShouldReturnHashedString_NotMatchingPlainText()
    {
        // Arrange
        const string plainText = "SecurePassword123!";

        // Act
        var hash = _hasher.HashPassword(_dummyUser, plainText);

        // Assert
        hash.Should().NotBeNullOrWhiteSpace();
        hash.Should().NotBe(plainText);
    }

    [Fact]
    public void VerifyPassword_WithCorrectPassword_ShouldReturnTrue()
    {
        // Arrange
        const string password = "StrongPassword@2026";
        var hash = _hasher.HashPassword(_dummyUser, password);

        // Act
        var isValid = _hasher.VerifyPassword(_dummyUser, hash, password);

        // Assert
        isValid.Should().BeTrue();
    }

    [Fact]
    public void VerifyPassword_WithWrongPassword_ShouldReturnFalse()
    {
        // Arrange
        const string correctPassword = "StrongPassword@2026";
        const string wrongPassword = "WrongPassword#9999";
        var hash = _hasher.HashPassword(_dummyUser, correctPassword);

        // Act
        var isValid = _hasher.VerifyPassword(_dummyUser, hash, wrongPassword);

        // Assert
        isValid.Should().BeFalse();
    }
}
