using Sehati.Application.DTOs.Consent;

namespace Sehati.Application.Common.Interfaces;

public interface IConsentService
{
    Task<IEnumerable<AccessPermissionDto>> GetPatientPermissionsAsync(int patientId, CancellationToken cancellationToken = default);
    Task<IEnumerable<AccessPermissionDto>> GetDoctorPermissionsAsync(int doctorId, CancellationToken cancellationToken = default);
    Task<AccessPermissionDto> GrantAccessAsync(int patientId, GrantAccessPermissionDto dto, CancellationToken cancellationToken = default);
    Task RevokeAccessAsync(int permissionId, int patientId, CancellationToken cancellationToken = default);
    Task<AccessCheckResultDto> CheckAccessAsync(int patientId, int? doctorId, int? clinicId, CancellationToken cancellationToken = default);
}

