namespace Sehati.Domain.Constants;

public static class SystemRoles
{
    public const string Patient = "Patient";
    public const string Doctor = "Doctor";
    public const string Receptionist = "Receptionist";
    public const string ClinicAdmin = "ClinicAdmin";
    public const string SystemAdmin = "SystemAdmin";

    public static readonly IReadOnlyList<string> All = new[]
    {
        Patient,
        Doctor,
        Receptionist,
        ClinicAdmin,
        SystemAdmin
    };
}
