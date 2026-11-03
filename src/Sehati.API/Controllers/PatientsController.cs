using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sehati.Application.Common.Interfaces;
using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Patients;

namespace Sehati.API.Controllers;

[ApiController]
[Route("api/v1/patients")]
[Produces("application/json")]
public class PatientsController : ControllerBase
{
    private readonly IPatientService _patientService;
    private readonly IEmergencyService _emergencyService;

    public PatientsController(IPatientService patientService, IEmergencyService emergencyService)
    {
        _patientService = patientService;
        _emergencyService = emergencyService;
    }

    /// <summary>
    /// Retrieves a paginated list of registered patients.
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Doctor,Receptionist,ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(typeof(PaginatedList<PatientDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPatients([FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
    {
        var result = await _patientService.GetPatientsAsync(page, pageSize, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves a comprehensive patient profile by Patient ID.
    /// </summary>
    [HttpGet("{id:int}")]
    [Authorize]
    [ProducesResponseType(typeof(PatientDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPatientById(int id, CancellationToken cancellationToken)
    {
        var patient = await _patientService.GetPatientByIdAsync(id, cancellationToken);
        return Ok(patient);
    }

    /// <summary>
    /// Retrieves a patient profile by Unified Patient ID (format: SH-YYYY-NNNNNN).
    /// </summary>
    [HttpGet("unified/{unifiedId}")]
    [Authorize]
    [ProducesResponseType(typeof(PatientDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPatientByUnifiedId(string unifiedId, CancellationToken cancellationToken)
    {
        var patient = await _patientService.GetPatientByUnifiedIdAsync(unifiedId, cancellationToken);
        if (patient == null)
        {
            return NotFound(new { message = $"Patient with Unified ID '{unifiedId}' was not found." });
        }
        return Ok(patient);
    }

    /// <summary>
    /// Searches patients by Unified ID, phone number, or full name.
    /// </summary>
    [HttpGet("search")]
    [Authorize(Roles = "Doctor,Receptionist,ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(typeof(IEnumerable<PatientDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search([FromQuery] string q, CancellationToken cancellationToken)
    {
        var results = await _patientService.SearchPatientsAsync(q, cancellationToken);
        return Ok(results);
    }

    /// <summary>
    /// Registers a new patient into the central registry and issues a Unified Patient ID.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Receptionist,ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(typeof(PatientDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreatePatient([FromBody] CreatePatientDto dto, CancellationToken cancellationToken)
    {
        var patient = await _patientService.CreatePatientAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetPatientById), new { id = patient.PatientId }, patient);
    }

    /// <summary>
    /// Updates patient demographic details.
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize]
    [ProducesResponseType(typeof(PatientDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePatient(int id, [FromBody] UpdatePatientDto dto, CancellationToken cancellationToken)
    {
        var patient = await _patientService.UpdatePatientAsync(id, dto, cancellationToken);
        return Ok(patient);
    }

    // Allergies Sub-Resource
    [HttpGet("{id:int}/allergies")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<AllergyDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAllergies(int id, CancellationToken cancellationToken)
    {
        var allergies = await _patientService.GetAllergiesAsync(id, cancellationToken);
        return Ok(allergies);
    }

    [HttpPost("{id:int}/allergies")]
    [Authorize(Roles = "Doctor,ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(typeof(AllergyDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddAllergy(int id, [FromBody] CreateAllergyDto dto, CancellationToken cancellationToken)
    {
        var allergy = await _patientService.AddAllergyAsync(id, dto, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, allergy);
    }

    [HttpDelete("{id:int}/allergies/{allergyId:int}")]
    [Authorize(Roles = "Doctor,ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAllergy(int id, int allergyId, CancellationToken cancellationToken)
    {
        await _patientService.DeleteAllergyAsync(id, allergyId, cancellationToken);
        return NoContent();
    }

    // Medications Sub-Resource
    [HttpGet("{id:int}/medications")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<MedicationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMedications(int id, CancellationToken cancellationToken)
    {
        var medications = await _patientService.GetMedicationsAsync(id, cancellationToken);
        return Ok(medications);
    }

    [HttpPost("{id:int}/medications")]
    [Authorize(Roles = "Doctor,ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(typeof(MedicationDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddMedication(int id, [FromBody] CreateMedicationDto dto, CancellationToken cancellationToken)
    {
        var medication = await _patientService.AddMedicationAsync(id, dto, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, medication);
    }

    [HttpDelete("{id:int}/medications/{medicationId:int}")]
    [Authorize(Roles = "Doctor,ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMedication(int id, int medicationId, CancellationToken cancellationToken)
    {
        await _patientService.DeleteMedicationAsync(id, medicationId, cancellationToken);
        return NoContent();
    }

    // Lab Tests Sub-Resource
    [HttpGet("{id:int}/tests")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<TestDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTests(int id, CancellationToken cancellationToken)
    {
        var tests = await _patientService.GetTestsAsync(id, cancellationToken);
        return Ok(tests);
    }

    [HttpPost("{id:int}/tests")]
    [Authorize(Roles = "Doctor,ClinicAdmin,SystemAdmin,Receptionist")]
    [ProducesResponseType(typeof(TestDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddTest(int id, [FromBody] CreateTestDto dto, CancellationToken cancellationToken)
    {
        var test = await _patientService.AddTestAsync(id, dto, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, test);
    }

    [HttpDelete("{id:int}/tests/{testId:int}")]
    [Authorize(Roles = "Doctor,ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTest(int id, int testId, CancellationToken cancellationToken)
    {
        await _patientService.DeleteTestAsync(id, testId, cancellationToken);
        return NoContent();
    }

    // Scans Sub-Resource
    [HttpGet("{id:int}/scans")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<ScanDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetScans(int id, CancellationToken cancellationToken)
    {
        var scans = await _patientService.GetScansAsync(id, cancellationToken);
        return Ok(scans);
    }

    [HttpPost("{id:int}/scans")]
    [Authorize(Roles = "Doctor,ClinicAdmin,SystemAdmin,Receptionist")]
    [ProducesResponseType(typeof(ScanDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddScan(int id, [FromBody] CreateScanDto dto, CancellationToken cancellationToken)
    {
        var scan = await _patientService.AddScanAsync(id, dto, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, scan);
    }

    [HttpDelete("{id:int}/scans/{scanId:int}")]
    [Authorize(Roles = "Doctor,ClinicAdmin,SystemAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteScan(int id, int scanId, CancellationToken cancellationToken)
    {
        await _patientService.DeleteScanAsync(id, scanId, cancellationToken);
        return NoContent();
    }

    // Emergency Profile Update
    [HttpPut("{id:int}/emergency-profile")]
    [Authorize]
    [ProducesResponseType(typeof(EmergencyProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateEmergencyProfile(int id, [FromBody] UpdateEmergencyProfileDto dto, CancellationToken cancellationToken)
    {
        var profile = await _emergencyService.UpdateEmergencyProfileAsync(id, dto, cancellationToken);
        return Ok(profile);
    }
}

