using System.Text;
using Microsoft.Extensions.Hosting;

namespace Sehati.API.Middleware;

public sealed class JwtSecretValidationHostedService(IConfiguration configuration) : IHostedService
{
    public Task StartAsync(CancellationToken cancellationToken)
    {
        _ = GetRequiredSecret(configuration);
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    public static string GetRequiredSecret(IConfiguration configuration)
    {
        var secret = configuration["JwtSettings:Secret"];
        if (string.IsNullOrWhiteSpace(secret) || Encoding.UTF8.GetByteCount(secret) < 32)
        {
            throw new InvalidOperationException(
                "JwtSettings:Secret must be configured with a secret of at least 32 bytes. " +
                "Use .NET User Secrets for development or the JwtSettings__Secret environment variable for deployment.");
        }

        return secret;
    }
}
