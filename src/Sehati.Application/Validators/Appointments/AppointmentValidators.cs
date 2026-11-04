using FluentValidation;
using Sehati.Application.DTOs.Appointments;

namespace Sehati.Application.Validators.Appointments;

public class CreateAppointmentDtoValidator : AbstractValidator<CreateAppointmentDto>
{
    public CreateAppointmentDtoValidator()
    {
        RuleFor(x => x.PatientId)
            .GreaterThan(0).WithMessage("A valid Patient ID is required.");

        RuleFor(x => x.DoctorId)
            .GreaterThan(0).WithMessage("A valid Doctor ID is required.");

        RuleFor(x => x.ClinicId)
            .GreaterThan(0).WithMessage("A valid Clinic ID is required.");

        RuleFor(x => x.AppointmentDate)
            .NotEmpty().WithMessage("Appointment date is required.")
            .GreaterThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow.Date))
            .WithMessage("Appointment date cannot be in the past.");

        RuleFor(x => x.StartTime)
            .NotEmpty().WithMessage("Start time is required.");

        RuleFor(x => x.EndTime)
            .NotEmpty().WithMessage("End time is required.")
            .Must((dto, endTime) => endTime > dto.StartTime)
            .WithMessage("End time must be after start time.");

        When(x => !string.IsNullOrEmpty(x.Notes), () =>
        {
            RuleFor(x => x.Notes)
                .MaximumLength(500).WithMessage("Notes cannot exceed 500 characters.");
        });
    }
}

public class UpdateAppointmentStatusDtoValidator : AbstractValidator<UpdateAppointmentStatusDto>
{
    public UpdateAppointmentStatusDtoValidator()
    {
        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid appointment status.");

        When(x => !string.IsNullOrEmpty(x.Notes), () =>
        {
            RuleFor(x => x.Notes)
                .MaximumLength(500).WithMessage("Notes cannot exceed 500 characters.");
        });
    }
}

public class RescheduleAppointmentDtoValidator : AbstractValidator<RescheduleAppointmentDto>
{
    public RescheduleAppointmentDtoValidator()
    {
        RuleFor(x => x.AppointmentDate)
            .NotEmpty().WithMessage("Appointment date is required.")
            .GreaterThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow.Date))
            .WithMessage("Appointment date cannot be in the past.");

        RuleFor(x => x.StartTime)
            .NotEmpty().WithMessage("Start time is required.");

        RuleFor(x => x.EndTime)
            .NotEmpty().WithMessage("End time is required.")
            .Must((dto, endTime) => endTime > dto.StartTime)
            .WithMessage("End time must be after start time.");

        When(x => !string.IsNullOrEmpty(x.Notes), () =>
        {
            RuleFor(x => x.Notes)
                .MaximumLength(500).WithMessage("Notes cannot exceed 500 characters.");
        });
    }
}

public class CreateFollowUpDtoValidator : AbstractValidator<CreateFollowUpDto>
{
    public CreateFollowUpDtoValidator()
    {
        RuleFor(x => x.PatientId)
            .GreaterThan(0).WithMessage("A valid Patient ID is required.");

        RuleFor(x => x.DoctorId)
            .GreaterThan(0).WithMessage("A valid Doctor ID is required.");

        RuleFor(x => x.VisitId)
            .GreaterThan(0).WithMessage("A valid Visit ID is required.");

        RuleFor(x => x.FollowUpDate)
            .NotEmpty().WithMessage("Follow-up date is required.")
            .GreaterThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow.Date))
            .WithMessage("Follow-up date cannot be in the past.");

        When(x => !string.IsNullOrEmpty(x.Notes), () =>
        {
            RuleFor(x => x.Notes)
                .MaximumLength(500).WithMessage("Notes cannot exceed 500 characters.");
        });
    }
}

public class UpdateFollowUpStatusDtoValidator : AbstractValidator<UpdateFollowUpStatusDto>
{
    public UpdateFollowUpStatusDtoValidator()
    {
        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid follow-up status.");

        When(x => !string.IsNullOrEmpty(x.Notes), () =>
        {
            RuleFor(x => x.Notes)
                .MaximumLength(500).WithMessage("Notes cannot exceed 500 characters.");
        });
    }
}

