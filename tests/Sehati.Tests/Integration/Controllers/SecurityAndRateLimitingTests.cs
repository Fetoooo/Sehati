using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Sehati.Application.DTOs.Auth;
using Xunit;

namespace Sehati.Tests.Integration.Controllers;

public class SecurityAndRateLimitingTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public SecurityAndRateLimitingTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Response_Includes_Required_Security_Headers()
    {
        // Act
        var response = await _client.GetAsync("/api/health");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Headers.Contains("X-Content-Type-Options").Should().BeTrue();
        response.Headers.GetValues("X-Content-Type-Options").First().Should().Be("nosniff");

        response.Headers.Contains("X-Frame-Options").Should().BeTrue();
        response.Headers.GetValues("X-Frame-Options").First().Should().Be("DENY");

        response.Headers.Contains("Referrer-Policy").Should().BeTrue();
        response.Headers.GetValues("Referrer-Policy").First().Should().Be("strict-origin-when-cross-origin");

        response.Headers.Contains("Content-Security-Policy").Should().BeTrue();
        response.Headers.GetValues("Content-Security-Policy").First().Should().Contain("default-src 'self'");
    }

    [Fact]
    public async Task RateLimiter_Returns_TooManyRequests_When_Auth_Limit_Exceeded()
    {
        // Arrange: Factory with strict limit of 2 requests
        using var strictFactory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.ConfigureAppConfiguration((_, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    { "UseInMemoryDatabase", "true" },
                    { "InMemoryDbName", "RateLimitingTestDb" },
                    { "JwtSettings:Secret", "SehatiIntegrationTestOnlySecretKeyForSigningTokens123456" },
                    { "RateLimiting:Disabled", "false" },
                    { "RateLimiting:AuthPermitLimit", "2" },
                    { "RateLimiting:AuthWindowSeconds", "60" }
                });
            });
        });

        using var client = strictFactory.CreateClient();
        var loginDto = new LoginDto { Identifier = "nonexistent@test.com", Password = "WrongPassword123!" };

        // Act & Assert
        // Request 1: Should be processed (401 Unauthorized or 400 Bad Request, not 429)
        var response1 = await client.PostAsJsonAsync("/api/v1/auth/login", loginDto);
        response1.StatusCode.Should().NotBe(HttpStatusCode.TooManyRequests);

        // Request 2: Should be processed
        var response2 = await client.PostAsJsonAsync("/api/v1/auth/login", loginDto);
        response2.StatusCode.Should().NotBe(HttpStatusCode.TooManyRequests);

        // Request 3: Should exceed limit and return 429 Too Many Requests
        var response3 = await client.PostAsJsonAsync("/api/v1/auth/login", loginDto);
        response3.StatusCode.Should().Be(HttpStatusCode.TooManyRequests);

        var content = await response3.Content.ReadFromJsonAsync<JsonElement>();
        content.GetProperty("statusCode").GetInt32().Should().Be(429);
        content.GetProperty("message").GetString().Should().Contain("Too many requests");
    }
}
