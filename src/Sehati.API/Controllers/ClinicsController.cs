using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sehati.Application.Common.Interfaces;
using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Clinics;

namespace Sehati.API.Controllers;

[ApiController]
[Route("api/v1/clinics")]
[Produces("application/json")]
public class ClinicsController : ControllerBase
{
    private readonly IClinicService _clinicService;

    public ClinicsController(IClinicService clinicService)
    {
        _clinicService = clinicService;
    }

    /// <summary>
    /// Retrieves a paginated list of clinics.
    /// </summary>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(PaginatedList<ClinicDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetClinics([FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
    {
        var result = await _clinicService.GetClinicsAsync(page, pageSize, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves a clinic by its ID including its affiliated doctors and staff.
    /// </summary>
    [HttpGet("{id:int}")]
    [Authorize]
    [ProducesResponseType(typeof(ClinicDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetClinicById(int id, CancellationToken cancellationToken)
    {
        var result = await _clinicService.GetClinicByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Searches clinics by name, specialty, address, phone, or email.
    /// </summary>
    [HttpGet("search")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<ClinicDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SearchClinics([FromQuery] string q, CancellationToken cancellationToken)
    {
        var result = await _clinicService.SearchClinicsAsync(q, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Creates a new clinic.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(typeof(ClinicDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateClinic([FromBody] CreateClinicDto dto, CancellationToken cancellationToken)
    {
        var result = await _clinicService.CreateClinicAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetClinicById), new { id = result.ClinicId }, result);
    }

    /// <summary>
    /// Updates clinic details.
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(typeof(ClinicDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateClinic(int id, [FromBody] UpdateClinicDto dto, CancellationToken cancellationToken)
    {
        var result = await _clinicService.UpdateClinicAsync(id, dto, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Affiliates a doctor with this clinic.
    /// </summary>
    [HttpPost("{id:int}/doctors")]
    [Authorize(Roles = "ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(typeof(ClinicDoctorDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AffiliateDoctor(int id, [FromBody] AffiliateDoctorDto dto, CancellationToken cancellationToken)
    {
        var result = await _clinicService.AffiliateDoctorAsync(id, dto, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Removes a doctor's affiliation with this clinic.
    /// </summary>
    [HttpDelete("{id:int}/doctors/{doctorId:int}")]
    [Authorize(Roles = "ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveDoctorAffiliation(int id, int doctorId, CancellationToken cancellationToken)
    {
        await _clinicService.RemoveDoctorAffiliationAsync(id, doctorId, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Retrieves all doctors affiliated with this clinic.
    /// </summary>
    [HttpGet("{id:int}/doctors")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<ClinicDoctorDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetClinicDoctors(int id, CancellationToken cancellationToken)
    {
        var result = await _clinicService.GetClinicDoctorsAsync(id, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Onboards a new receptionist for this clinic.
    /// </summary>
    [HttpPost("{id:int}/receptionists")]
    [Authorize(Roles = "ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(typeof(ReceptionistDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> AddReceptionist(int id, [FromBody] CreateReceptionistDto dto, CancellationToken cancellationToken)
    {
        var result = await _clinicService.AddReceptionistAsync(id, dto, cancellationToken);
        return CreatedAtAction(nameof(GetClinicById), new { id }, result);
    }

    /// <summary>
    /// Retrieves all receptionists assigned to this clinic.
    /// </summary>
    [HttpGet("{id:int}/receptionists")]
    [Authorize(Roles = "ClinicAdmin,SystemAdmin,Receptionist")]
    [ProducesResponseType(typeof(IEnumerable<ReceptionistDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetClinicReceptionists(int id, CancellationToken cancellationToken)
    {
        var result = await _clinicService.GetClinicReceptionistsAsync(id, cancellationToken);
        return Ok(result);
    }
}

