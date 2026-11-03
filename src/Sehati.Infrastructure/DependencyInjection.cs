using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Sehati.Application.Common.Interfaces;
using Sehati.Infrastructure.Persistence;
using Sehati.Infrastructure.Services;

namespace Sehati.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var useInMemory = configuration.GetValue<bool>("UseInMemoryDatabase");

        if (useInMemory)
        {
            var dbName = configuration["InMemoryDbName"] ?? "SehatiInMemoryDb";
            services.AddDbContext<SehatiDbContext>(options =>
                options.UseInMemoryDatabase(dbName));
        }
        else
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

            services.AddDbContext<SehatiDbContext>(options =>
                options.UseSqlServer(connectionString, sqlOptions =>
                {
                    sqlOptions.MigrationsAssembly(typeof(SehatiDbContext).Assembly.FullName);
                    sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 5,
                        maxRetryDelay: TimeSpan.FromSeconds(30),
                        errorNumbersToAdd: null);
                }));
        }

        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<SehatiDbContext>());
        services.AddSingleton<IUnifiedPatientIdGenerator, UnifiedPatientIdGenerator>();
        services.AddSingleton<IPasswordHasherService, PasswordHasherService>();
        services.AddSingleton<ITokenService, TokenService>();

        return services;
    }
}
