using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sehati.Application.Common.Interfaces;
using Sehati.Application.DTOs.Patients;

namespace Sehati.API.Controllers;

[ApiController]
[Route("api/v1/emergency")]
[Produces("application/json")]
public class EmergencyController : ControllerBase
{
    private readonly IEmergencyService _emergencyService;

    public EmergencyController(IEmergencyService emergencyService)
    {
        _emergencyService = emergencyService;
    }

    /// <summary>
    /// Retrieves a patient's emergency medical profile via their Unified Patient ID or QR scan code.
    /// This endpoint is publicly accessible for emergency responders, paramedics, and ER staff.
    /// </summary>
    /// <param name="unifiedId">The patient's Unified Patient ID (format: SH-YYYY-NNNNNN).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("{unifiedId}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(EmergencyProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEmergencyProfileByUnifiedId(string unifiedId, CancellationToken cancellationToken)
    {
        var profile = await _emergencyService.GetEmergencyProfileByUnifiedIdAsync(unifiedId, cancellationToken);
        return Ok(profile);
    }

    /// <summary>
    /// Retrieves a patient's emergency profile by their database Patient ID.
    /// </summary>
    /// <param name="patientId">The database internal Patient ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("patient/{patientId:int}")]
    [Authorize]
    [ProducesResponseType(typeof(EmergencyProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEmergencyProfileByPatientId(int patientId, CancellationToken cancellationToken)
    {
        var profile = await _emergencyService.GetEmergencyProfileByPatientIdAsync(patientId, cancellationToken);
        return Ok(profile);
    }

    /// <summary>
    /// Updates a patient's emergency profile and emergency contact information.
    /// </summary>
    /// <param name="patientId">The database internal Patient ID.</param>
    /// <param name="dto">The updated emergency profile data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpPut("patient/{patientId:int}")]
    [Authorize]
    [ProducesResponseType(typeof(EmergencyProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateEmergencyProfile(int patientId, [FromBody] UpdateEmergencyProfileDto dto, CancellationToken cancellationToken)
    {
        var profile = await _emergencyService.UpdateEmergencyProfileAsync(patientId, dto, cancellationToken);
        return Ok(profile);
    }
}

