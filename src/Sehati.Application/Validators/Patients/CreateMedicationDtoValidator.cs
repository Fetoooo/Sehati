using FluentValidation;
using Sehati.Application.DTOs.Patients;

namespace Sehati.Application.Validators.Patients;

public class CreateMedicationDtoValidator : AbstractValidator<CreateMedicationDto>
{
    public CreateMedicationDtoValidator()
    {
        RuleFor(x => x.MedicationName)
            .NotEmpty().WithMessage("Medication name is required.")
            .MaximumLength(150).WithMessage("Medication name must not exceed 150 characters.");

        RuleFor(x => x.Dosage)
            .NotEmpty().WithMessage("Dosage is required.")
            .MaximumLength(100).WithMessage("Dosage must not exceed 100 characters.");

        RuleFor(x => x.Frequency)
            .NotEmpty().WithMessage("Frequency is required.")
            .MaximumLength(100).WithMessage("Frequency must not exceed 100 characters.");

        When(x => x.EndDate.HasValue, () =>
        {
            RuleFor(x => x.EndDate!.Value)
                .GreaterThanOrEqualTo(x => x.StartDate)
                .WithMessage("End date must be on or after start date.");
        });

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Notes must not exceed 500 characters.");
    }
}

