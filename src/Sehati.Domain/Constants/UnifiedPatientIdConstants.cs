namespace Sehati.Domain.Constants;

public static class UnifiedPatientIdConstants
{
    public const string Prefix = "SH";
    public const string RegexPattern = @"^SH-\d{4}-\d{6}$";
    public const int TotalLength = 14; // e.g. "SH-2026-001245"
}
