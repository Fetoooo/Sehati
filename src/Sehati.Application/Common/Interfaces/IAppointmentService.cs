using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Appointments;

namespace Sehati.Application.Common.Interfaces;

public interface IAppointmentService
{
    Task<PaginatedList<AppointmentDto>> GetAppointmentsAsync(
        int? clinicId = null,
        int? doctorId = null,
        int? patientId = null,
        DateOnly? date = null,
        int pageNumber = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default);

    Task<AppointmentDto> GetAppointmentByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<AppointmentDto> CreateAppointmentAsync(CreateAppointmentDto dto, CancellationToken cancellationToken = default);
    Task<AppointmentDto> UpdateAppointmentStatusAsync(int id, UpdateAppointmentStatusDto dto, CancellationToken cancellationToken = default);
    Task<AppointmentDto> RescheduleAppointmentAsync(int id, RescheduleAppointmentDto dto, CancellationToken cancellationToken = default);
    Task<IEnumerable<QueueItemDto>> GetDailyQueueAsync(int clinicId, DateOnly date, CancellationToken cancellationToken = default);

    // Follow-ups
    Task<IEnumerable<FollowUpDto>> GetFollowUpsAsync(int? patientId = null, int? doctorId = null, CancellationToken cancellationToken = default);
    Task<FollowUpDto> GetFollowUpByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<FollowUpDto> CreateFollowUpAsync(CreateFollowUpDto dto, CancellationToken cancellationToken = default);
    Task<FollowUpDto> UpdateFollowUpStatusAsync(int id, UpdateFollowUpStatusDto dto, CancellationToken cancellationToken = default);
}

