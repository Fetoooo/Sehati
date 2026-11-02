using FluentAssertions;
using Sehati.Infrastructure.Services;

namespace Sehati.Tests.Unit.Services;

public class UnifiedPatientIdGeneratorTests
{
    private readonly UnifiedPatientIdGenerator _generator = new();

    [Theory]
    [InlineData(1, 2026, "SH-2026-000001")]
    [InlineData(1245, 2026, "SH-2026-001245")]
    [InlineData(999999, 2025, "SH-2025-999999")]
    public void GenerateId_ShouldProduceExpectedFormat(int sequence, int year, string expected)
    {
        // Act
        var result = _generator.GenerateId(sequence, year);

        // Assert
        result.Should().Be(expected);
        _generator.IsValid(result).Should().BeTrue();
    }

    [Theory]
    [InlineData("SH-2026-001245", true)]
    [InlineData("SH-2024-999999", true)]
    [InlineData("SH-26-001245", false)] // Invalid year
    [InlineData("PT-2026-001245", false)] // Invalid prefix
    [InlineData("SH-2026-12345", false)]  // 5 digits instead of 6
    [InlineData("", false)]
    [InlineData(null, false)]
    public void IsValid_ShouldValidateCorrectly(string? id, bool expectedValid)
    {
        // Act
        var isValid = _generator.IsValid(id);

        // Assert
        isValid.Should().Be(expectedValid);
    }
}
