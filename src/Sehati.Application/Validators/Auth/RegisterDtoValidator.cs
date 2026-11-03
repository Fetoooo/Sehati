using FluentValidation;
using Sehati.Application.DTOs.Auth;

namespace Sehati.Application.Validators.Auth;

public class RegisterDtoValidator : AbstractValidator<RegisterDto>
{
    private static readonly string[] AllowedRoles = { "Patient", "Doctor", "Receptionist", "ClinicAdmin", "SystemAdmin" };

    public RegisterDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.")
            .MaximumLength(150).WithMessage("Email must not exceed 150 characters.");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone number is required.")
            .Matches(@"^\+?[0-9]{8,15}$").WithMessage("Phone number must be a valid format between 8 and 15 digits (e.g. +201012345678).")
            .MaximumLength(20).WithMessage("Phone number must not exceed 20 characters.");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required.")
            .MinimumLength(2).WithMessage("Full name must be at least 2 characters.")
            .MaximumLength(150).WithMessage("Full name must not exceed 150 characters.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters long.")
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches(@"[0-9]").WithMessage("Password must contain at least one digit.")
            .Must(p => !string.IsNullOrEmpty(p) && p.Any(ch => !char.IsLetterOrDigit(ch)))
            .WithMessage("Password must contain at least one special character.");

        RuleFor(x => x.RoleName)
            .NotEmpty().WithMessage("Role is required.")
            .Must(role => AllowedRoles.Contains(role))
            .WithMessage($"Role must be one of the following: {string.Join(", ", AllowedRoles)}");

        RuleFor(x => x.DateOfBirth)
            .Must(dob => !dob.HasValue || dob.Value < DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("Date of birth must be in the past.");

        When(x => x.RoleName == "Doctor", () =>
        {
            RuleFor(x => x.Specialty)
                .NotEmpty().WithMessage("Specialty is required for doctor registration.")
                .MaximumLength(100).WithMessage("Specialty must not exceed 100 characters.");

            RuleFor(x => x.LicenseNumber)
                .NotEmpty().WithMessage("License number is required for doctor registration.")
                .MaximumLength(50).WithMessage("License number must not exceed 50 characters.");
        });
    }
}
