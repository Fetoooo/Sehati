namespace Sehati.Application.Common.Interfaces;

public interface IUnifiedPatientIdGenerator
{
    /// <summary>
    /// Generates a unique, standardized Unified Patient ID in the format SH-YYYY-NNNNNN
    /// </summary>
    string GenerateId(int sequenceNumber, int? year = null);

    /// <summary>
    /// Validates whether a provided string adheres to the SH-YYYY-NNNNNN format
    /// </summary>
    bool IsValid(string? unifiedPatientId);
}
