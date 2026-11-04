using FluentValidation;
using Sehati.Application.DTOs.Notifications;

namespace Sehati.Application.Validators.Notifications;

public class CreateNotificationDtoValidator : AbstractValidator<CreateNotificationDto>
{
    public CreateNotificationDtoValidator()
    {
        RuleFor(x => x.UserId)
            .GreaterThan(0).WithMessage("A valid User ID is required.");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(150).WithMessage("Title cannot exceed 150 characters.");

        RuleFor(x => x.Message)
            .NotEmpty().WithMessage("Message is required.")
            .MaximumLength(1000).WithMessage("Message cannot exceed 1000 characters.");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Invalid notification type.");
    }
}

