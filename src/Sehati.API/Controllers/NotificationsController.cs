using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sehati.Application.Common.Interfaces;
using Sehati.Application.DTOs.Notifications;

namespace Sehati.API.Controllers;

[ApiController]
[Route("api/v1/notifications")]
[Produces("application/json")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        return claim != null && int.TryParse(claim.Value, out var id) ? id : 0;
    }

    /// <summary>
    /// Retrieves notifications for the authenticated user.
    /// </summary>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<NotificationDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNotifications([FromQuery] bool? unreadOnly, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var result = await _notificationService.GetUserNotificationsAsync(userId, unreadOnly, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Sends a new system or clinical notification to a user.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Doctor,Receptionist,ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(typeof(NotificationDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateNotification([FromBody] CreateNotificationDto dto, CancellationToken cancellationToken)
    {
        var result = await _notificationService.CreateNotificationAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetNotifications), new { id = result.NotificationId }, result);
    }

    /// <summary>
    /// Marks a specific notification as read.
    /// </summary>
    [HttpPatch("{id:int}/read")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkAsRead(int id, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        await _notificationService.MarkAsReadAsync(id, userId, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Marks all notifications for the authenticated user as read.
    /// </summary>
    [HttpPost("read-all")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        await _notificationService.MarkAllAsReadAsync(userId, cancellationToken);
        return NoContent();
    }
}

