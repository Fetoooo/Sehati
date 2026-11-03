using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Patients;

namespace Sehati.Application.Common.Interfaces;

public interface IPatientService
{
    Task<PaginatedList<PatientDto>> GetPatientsAsync(int pageNumber = 1, int pageSize = 10, CancellationToken cancellationToken = default);
    Task<PatientDetailDto> GetPatientByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<PatientDetailDto?> GetPatientByUnifiedIdAsync(string unifiedId, CancellationToken cancellationToken = default);
    Task<IEnumerable<PatientDto>> SearchPatientsAsync(string query, CancellationToken cancellationToken = default);
    Task<PatientDto> CreatePatientAsync(CreatePatientDto dto, CancellationToken cancellationToken = default);
    Task<PatientDto> UpdatePatientAsync(int id, UpdatePatientDto dto, CancellationToken cancellationToken = default);

    // Allergies
    Task<IEnumerable<AllergyDto>> GetAllergiesAsync(int patientId, CancellationToken cancellationToken = default);
    Task<AllergyDto> AddAllergyAsync(int patientId, CreateAllergyDto dto, CancellationToken cancellationToken = default);
    Task DeleteAllergyAsync(int patientId, int allergyId, CancellationToken cancellationToken = default);

    // Medications
    Task<IEnumerable<MedicationDto>> GetMedicationsAsync(int patientId, CancellationToken cancellationToken = default);
    Task<MedicationDto> AddMedicationAsync(int patientId, CreateMedicationDto dto, CancellationToken cancellationToken = default);
    Task DeleteMedicationAsync(int patientId, int medicationId, CancellationToken cancellationToken = default);

    // Tests
    Task<IEnumerable<TestDto>> GetTestsAsync(int patientId, CancellationToken cancellationToken = default);
    Task<TestDto> AddTestAsync(int patientId, CreateTestDto dto, CancellationToken cancellationToken = default);
    Task DeleteTestAsync(int patientId, int testId, CancellationToken cancellationToken = default);

    // Scans
    Task<IEnumerable<ScanDto>> GetScansAsync(int patientId, CancellationToken cancellationToken = default);
    Task<ScanDto> AddScanAsync(int patientId, CreateScanDto dto, CancellationToken cancellationToken = default);
    Task DeleteScanAsync(int patientId, int scanId, CancellationToken cancellationToken = default);
}
