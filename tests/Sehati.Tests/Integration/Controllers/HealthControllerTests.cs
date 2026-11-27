using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Sehati.Tests.Integration.Controllers;

public class HealthControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public HealthControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetHealth_ReturnsOk_WithHealthyStatus()
    {
        // Act
        var response = await _client.GetAsync("/api/health");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadFromJsonAsync<JsonElement>();
        content.GetProperty("status").GetString().Should().Be("Healthy");
        content.GetProperty("service").GetString().Should().Be("Sehati.API");
        content.GetProperty("version").GetString().Should().Be("1.0.0");
    }

    [Fact]
    public async Task GetLiveness_ReturnsOk_WithoutCheckingDependencies()
    {
        var response = await _client.GetAsync("/api/health/live");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadFromJsonAsync<JsonElement>();
        content.GetProperty("status").GetString().Should().Be("Healthy");
    }

    [Fact]
    public async Task GetReadiness_ReturnsOk_WhenDatabaseIsReachable()
    {
        var response = await _client.GetAsync("/api/health/ready");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadFromJsonAsync<JsonElement>();
        content.GetProperty("status").GetString().Should().Be("Healthy");
    }
}
