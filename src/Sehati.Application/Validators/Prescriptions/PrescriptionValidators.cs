using FluentValidation;
using Sehati.Application.DTOs.Prescriptions;

namespace Sehati.Application.Validators.Prescriptions;

public class CreatePrescriptionDtoValidator : AbstractValidator<CreatePrescriptionDto>
{
    public CreatePrescriptionDtoValidator()
    {
        RuleFor(x => x.VisitId)
            .GreaterThan(0).WithMessage("A valid Visit ID is required.");

        RuleFor(x => x.DoctorId)
            .GreaterThan(0).WithMessage("A valid Doctor ID is required.");

        RuleFor(x => x.PatientId)
            .GreaterThan(0).WithMessage("A valid Patient ID is required.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("A prescription must contain at least one medication item.");

        RuleForEach(x => x.Items).SetValidator(new CreatePrescriptionItemDtoValidator());

        When(x => !string.IsNullOrEmpty(x.Notes), () =>
        {
            RuleFor(x => x.Notes)
                .MaximumLength(1000).WithMessage("Notes cannot exceed 1000 characters.");
        });
    }
}

public class CreatePrescriptionItemDtoValidator : AbstractValidator<CreatePrescriptionItemDto>
{
    public CreatePrescriptionItemDtoValidator()
    {
        RuleFor(x => x.MedicationName)
            .NotEmpty().WithMessage("Medication name is required.")
            .MaximumLength(150).WithMessage("Medication name cannot exceed 150 characters.");

        RuleFor(x => x.Dosage)
            .NotEmpty().WithMessage("Dosage is required.")
            .MaximumLength(100).WithMessage("Dosage cannot exceed 100 characters.");

        RuleFor(x => x.Frequency)
            .NotEmpty().WithMessage("Frequency is required.")
            .MaximumLength(100).WithMessage("Frequency cannot exceed 100 characters.");

        RuleFor(x => x.Duration)
            .NotEmpty().WithMessage("Duration is required.")
            .MaximumLength(100).WithMessage("Duration cannot exceed 100 characters.");

        When(x => !string.IsNullOrEmpty(x.Instructions), () =>
        {
            RuleFor(x => x.Instructions)
                .MaximumLength(500).WithMessage("Instructions cannot exceed 500 characters.");
        });
    }
}

