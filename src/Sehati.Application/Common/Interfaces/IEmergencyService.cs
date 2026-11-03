using Sehati.Application.DTOs.Patients;

namespace Sehati.Application.Common.Interfaces;

public interface IEmergencyService
{
    Task<EmergencyProfileDto> GetEmergencyProfileByUnifiedIdAsync(string unifiedId, CancellationToken cancellationToken = default);
    Task<EmergencyProfileDto> GetEmergencyProfileByPatientIdAsync(int patientId, CancellationToken cancellationToken = default);
    Task<EmergencyProfileDto> UpdateEmergencyProfileAsync(int patientId, UpdateEmergencyProfileDto dto, CancellationToken cancellationToken = default);
}
