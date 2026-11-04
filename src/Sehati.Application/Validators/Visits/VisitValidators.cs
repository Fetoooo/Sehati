using FluentValidation;
using Sehati.Application.DTOs.Visits;

namespace Sehati.Application.Validators.Visits;

public class CreateVisitDtoValidator : AbstractValidator<CreateVisitDto>
{
    public CreateVisitDtoValidator()
    {
        RuleFor(x => x.PatientId)
            .GreaterThan(0).WithMessage("A valid Patient ID is required.");

        RuleFor(x => x.DoctorId)
            .GreaterThan(0).WithMessage("A valid Doctor ID is required.");

        RuleFor(x => x.ClinicId)
            .GreaterThan(0).WithMessage("A valid Clinic ID is required.");

        RuleFor(x => x.ChiefComplaint)
            .NotEmpty().WithMessage("Chief complaint is required.")
            .MaximumLength(255).WithMessage("Chief complaint cannot exceed 255 characters.");

        When(x => !string.IsNullOrEmpty(x.Notes), () =>
        {
            RuleFor(x => x.Notes)
                .MaximumLength(1000).WithMessage("Notes cannot exceed 1000 characters.");
        });

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid visit status.");
    }
}

public class UpdateVisitDtoValidator : AbstractValidator<UpdateVisitDto>
{
    public UpdateVisitDtoValidator()
    {
        When(x => !string.IsNullOrEmpty(x.ChiefComplaint), () =>
        {
            RuleFor(x => x.ChiefComplaint)
                .MaximumLength(255).WithMessage("Chief complaint cannot exceed 255 characters.");
        });

        When(x => !string.IsNullOrEmpty(x.Notes), () =>
        {
            RuleFor(x => x.Notes)
                .MaximumLength(1000).WithMessage("Notes cannot exceed 1000 characters.");
        });

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid visit status.");
    }
}

public class CreateDiagnosisDtoValidator : AbstractValidator<CreateDiagnosisDto>
{
    public CreateDiagnosisDtoValidator()
    {
        RuleFor(x => x.DiagnosisName)
            .NotEmpty().WithMessage("Diagnosis name is required.")
            .MaximumLength(150).WithMessage("Diagnosis name cannot exceed 150 characters.");

        When(x => !string.IsNullOrEmpty(x.Description), () =>
        {
            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters.");
        });
    }
}

public class CreateTreatmentDtoValidator : AbstractValidator<CreateTreatmentDto>
{
    public CreateTreatmentDtoValidator()
    {
        RuleFor(x => x.TreatmentDescription)
            .NotEmpty().WithMessage("Treatment description is required.")
            .MaximumLength(255).WithMessage("Treatment description cannot exceed 255 characters.");

        When(x => x.EndDate.HasValue, () =>
        {
            RuleFor(x => x.EndDate!.Value)
                .GreaterThanOrEqualTo(x => x.StartDate)
                .WithMessage("Treatment end date must be on or after start date.");
        });

        When(x => !string.IsNullOrEmpty(x.Instructions), () =>
        {
            RuleFor(x => x.Instructions)
                .MaximumLength(500).WithMessage("Instructions cannot exceed 500 characters.");
        });
    }
}

