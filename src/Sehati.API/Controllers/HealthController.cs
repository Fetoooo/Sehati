using Microsoft.AspNetCore.Mvc;

namespace Sehati.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;

    public HealthController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    /// <summary>
    /// Basic health check endpoint to verify API availability.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Check()
    {
        return Ok(new
        {
            status = "Healthy",
            service = "Sehati.API",
            version = "1.0.0",
            environment = _environment.EnvironmentName,
            timestampUtc = DateTime.UtcNow
        });
    }
}
