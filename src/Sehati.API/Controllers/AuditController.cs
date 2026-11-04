using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sehati.Application.Common.Interfaces;
using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Audit;

namespace Sehati.API.Controllers;

[ApiController]
[Route("api/v1/audit")]
[Produces("application/json")]
public class AuditController : ControllerBase
{
    private readonly IAuditService _auditService;

    public AuditController(IAuditService auditService)
    {
        _auditService = auditService;
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        return claim != null && int.TryParse(claim.Value, out var id) ? id : 0;
    }

    /// <summary>
    /// Retrieves paginated system audit trail logs with filtering options.
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(typeof(PaginatedList<AuditLogDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] int? userId,
        [FromQuery] int? patientId,
        [FromQuery] string? entityName,
        [FromQuery] string? action,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var filter = new AuditLogFilterDto
        {
            UserId = userId,
            PatientId = patientId,
            EntityName = entityName,
            Action = action,
            FromDate = fromDate,
            ToDate = toDate
        };

        var result = await _auditService.GetAuditLogsAsync(filter, page, pageSize, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Explicitly logs an immutable audit event for security tracking.
    /// </summary>
    [HttpPost("log")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> LogAuditEvent(
        [FromQuery] string action,
        [FromQuery] string entityName,
        [FromQuery] int? entityId,
        [FromQuery] int? patientId,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";

        await _auditService.LogActionAsync(userId, action, entityName, entityId, patientId, ip, cancellationToken);
        return Ok(new { message = "Audit event recorded successfully." });
    }
}

