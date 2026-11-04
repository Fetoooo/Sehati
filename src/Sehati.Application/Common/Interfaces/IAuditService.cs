using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Audit;

namespace Sehati.Application.Common.Interfaces;

public interface IAuditService
{
    Task LogActionAsync(
        int userId,
        string action,
        string entityName,
        int? entityId = null,
        int? patientId = null,
        string? ipAddress = null,
        CancellationToken cancellationToken = default);

    Task<PaginatedList<AuditLogDto>> GetAuditLogsAsync(
        AuditLogFilterDto filter,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);
}

