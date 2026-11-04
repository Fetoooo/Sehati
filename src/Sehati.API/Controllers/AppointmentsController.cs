using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sehati.Application.Common.Interfaces;
using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Appointments;

namespace Sehati.API.Controllers;

[ApiController]
[Route("api/v1/appointments")]
[Produces("application/json")]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _appointmentService;

    public AppointmentsController(IAppointmentService appointmentService)
    {
        _appointmentService = appointmentService;
    }

    /// <summary>
    /// Retrieves a paginated list of appointments with optional filtering.
    /// </summary>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(PaginatedList<AppointmentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAppointments(
        [FromQuery] int? clinicId,
        [FromQuery] int? doctorId,
        [FromQuery] int? patientId,
        [FromQuery] DateOnly? date,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await _appointmentService.GetAppointmentsAsync(clinicId, doctorId, patientId, date, page, pageSize, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves an appointment by ID.
    /// </summary>
    [HttpGet("{id:int}")]
    [Authorize]
    [ProducesResponseType(typeof(AppointmentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAppointmentById(int id, CancellationToken cancellationToken)
    {
        var result = await _appointmentService.GetAppointmentByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Schedules a new appointment with double-booking prevention.
    /// </summary>
    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(AppointmentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentDto dto, CancellationToken cancellationToken)
    {
        var result = await _appointmentService.CreateAppointmentAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetAppointmentById), new { id = result.AppointmentId }, result);
    }

    /// <summary>
    /// Updates an appointment's status (e.g. Confirmed, Completed, Cancelled, NoShow).
    /// </summary>
    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = "Doctor,Receptionist,ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(typeof(AppointmentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAppointmentStatus(int id, [FromBody] UpdateAppointmentStatusDto dto, CancellationToken cancellationToken)
    {
        var result = await _appointmentService.UpdateAppointmentStatusAsync(id, dto, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Reschedules an appointment to a new date and time.
    /// </summary>
    [HttpPut("{id:int}/reschedule")]
    [Authorize]
    [ProducesResponseType(typeof(AppointmentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> RescheduleAppointment(int id, [FromBody] RescheduleAppointmentDto dto, CancellationToken cancellationToken)
    {
        var result = await _appointmentService.RescheduleAppointmentAsync(id, dto, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves the daily queue order of patients for a given clinic and date.
    /// </summary>
    [HttpGet("queue")]
    [Authorize(Roles = "Doctor,Receptionist,ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(typeof(IEnumerable<QueueItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDailyQueue([FromQuery] int clinicId, [FromQuery] DateOnly date, CancellationToken cancellationToken)
    {
        var result = await _appointmentService.GetDailyQueueAsync(clinicId, date, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves clinical follow-ups with optional filters for patient and doctor.
    /// </summary>
    [HttpGet("follow-ups")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<FollowUpDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFollowUps([FromQuery] int? patientId, [FromQuery] int? doctorId, CancellationToken cancellationToken)
    {
        var result = await _appointmentService.GetFollowUpsAsync(patientId, doctorId, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves a follow-up record by ID.
    /// </summary>
    [HttpGet("follow-ups/{id:int}")]
    [Authorize]
    [ProducesResponseType(typeof(FollowUpDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetFollowUpById(int id, CancellationToken cancellationToken)
    {
        var result = await _appointmentService.GetFollowUpByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Schedules a clinical follow-up for a patient visit.
    /// </summary>
    [HttpPost("follow-ups")]
    [Authorize(Roles = "Doctor,ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(typeof(FollowUpDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateFollowUp([FromBody] CreateFollowUpDto dto, CancellationToken cancellationToken)
    {
        var result = await _appointmentService.CreateFollowUpAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetFollowUpById), new { id = result.FollowUpId }, result);
    }

    /// <summary>
    /// Updates the status of a follow-up (e.g. Completed, Cancelled).
    /// </summary>
    [HttpPatch("follow-ups/{id:int}/status")]
    [Authorize(Roles = "Doctor,ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(typeof(FollowUpDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateFollowUpStatus(int id, [FromBody] UpdateFollowUpStatusDto dto, CancellationToken cancellationToken)
    {
        var result = await _appointmentService.UpdateFollowUpStatusAsync(id, dto, cancellationToken);
        return Ok(result);
    }
}

