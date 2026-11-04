using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Doctors;

namespace Sehati.Application.Common.Interfaces;

public interface IDoctorService
{
    Task<PaginatedList<DoctorDto>> GetDoctorsAsync(int pageNumber = 1, int pageSize = 10, string? specialty = null, CancellationToken cancellationToken = default);
    Task<DoctorDetailDto> GetDoctorByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<DoctorDto>> SearchDoctorsAsync(string query, CancellationToken cancellationToken = default);
    Task<DoctorDto> CreateDoctorAsync(CreateDoctorDto dto, CancellationToken cancellationToken = default);
    Task<DoctorDto> UpdateDoctorAsync(int id, UpdateDoctorDto dto, CancellationToken cancellationToken = default);
    Task<DoctorScheduleDto> GetDoctorScheduleAsync(int doctorId, DateOnly date, CancellationToken cancellationToken = default);
}

