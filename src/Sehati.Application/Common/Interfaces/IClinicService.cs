using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Clinics;

namespace Sehati.Application.Common.Interfaces;

public interface IClinicService
{
    Task<PaginatedList<ClinicDto>> GetClinicsAsync(int pageNumber = 1, int pageSize = 10, CancellationToken cancellationToken = default);
    Task<ClinicDetailDto> GetClinicByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ClinicDto>> SearchClinicsAsync(string query, CancellationToken cancellationToken = default);
    Task<ClinicDto> CreateClinicAsync(CreateClinicDto dto, CancellationToken cancellationToken = default);
    Task<ClinicDto> UpdateClinicAsync(int id, UpdateClinicDto dto, CancellationToken cancellationToken = default);
    Task<ClinicDoctorDto> AffiliateDoctorAsync(int clinicId, AffiliateDoctorDto dto, CancellationToken cancellationToken = default);
    Task RemoveDoctorAffiliationAsync(int clinicId, int doctorId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ClinicDoctorDto>> GetClinicDoctorsAsync(int clinicId, CancellationToken cancellationToken = default);
    Task<ReceptionistDto> AddReceptionistAsync(int clinicId, CreateReceptionistDto dto, CancellationToken cancellationToken = default);
    Task<IEnumerable<ReceptionistDto>> GetClinicReceptionistsAsync(int clinicId, CancellationToken cancellationToken = default);
}

