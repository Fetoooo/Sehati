using Microsoft.EntityFrameworkCore;
using Sehati.Application.Common.Interfaces;
using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Audit;
using Sehati.Domain.Entities;

namespace Sehati.Application.Services;

public class AuditService : IAuditService
{
    private readonly IApplicationDbContext _context;

    public AuditService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task LogActionAsync(
        int userId,
        string action,
        string entityName,
        int? entityId = null,
        int? patientId = null,
        string? ipAddress = null,
        CancellationToken cancellationToken = default)
    {
        var log = new AuditLog
        {
            UserId = userId,
            Action = action,
            EntityName = entityName,
            EntityId = entityId,
            PatientId = patientId,
            IPAddress = string.IsNullOrWhiteSpace(ipAddress) ? "127.0.0.1" : ipAddress.Trim(),
            Timestamp = DateTime.UtcNow
        };

        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<PaginatedList<AuditLogDto>> GetAuditLogsAsync(
        AuditLogFilterDto filter,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.AuditLogs
            .Include(a => a.User)
                .ThenInclude(u => u.Role)
            .Include(a => a.Patient)
            .AsNoTracking();

        if (filter.UserId.HasValue)
        {
            query = query.Where(a => a.UserId == filter.UserId.Value);
        }

        if (filter.PatientId.HasValue)
        {
            query = query.Where(a => a.PatientId == filter.PatientId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.EntityName))
        {
            var entityName = filter.EntityName.Trim().ToLower();
            query = query.Where(a => a.EntityName.ToLower().Contains(entityName));
        }

        if (!string.IsNullOrWhiteSpace(filter.Action))
        {
            var action = filter.Action.Trim().ToLower();
            query = query.Where(a => a.Action.ToLower().Contains(action));
        }

        if (filter.FromDate.HasValue)
        {
            query = query.Where(a => a.Timestamp >= filter.FromDate.Value);
        }

        if (filter.ToDate.HasValue)
        {
            query = query.Where(a => a.Timestamp <= filter.ToDate.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AuditLogDto
            {
                AuditLogId = a.AuditLogId,
                UserId = a.UserId,
                UserEmail = a.User.Email,
                UserRole = a.User.Role.RoleName,
                PatientId = a.PatientId,
                PatientName = a.Patient != null ? a.Patient.FullName : null,
                UnifiedPatientId = a.Patient != null ? a.Patient.UnifiedPatientId : null,
                Action = a.Action,
                EntityName = a.EntityName,
                EntityId = a.EntityId,
                Timestamp = a.Timestamp,
                IPAddress = a.IPAddress
            })
            .ToListAsync(cancellationToken);

        return new PaginatedList<AuditLogDto>(items, totalCount, pageNumber, pageSize);
    }
}

