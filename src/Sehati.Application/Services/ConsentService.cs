using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Sehati.Application.Common.Exceptions;
using Sehati.Application.Common.Interfaces;
using Sehati.Application.DTOs.Consent;
using Sehati.Domain.Entities;
using Sehati.Domain.Enums;
using ValidationException = Sehati.Application.Common.Exceptions.ValidationException;

namespace Sehati.Application.Services;

public class ConsentService : IConsentService
{
    private readonly IApplicationDbContext _context;
    private readonly IValidator<GrantAccessPermissionDto> _grantValidator;

    public ConsentService(
        IApplicationDbContext context,
        IValidator<GrantAccessPermissionDto> grantValidator)
    {
        _context = context;
        _grantValidator = grantValidator;
    }

    public async Task<IEnumerable<AccessPermissionDto>> GetPatientPermissionsAsync(int patientId, CancellationToken cancellationToken = default)
    {
        var patientExists = await _context.Patients.AnyAsync(p => p.PatientId == patientId, cancellationToken);
        if (!patientExists)
        {
            throw new NotFoundException("Patient", patientId);
        }

        return await _context.AccessPermissions
            .Include(ap => ap.Patient)
            .Include(ap => ap.Doctor)
            .Include(ap => ap.Clinic)
            .Where(ap => ap.PatientId == patientId)
            .OrderByDescending(ap => ap.GrantedAt)
            .Select(ap => new AccessPermissionDto
            {
                AccessPermissionId = ap.AccessPermissionId,
                PatientId = ap.PatientId,
                PatientName = ap.Patient.FullName,
                UnifiedPatientId = ap.Patient.UnifiedPatientId,
                DoctorId = ap.DoctorId,
                DoctorName = ap.Doctor != null ? ap.Doctor.FullName : null,
                DoctorSpecialty = ap.Doctor != null ? ap.Doctor.Specialty : null,
                ClinicId = ap.ClinicId,
                ClinicName = ap.Clinic != null ? ap.Clinic.ClinicName : null,
                AccessType = ap.AccessType,
                GrantedAt = ap.GrantedAt,
                ExpiresAt = ap.ExpiresAt,
                Status = ap.Status
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<AccessPermissionDto>> GetDoctorPermissionsAsync(int doctorId, CancellationToken cancellationToken = default)
    {
        var doctorExists = await _context.Doctors.AnyAsync(d => d.DoctorId == doctorId, cancellationToken);
        if (!doctorExists)
        {
            throw new NotFoundException("Doctor", doctorId);
        }

        return await _context.AccessPermissions
            .Include(ap => ap.Patient)
            .Include(ap => ap.Doctor)
            .Include(ap => ap.Clinic)
            .Where(ap => ap.DoctorId == doctorId && ap.Status == AccessPermissionStatus.Active)
            .OrderByDescending(ap => ap.GrantedAt)
            .Select(ap => new AccessPermissionDto
            {
                AccessPermissionId = ap.AccessPermissionId,
                PatientId = ap.PatientId,
                PatientName = ap.Patient.FullName,
                UnifiedPatientId = ap.Patient.UnifiedPatientId,
                DoctorId = ap.DoctorId,
                DoctorName = ap.Doctor != null ? ap.Doctor.FullName : null,
                DoctorSpecialty = ap.Doctor != null ? ap.Doctor.Specialty : null,
                ClinicId = ap.ClinicId,
                ClinicName = ap.Clinic != null ? ap.Clinic.ClinicName : null,
                AccessType = ap.AccessType,
                GrantedAt = ap.GrantedAt,
                ExpiresAt = ap.ExpiresAt,
                Status = ap.Status
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<AccessPermissionDto> GrantAccessAsync(int patientId, GrantAccessPermissionDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _grantValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            throw new ValidationException(errors);
        }

        var patient = await _context.Patients.FindAsync(new object[] { patientId }, cancellationToken);
        if (patient == null)
        {
            throw new NotFoundException("Patient", patientId);
        }

        Doctor? doctor = null;
        if (dto.DoctorId.HasValue)
        {
            doctor = await _context.Doctors.FindAsync(new object[] { dto.DoctorId.Value }, cancellationToken);
            if (doctor == null)
            {
                throw new NotFoundException("Doctor", dto.DoctorId.Value);
            }
        }

        Clinic? clinic = null;
        if (dto.ClinicId.HasValue)
        {
            clinic = await _context.Clinics.FindAsync(new object[] { dto.ClinicId.Value }, cancellationToken);
            if (clinic == null)
            {
                throw new NotFoundException("Clinic", dto.ClinicId.Value);
            }
        }

        var existing = await _context.AccessPermissions
            .FirstOrDefaultAsync(ap => ap.PatientId == patientId &&
                                       ap.DoctorId == dto.DoctorId &&
                                       ap.ClinicId == dto.ClinicId &&
                                       ap.Status == AccessPermissionStatus.Active, cancellationToken);

        if (existing != null)
        {
            existing.AccessType = dto.AccessType;
            existing.ExpiresAt = dto.ExpiresAt;
            await _context.SaveChangesAsync(cancellationToken);

            return new AccessPermissionDto
            {
                AccessPermissionId = existing.AccessPermissionId,
                PatientId = patient.PatientId,
                PatientName = patient.FullName,
                UnifiedPatientId = patient.UnifiedPatientId,
                DoctorId = doctor?.DoctorId,
                DoctorName = doctor?.FullName,
                DoctorSpecialty = doctor?.Specialty,
                ClinicId = clinic?.ClinicId,
                ClinicName = clinic?.ClinicName,
                AccessType = existing.AccessType,
                GrantedAt = existing.GrantedAt,
                ExpiresAt = existing.ExpiresAt,
                Status = existing.Status
            };
        }

        var permission = new AccessPermission
        {
            PatientId = patientId,
            DoctorId = dto.DoctorId,
            ClinicId = dto.ClinicId,
            AccessType = dto.AccessType,
            GrantedAt = DateTime.UtcNow,
            ExpiresAt = dto.ExpiresAt,
            Status = AccessPermissionStatus.Active
        };

        _context.AccessPermissions.Add(permission);
        await _context.SaveChangesAsync(cancellationToken);

        return new AccessPermissionDto
        {
            AccessPermissionId = permission.AccessPermissionId,
            PatientId = patient.PatientId,
            PatientName = patient.FullName,
            UnifiedPatientId = patient.UnifiedPatientId,
            DoctorId = doctor?.DoctorId,
            DoctorName = doctor?.FullName,
            DoctorSpecialty = doctor?.Specialty,
            ClinicId = clinic?.ClinicId,
            ClinicName = clinic?.ClinicName,
            AccessType = permission.AccessType,
            GrantedAt = permission.GrantedAt,
            ExpiresAt = permission.ExpiresAt,
            Status = permission.Status
        };
    }

    public async Task RevokeAccessAsync(int permissionId, int patientId, CancellationToken cancellationToken = default)
    {
        var permission = await _context.AccessPermissions
            .FirstOrDefaultAsync(ap => ap.AccessPermissionId == permissionId && ap.PatientId == patientId, cancellationToken);

        if (permission == null)
        {
            throw new NotFoundException($"Access permission {permissionId} was not found for patient {patientId}.");
        }

        permission.Status = AccessPermissionStatus.Revoked;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<AccessCheckResultDto> CheckAccessAsync(int patientId, int? doctorId, int? clinicId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var permissionsQuery = _context.AccessPermissions
            .Where(ap => ap.PatientId == patientId &&
                         ap.Status == AccessPermissionStatus.Active &&
                         (ap.ExpiresAt == null || ap.ExpiresAt > now));

        if (doctorId.HasValue && clinicId.HasValue)
        {
            permissionsQuery = permissionsQuery.Where(ap => ap.DoctorId == doctorId.Value || ap.ClinicId == clinicId.Value);
        }
        else if (doctorId.HasValue)
        {
            permissionsQuery = permissionsQuery.Where(ap => ap.DoctorId == doctorId.Value);
        }
        else if (clinicId.HasValue)
        {
            permissionsQuery = permissionsQuery.Where(ap => ap.ClinicId == clinicId.Value);
        }
        else
        {
            return new AccessCheckResultDto
            {
                HasAccess = false,
                Reason = "Neither doctor nor clinic was specified for access check."
            };
        }

        var matching = await permissionsQuery
            .OrderByDescending(ap => ap.AccessType)
            .FirstOrDefaultAsync(cancellationToken);

        if (matching != null)
        {
            return new AccessCheckResultDto
            {
                HasAccess = true,
                AccessType = matching.AccessType,
                ExpiresAt = matching.ExpiresAt,
                Reason = "Access granted by active patient consent."
            };
        }

        return new AccessCheckResultDto
        {
            HasAccess = false,
            Reason = "No active consent permission found for this doctor or clinic."
        };
    }
}

