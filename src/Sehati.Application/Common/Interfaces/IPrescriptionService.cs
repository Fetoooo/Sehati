using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Prescriptions;

namespace Sehati.Application.Common.Interfaces;

public interface IPrescriptionService
{
    Task<PaginatedList<PrescriptionDto>> GetPrescriptionsAsync(
        int? patientId = null,
        int? doctorId = null,
        int? visitId = null,
        int pageNumber = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default);

    Task<PrescriptionDetailDto> GetPrescriptionByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<PrescriptionDetailDto> CreatePrescriptionAsync(CreatePrescriptionDto dto, CancellationToken cancellationToken = default);
    Task<PrescriptionItemDto> AddPrescriptionItemAsync(int prescriptionId, CreatePrescriptionItemDto dto, CancellationToken cancellationToken = default);
    Task DeletePrescriptionItemAsync(int prescriptionId, int itemId, CancellationToken cancellationToken = default);
}

