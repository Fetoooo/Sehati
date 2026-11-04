using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sehati.Application.Common.Interfaces;
using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Visits;

namespace Sehati.API.Controllers;

[ApiController]
[Route("api/v1/visits")]
[Produces("application/json")]
public class VisitsController : ControllerBase
{
    private readonly IVisitService _visitService;

    public VisitsController(IVisitService visitService)
    {
        _visitService = visitService;
    }

    /// <summary>
    /// Retrieves a paginated list of clinical visits/encounters.
    /// </summary>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(PaginatedList<VisitDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetVisits(
        [FromQuery] int? patientId,
        [FromQuery] int? doctorId,
        [FromQuery] int? clinicId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await _visitService.GetVisitsAsync(patientId, doctorId, clinicId, page, pageSize, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves full clinical visit details including diagnoses, treatments, and prescriptions.
    /// </summary>
    [HttpGet("{id:int}")]
    [Authorize]
    [ProducesResponseType(typeof(VisitDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetVisitById(int id, CancellationToken cancellationToken)
    {
        var result = await _visitService.GetVisitByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Records a new clinical visit/encounter.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Doctor,ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(typeof(VisitDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateVisit([FromBody] CreateVisitDto dto, CancellationToken cancellationToken)
    {
        var result = await _visitService.CreateVisitAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetVisitById), new { id = result.VisitId }, result);
    }

    /// <summary>
    /// Updates clinical visit notes, chief complaint, or completion status.
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Doctor,ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(typeof(VisitDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateVisit(int id, [FromBody] UpdateVisitDto dto, CancellationToken cancellationToken)
    {
        var result = await _visitService.UpdateVisitAsync(id, dto, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves all diagnoses documented for a visit.
    /// </summary>
    [HttpGet("{id:int}/diagnoses")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<DiagnosisDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetVisitDiagnoses(int id, CancellationToken cancellationToken)
    {
        var result = await _visitService.GetVisitDiagnosesAsync(id, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Documents a new diagnosis for a visit.
    /// </summary>
    [HttpPost("{id:int}/diagnoses")]
    [Authorize(Roles = "Doctor,ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(typeof(DiagnosisDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddDiagnosis(int id, [FromBody] CreateDiagnosisDto dto, CancellationToken cancellationToken)
    {
        var result = await _visitService.AddDiagnosisAsync(id, dto, cancellationToken);
        return CreatedAtAction(nameof(GetVisitById), new { id }, result);
    }

    /// <summary>
    /// Deletes a documented diagnosis from a visit.
    /// </summary>
    [HttpDelete("{id:int}/diagnoses/{diagnosisId:int}")]
    [Authorize(Roles = "Doctor,ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteDiagnosis(int id, int diagnosisId, CancellationToken cancellationToken)
    {
        await _visitService.DeleteDiagnosisAsync(id, diagnosisId, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Retrieves all treatments recorded for a visit.
    /// </summary>
    [HttpGet("{id:int}/treatments")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<TreatmentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetVisitTreatments(int id, CancellationToken cancellationToken)
    {
        var result = await _visitService.GetVisitTreatmentsAsync(id, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Adds a treatment plan to a visit.
    /// </summary>
    [HttpPost("{id:int}/treatments")]
    [Authorize(Roles = "Doctor,ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(typeof(TreatmentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddTreatment(int id, [FromBody] CreateTreatmentDto dto, CancellationToken cancellationToken)
    {
        var result = await _visitService.AddTreatmentAsync(id, dto, cancellationToken);
        return CreatedAtAction(nameof(GetVisitById), new { id }, result);
    }

    /// <summary>
    /// Deletes a treatment record from a visit.
    /// </summary>
    [HttpDelete("{id:int}/treatments/{treatmentId:int}")]
    [Authorize(Roles = "Doctor,ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTreatment(int id, int treatmentId, CancellationToken cancellationToken)
    {
        await _visitService.DeleteTreatmentAsync(id, treatmentId, cancellationToken);
        return NoContent();
    }
}

