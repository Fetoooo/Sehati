using FluentValidation;
using Sehati.Application.DTOs.Patients;

namespace Sehati.Application.Validators.Patients;

public class UpdateEmergencyProfileDtoValidator : AbstractValidator<UpdateEmergencyProfileDto>
{
    public UpdateEmergencyProfileDtoValidator()
    {
        RuleFor(x => x.BloodType)
            .IsInEnum().WithMessage("Invalid blood type.");

        RuleFor(x => x.EmergencyContactName)
            .MaximumLength(100).WithMessage("Emergency contact name must not exceed 100 characters.");

        When(x => !string.IsNullOrEmpty(x.EmergencyContactPhone), () =>
        {
            RuleFor(x => x.EmergencyContactPhone)
                .Matches(@"^\+?[0-9]{8,15}$").WithMessage("Emergency contact phone must be between 8 and 15 digits.")
                .MaximumLength(20).WithMessage("Emergency contact phone must not exceed 20 characters.");
        });

        RuleFor(x => x.EmergencyNotes)
            .MaximumLength(1000).WithMessage("Emergency notes must not exceed 1000 characters.");
    }
}

