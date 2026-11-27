using Microsoft.AspNetCore.Mvc;
using Sehati.Infrastructure.Persistence;

namespace Sehati.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;
    private readonly SehatiDbContext _dbContext;

    public HealthController(IWebHostEnvironment environment, SehatiDbContext dbContext)
    {
        _environment = environment;
        _dbContext = dbContext;
    }

    /// <summary>
    /// Basic health check endpoint to verify API availability.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Check()
    {
        return HealthResponse("Healthy");
    }

    /// <summary>
    /// Liveness probe. This endpoint deliberately does not depend on external services.
    /// </summary>
    [HttpGet("live")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Live() => HealthResponse("Healthy");

    /// <summary>
    /// Readiness probe. Returns 503 until the configured database is reachable.
    /// </summary>
    [HttpGet("ready")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> Ready(CancellationToken cancellationToken)
    {
        var canConnect = await _dbContext.Database.CanConnectAsync(cancellationToken);
        return canConnect
            ? HealthResponse("Healthy")
            : StatusCode(StatusCodes.Status503ServiceUnavailable, HealthPayload("Unhealthy"));
    }

    private IActionResult HealthResponse(string status) => Ok(HealthPayload(status));

    private object HealthPayload(string status) => new
    {
        status,
        service = "Sehati.API",
        version = "1.0.0",
        environment = _environment.EnvironmentName,
        timestampUtc = DateTime.UtcNow
    };
}
