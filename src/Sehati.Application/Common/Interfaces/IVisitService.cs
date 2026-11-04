using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Visits;

namespace Sehati.Application.Common.Interfaces;

public interface IVisitService
{
    Task<PaginatedList<VisitDto>> GetVisitsAsync(
        int? patientId = null,
        int? doctorId = null,
        int? clinicId = null,
        int pageNumber = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default);

    Task<VisitDetailDto> GetVisitByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<VisitDto> CreateVisitAsync(CreateVisitDto dto, CancellationToken cancellationToken = default);
    Task<VisitDto> UpdateVisitAsync(int id, UpdateVisitDto dto, CancellationToken cancellationToken = default);

    // Diagnoses
    Task<IEnumerable<DiagnosisDto>> GetVisitDiagnosesAsync(int visitId, CancellationToken cancellationToken = default);
    Task<DiagnosisDto> AddDiagnosisAsync(int visitId, CreateDiagnosisDto dto, CancellationToken cancellationToken = default);
    Task DeleteDiagnosisAsync(int visitId, int diagnosisId, CancellationToken cancellationToken = default);

    // Treatments
    Task<IEnumerable<TreatmentDto>> GetVisitTreatmentsAsync(int visitId, CancellationToken cancellationToken = default);
    Task<TreatmentDto> AddTreatmentAsync(int visitId, CreateTreatmentDto dto, CancellationToken cancellationToken = default);
    Task DeleteTreatmentAsync(int visitId, int treatmentId, CancellationToken cancellationToken = default);
}

