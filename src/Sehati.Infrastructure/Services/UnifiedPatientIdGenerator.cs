using System.Text.RegularExpressions;
using Sehati.Application.Common.Interfaces;
using Sehati.Domain.Constants;

namespace Sehati.Infrastructure.Services;

public class UnifiedPatientIdGenerator : IUnifiedPatientIdGenerator
{
    private static readonly Regex IdRegex = new(UnifiedPatientIdConstants.RegexPattern, RegexOptions.Compiled);

    public string GenerateId(int sequenceNumber, int? year = null)
    {
        var targetYear = year ?? DateTime.UtcNow.Year;
        var sequencePart = Math.Abs(sequenceNumber % 1_000_000).ToString("D6");
        return $"{UnifiedPatientIdConstants.Prefix}-{targetYear}-{sequencePart}";
    }

    public bool IsValid(string? unifiedPatientId)
    {
        if (string.IsNullOrWhiteSpace(unifiedPatientId))
            return false;

        return IdRegex.IsMatch(unifiedPatientId);
    }
}
