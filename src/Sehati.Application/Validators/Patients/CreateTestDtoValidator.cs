using FluentValidation;
using Sehati.Application.DTOs.Patients;

namespace Sehati.Application.Validators.Patients;

public class CreateTestDtoValidator : AbstractValidator<CreateTestDto>
{
    public CreateTestDtoValidator()
    {
        RuleFor(x => x.TestName)
            .NotEmpty().WithMessage("Test name is required.")
            .MaximumLength(150).WithMessage("Test name must not exceed 150 characters.");

        RuleFor(x => x.TestDate)
            .Must(d => d <= DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("Test date cannot be in the future.");

        RuleFor(x => x.Result)
            .MaximumLength(1000).WithMessage("Result must not exceed 1000 characters.");

        RuleFor(x => x.FileUrl)
            .MaximumLength(500).WithMessage("File URL must not exceed 500 characters.");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Notes must not exceed 500 characters.");
    }
}
