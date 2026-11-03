using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Sehati.Application.Common.Exceptions;
using Sehati.Application.Common.Interfaces;
using Sehati.Application.DTOs.Patients;
using Sehati.Domain.Entities;
using Sehati.Domain.Enums;
using ValidationException = Sehati.Application.Common.Exceptions.ValidationException;

namespace Sehati.Application.Services;

public class EmergencyService : IEmergencyService
{
    private readonly IApplicationDbContext _context;
    private readonly IValidator<UpdateEmergencyProfileDto> _validator;

    public EmergencyService(IApplicationDbContext context, IValidator<UpdateEmergencyProfileDto> validator)
    {
        _context = context;
        _validator = validator;
    }

    public async Task<EmergencyProfileDto> GetEmergencyProfileByUnifiedIdAsync(string unifiedId, CancellationToken cancellationToken = default)
    {
        var normalizedId = unifiedId.Trim().ToUpperInvariant();

        var patient = await _context.Patients
            .Include(p => p.EmergencyProfile)
            .Include(p => p.Allergies)
            .Include(p => p.Medications)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UnifiedPatientId.ToUpper() == normalizedId, cancellationToken);

        if (patient == null)
        {
            throw new NotFoundException($"Emergency profile for Unified Patient ID '{unifiedId}' was not found.");
        }

        return MapToEmergencyDto(patient);
    }

    public async Task<EmergencyProfileDto> GetEmergencyProfileByPatientIdAsync(int patientId, CancellationToken cancellationToken = default)
    {
        var patient = await _context.Patients
            .Include(p => p.EmergencyProfile)
            .Include(p => p.Allergies)
            .Include(p => p.Medications)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.PatientId == patientId, cancellationToken);

        if (patient == null)
        {
            throw new NotFoundException(nameof(Patient), patientId);
        }

        return MapToEmergencyDto(patient);
    }

    public async Task<EmergencyProfileDto> UpdateEmergencyProfileAsync(int patientId, UpdateEmergencyProfileDto dto, CancellationToken cancellationToken = default)
    {
        var validation = await _validator.ValidateAsync(dto, cancellationToken);
        if (!validation.IsValid)
        {
            throw new ValidationException(validation.ToDictionary());
        }

        var patient = await _context.Patients
            .Include(p => p.EmergencyProfile)
            .Include(p => p.Allergies)
            .Include(p => p.Medications)
            .FirstOrDefaultAsync(p => p.PatientId == patientId, cancellationToken);

        if (patient == null)
        {
            throw new NotFoundException(nameof(Patient), patientId);
        }

        if (patient.EmergencyProfile == null)
        {
            patient.EmergencyProfile = new EmergencyProfile
            {
                PatientId = patientId,
                LastUpdatedAt = DateTime.UtcNow
            };
            _context.EmergencyProfiles.Add(patient.EmergencyProfile);
        }

        patient.EmergencyProfile.BloodType = dto.BloodType;
        patient.EmergencyProfile.EmergencyNotes = dto.EmergencyNotes?.Trim();
        patient.EmergencyProfile.EmergencyContactName = dto.EmergencyContactName.Trim();
        patient.EmergencyProfile.EmergencyContactPhone = dto.EmergencyContactPhone.Trim();
        patient.EmergencyProfile.LastUpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return MapToEmergencyDto(patient);
    }

    private static EmergencyProfileDto MapToEmergencyDto(Patient patient)
    {
        var profile = patient.EmergencyProfile;
        var activeMedications = patient.Medications
            .Where(m => !m.EndDate.HasValue || m.EndDate.Value >= DateOnly.FromDateTime(DateTime.UtcNow))
            .Select(m => $"{m.MedicationName} ({m.Dosage}, {m.Frequency})")
            .ToList();

        var allergies = patient.Allergies
            .Select(a => string.IsNullOrWhiteSpace(a.Reaction) ? a.AllergyName : $"{a.AllergyName}: {a.Reaction}")
            .ToList();

        return new EmergencyProfileDto
        {
            EmergencyProfileId = profile?.EmergencyProfileId ?? 0,
            PatientId = patient.PatientId,
            UnifiedPatientId = patient.UnifiedPatientId,
            PatientName = patient.FullName,
            DateOfBirth = patient.DateOfBirth,
            Gender = patient.Gender,
            BloodType = profile?.BloodType ?? BloodType.Unknown,
            EmergencyNotes = profile?.EmergencyNotes,
            EmergencyContactName = profile?.EmergencyContactName ?? patient.EmergencyContact ?? string.Empty,
            EmergencyContactPhone = profile?.EmergencyContactPhone ?? string.Empty,
            LastUpdatedAt = profile?.LastUpdatedAt ?? patient.CreatedAt,
            KnownAllergies = allergies,
            ActiveMedications = activeMedications
        };
    }
}
