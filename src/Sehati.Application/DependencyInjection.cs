using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Sehati.Application.Common.Interfaces;
using Sehati.Application.Services;

namespace Sehati.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        services.AddScoped<IAuthService, AuthService>();

        return services;
    }
}
