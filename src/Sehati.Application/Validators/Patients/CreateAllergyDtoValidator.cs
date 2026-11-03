using FluentValidation;
using Sehati.Application.DTOs.Patients;

namespace Sehati.Application.Validators.Patients;

public class CreateAllergyDtoValidator : AbstractValidator<CreateAllergyDto>
{
    public CreateAllergyDtoValidator()
    {
        RuleFor(x => x.AllergyName)
            .NotEmpty().WithMessage("Allergy name is required.")
            .MaximumLength(100).WithMessage("Allergy name must not exceed 100 characters.");

        RuleFor(x => x.Reaction)
            .NotEmpty().WithMessage("Reaction description is required.")
            .MaximumLength(200).WithMessage("Reaction must not exceed 200 characters.");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Notes must not exceed 500 characters.");
    }
}

