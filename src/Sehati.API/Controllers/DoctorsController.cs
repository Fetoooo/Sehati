using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sehati.Application.Common.Interfaces;
using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Doctors;

namespace Sehati.API.Controllers;

[ApiController]
[Route("api/v1/doctors")]
[Produces("application/json")]
public class DoctorsController : ControllerBase
{
    private readonly IDoctorService _doctorService;

    public DoctorsController(IDoctorService doctorService)
    {
        _doctorService = doctorService;
    }

    /// <summary>
    /// Retrieves a paginated list of doctors with optional specialty filtering.
    /// </summary>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(PaginatedList<DoctorDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDoctors([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? specialty = null, CancellationToken cancellationToken = default)
    {
        var result = await _doctorService.GetDoctorsAsync(page, pageSize, specialty, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves full doctor profile details including affiliated clinics.
    /// </summary>
    [HttpGet("{id:int}")]
    [Authorize]
    [ProducesResponseType(typeof(DoctorDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDoctorById(int id, CancellationToken cancellationToken)
    {
        var result = await _doctorService.GetDoctorByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Searches doctors by name, specialty, license number, phone, or email.
    /// </summary>
    [HttpGet("search")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<DoctorDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SearchDoctors([FromQuery] string q, CancellationToken cancellationToken)
    {
        var result = await _doctorService.SearchDoctorsAsync(q, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Onboards a new doctor along with their credentials and optional clinic affiliation.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(typeof(DoctorDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateDoctor([FromBody] CreateDoctorDto dto, CancellationToken cancellationToken)
    {
        var result = await _doctorService.CreateDoctorAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetDoctorById), new { id = result.DoctorId }, result);
    }

    /// <summary>
    /// Updates doctor professional details.
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Doctor,ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(typeof(DoctorDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateDoctor(int id, [FromBody] UpdateDoctorDto dto, CancellationToken cancellationToken)
    {
        var result = await _doctorService.UpdateDoctorAsync(id, dto, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves a doctor's schedule slots for a specific day.
    /// </summary>
    [HttpGet("{id:int}/schedule")]
    [Authorize]
    [ProducesResponseType(typeof(DoctorScheduleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDoctorSchedule(int id, [FromQuery] DateOnly date, CancellationToken cancellationToken)
    {
        var result = await _doctorService.GetDoctorScheduleAsync(id, date, cancellationToken);
        return Ok(result);
    }
}

