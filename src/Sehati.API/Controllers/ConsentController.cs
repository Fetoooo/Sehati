using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sehati.Application.Common.Interfaces;
using Sehati.Application.DTOs.Consent;

namespace Sehati.API.Controllers;

[ApiController]
[Route("api/v1/consent")]
[Produces("application/json")]
public class ConsentController : ControllerBase
{
    private readonly IConsentService _consentService;

    public ConsentController(IConsentService consentService)
    {
        _consentService = consentService;
    }

    /// <summary>
    /// Retrieves all access permissions configured by a patient.
    /// </summary>
    [HttpGet("patient/{patientId:int}")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<AccessPermissionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPatientPermissions(int patientId, CancellationToken cancellationToken)
    {
        var result = await _consentService.GetPatientPermissionsAsync(patientId, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves all active access permissions granted to a doctor.
    /// </summary>
    [HttpGet("doctor/{doctorId:int}")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<AccessPermissionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDoctorPermissions(int doctorId, CancellationToken cancellationToken)
    {
        var result = await _consentService.GetDoctorPermissionsAsync(doctorId, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Grants or updates access permission to a doctor or clinic for a patient's records.
    /// </summary>
    [HttpPost("patient/{patientId:int}")]
    [Authorize]
    [ProducesResponseType(typeof(AccessPermissionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GrantAccess(int patientId, [FromBody] GrantAccessPermissionDto dto, CancellationToken cancellationToken)
    {
        var result = await _consentService.GrantAccessAsync(patientId, dto, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Revokes an existing access permission.
    /// </summary>
    [HttpPost("patient/{patientId:int}/revoke/{permissionId:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RevokeAccess(int patientId, int permissionId, CancellationToken cancellationToken)
    {
        await _consentService.RevokeAccessAsync(permissionId, patientId, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Evaluates if a doctor or clinic currently has active consent to view patient records.
    /// </summary>
    [HttpPost("check")]
    [Authorize]
    [ProducesResponseType(typeof(AccessCheckResultDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> CheckAccess([FromBody] CheckAccessDto dto, CancellationToken cancellationToken)
    {
        var result = await _consentService.CheckAccessAsync(dto.PatientId, dto.DoctorId, dto.ClinicId, cancellationToken);
        return Ok(result);
    }
}

