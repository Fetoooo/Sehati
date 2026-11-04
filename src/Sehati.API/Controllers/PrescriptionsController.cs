using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sehati.Application.Common.Interfaces;
using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Prescriptions;

namespace Sehati.API.Controllers;

[ApiController]
[Route("api/v1/prescriptions")]
[Produces("application/json")]
public class PrescriptionsController : ControllerBase
{
    private readonly IPrescriptionService _prescriptionService;

    public PrescriptionsController(IPrescriptionService prescriptionService)
    {
        _prescriptionService = prescriptionService;
    }

    /// <summary>
    /// Retrieves a paginated list of digital prescriptions.
    /// </summary>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(PaginatedList<PrescriptionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPrescriptions(
        [FromQuery] int? patientId,
        [FromQuery] int? doctorId,
        [FromQuery] int? visitId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await _prescriptionService.GetPrescriptionsAsync(patientId, doctorId, visitId, page, pageSize, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves full prescription details with medication items and instructions.
    /// </summary>
    [HttpGet("{id:int}")]
    [Authorize]
    [ProducesResponseType(typeof(PrescriptionDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPrescriptionById(int id, CancellationToken cancellationToken)
    {
        var result = await _prescriptionService.GetPrescriptionByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Builds and issues a new digital prescription.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Doctor,ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(typeof(PrescriptionDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreatePrescription([FromBody] CreatePrescriptionDto dto, CancellationToken cancellationToken)
    {
        var result = await _prescriptionService.CreatePrescriptionAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetPrescriptionById), new { id = result.PrescriptionId }, result);
    }

    /// <summary>
    /// Adds a medication item to an existing prescription.
    /// </summary>
    [HttpPost("{id:int}/items")]
    [Authorize(Roles = "Doctor,ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(typeof(PrescriptionItemDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddPrescriptionItem(int id, [FromBody] CreatePrescriptionItemDto dto, CancellationToken cancellationToken)
    {
        var result = await _prescriptionService.AddPrescriptionItemAsync(id, dto, cancellationToken);
        return CreatedAtAction(nameof(GetPrescriptionById), new { id }, result);
    }

    /// <summary>
    /// Deletes a medication item from a prescription.
    /// </summary>
    [HttpDelete("{id:int}/items/{itemId:int}")]
    [Authorize(Roles = "Doctor,ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePrescriptionItem(int id, int itemId, CancellationToken cancellationToken)
    {
        await _prescriptionService.DeletePrescriptionItemAsync(id, itemId, cancellationToken);
        return NoContent();
    }
}

