using FluentValidation;
using Sehati.Application.DTOs.Consent;

namespace Sehati.Application.Validators.Consent;

public class GrantAccessPermissionDtoValidator : AbstractValidator<GrantAccessPermissionDto>
{
    public GrantAccessPermissionDtoValidator()
    {
        RuleFor(x => x)
            .Must(x => x.DoctorId.HasValue || x.ClinicId.HasValue)
            .WithMessage("Either a Doctor ID or a Clinic ID must be specified.");

        When(x => x.DoctorId.HasValue, () =>
        {
            RuleFor(x => x.DoctorId!.Value)
                .GreaterThan(0).WithMessage("Doctor ID must be greater than 0.");
        });

        When(x => x.ClinicId.HasValue, () =>
        {
            RuleFor(x => x.ClinicId!.Value)
                .GreaterThan(0).WithMessage("Clinic ID must be greater than 0.");
        });

        RuleFor(x => x.AccessType)
            .IsInEnum().WithMessage("Invalid access type.");

        When(x => x.ExpiresAt.HasValue, () =>
        {
            RuleFor(x => x.ExpiresAt!.Value)
                .GreaterThan(DateTime.UtcNow)
                .WithMessage("Expiration date must be in the future.");
        });
    }
}

