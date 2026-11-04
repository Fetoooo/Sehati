using FluentValidation;
using Sehati.Application.DTOs.Clinics;

namespace Sehati.Application.Validators.Clinics;

public class CreateClinicDtoValidator : AbstractValidator<CreateClinicDto>
{
    public CreateClinicDtoValidator()
    {
        RuleFor(x => x.ClinicName)
            .NotEmpty().WithMessage("Clinic name is required.")
            .MaximumLength(150).WithMessage("Clinic name cannot exceed 150 characters.");

        RuleFor(x => x.Specialty)
            .NotEmpty().WithMessage("Clinic specialty is required.")
            .MaximumLength(100).WithMessage("Specialty cannot exceed 100 characters.");

        RuleFor(x => x.Address)
            .NotEmpty().WithMessage("Address is required.")
            .MaximumLength(255).WithMessage("Address cannot exceed 255 characters.");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone number is required.")
            .Matches(@"^\+?[1-9]\d{7,14}$").WithMessage("Phone number must be a valid international phone format.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.")
            .MaximumLength(150).WithMessage("Email cannot exceed 150 characters.");

        RuleFor(x => x.WorkingHours)
            .NotEmpty().WithMessage("Working hours are required.")
            .MaximumLength(100).WithMessage("Working hours description cannot exceed 100 characters.");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid clinic status.");
    }
}

public class UpdateClinicDtoValidator : AbstractValidator<UpdateClinicDto>
{
    public UpdateClinicDtoValidator()
    {
        RuleFor(x => x.ClinicName)
            .NotEmpty().WithMessage("Clinic name is required.")
            .MaximumLength(150).WithMessage("Clinic name cannot exceed 150 characters.");

        RuleFor(x => x.Specialty)
            .NotEmpty().WithMessage("Clinic specialty is required.")
            .MaximumLength(100).WithMessage("Specialty cannot exceed 100 characters.");

        RuleFor(x => x.Address)
            .NotEmpty().WithMessage("Address is required.")
            .MaximumLength(255).WithMessage("Address cannot exceed 255 characters.");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone number is required.")
            .Matches(@"^\+?[1-9]\d{7,14}$").WithMessage("Phone number must be a valid international phone format.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.")
            .MaximumLength(150).WithMessage("Email cannot exceed 150 characters.");

        RuleFor(x => x.WorkingHours)
            .NotEmpty().WithMessage("Working hours are required.")
            .MaximumLength(100).WithMessage("Working hours description cannot exceed 100 characters.");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid clinic status.");
    }
}

public class AffiliateDoctorDtoValidator : AbstractValidator<AffiliateDoctorDto>
{
    public AffiliateDoctorDtoValidator()
    {
        RuleFor(x => x.DoctorId)
            .GreaterThan(0).WithMessage("A valid Doctor ID is required.");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid clinic affiliation status.");
    }
}

public class CreateReceptionistDtoValidator : AbstractValidator<CreateReceptionistDto>
{
    public CreateReceptionistDtoValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required.")
            .MaximumLength(100).WithMessage("Full name cannot exceed 100 characters.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.")
            .MaximumLength(150).WithMessage("Email cannot exceed 150 characters.");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone number is required.")
            .Matches(@"^\+?[1-9]\d{7,14}$").WithMessage("Phone number must be a valid international phone format.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters long.")
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches(@"\d").WithMessage("Password must contain at least one digit.")
            .Must(p => !string.IsNullOrEmpty(p) && p.Any(ch => !char.IsLetterOrDigit(ch)))
            .WithMessage("Password must contain at least one special character.");
    }
}

