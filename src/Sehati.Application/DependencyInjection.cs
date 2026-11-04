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
        services.AddScoped<IPatientService, PatientService>();
        services.AddScoped<IEmergencyService, EmergencyService>();
        services.AddScoped<IClinicService, ClinicService>();
        services.AddScoped<IDoctorService, DoctorService>();
        services.AddScoped<IAppointmentService, AppointmentService>();
        services.AddScoped<IVisitService, VisitService>();
        services.AddScoped<IPrescriptionService, PrescriptionService>();
        services.AddScoped<IConsentService, ConsentService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IAuditService, AuditService>();

        return services;
    }
}
