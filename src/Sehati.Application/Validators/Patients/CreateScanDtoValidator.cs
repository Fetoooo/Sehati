using FluentValidation;
using Sehati.Application.DTOs.Patients;

namespace Sehati.Application.Validators.Patients;

public class CreateScanDtoValidator : AbstractValidator<CreateScanDto>
{
    public CreateScanDtoValidator()
    {
        RuleFor(x => x.ScanType)
            .NotEmpty().WithMessage("Scan type is required.")
            .MaximumLength(100).WithMessage("Scan type must not exceed 100 characters.");

        RuleFor(x => x.ScanDate)
            .Must(d => d <= DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("Scan date cannot be in the future.");

        RuleFor(x => x.Result)
            .MaximumLength(1000).WithMessage("Result must not exceed 1000 characters.");

        RuleFor(x => x.FileUrl)
            .MaximumLength(500).WithMessage("File URL must not exceed 500 characters.");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Notes must not exceed 500 characters.");
    }
}
