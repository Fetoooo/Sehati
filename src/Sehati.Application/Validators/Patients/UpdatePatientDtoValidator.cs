using FluentValidation;
using Sehati.Application.DTOs.Patients;

namespace Sehati.Application.Validators.Patients;

public class UpdatePatientDtoValidator : AbstractValidator<UpdatePatientDto>
{
    public UpdatePatientDtoValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required.")
            .MinimumLength(2).WithMessage("Full name must be at least 2 characters.")
            .MaximumLength(150).WithMessage("Full name must not exceed 150 characters.");

        RuleFor(x => x.DateOfBirth)
            .Must(dob => dob < DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("Date of birth must be in the past.");

        RuleFor(x => x.Gender)
            .IsInEnum().WithMessage("Invalid gender specified.");

        When(x => !string.IsNullOrEmpty(x.Phone), () =>
        {
            RuleFor(x => x.Phone)
                .Matches(@"^\+?[0-9]{8,15}$").WithMessage("Phone number must be a valid format between 8 and 15 digits.")
                .MaximumLength(20).WithMessage("Phone number must not exceed 20 characters.");
        });

        RuleFor(x => x.Address)
            .MaximumLength(255).WithMessage("Address must not exceed 255 characters.");

        RuleFor(x => x.EmergencyContact)
            .MaximumLength(100).WithMessage("Emergency contact must not exceed 100 characters.");
    }
}
