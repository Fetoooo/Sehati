using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Sehati.Application.Common.Exceptions;
using Sehati.Application.Common.Interfaces;
using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Clinics;
using Sehati.Domain.Entities;
using ValidationException = Sehati.Application.Common.Exceptions.ValidationException;

namespace Sehati.Application.Services;

public class ClinicService : IClinicService
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasherService _passwordHasher;
    private readonly IValidator<CreateClinicDto> _createClinicValidator;
    private readonly IValidator<UpdateClinicDto> _updateClinicValidator;
    private readonly IValidator<AffiliateDoctorDto> _affiliateDoctorValidator;
    private readonly IValidator<CreateReceptionistDto> _createReceptionistValidator;

    public ClinicService(
        IApplicationDbContext context,
        IPasswordHasherService passwordHasher,
        IValidator<CreateClinicDto> createClinicValidator,
        IValidator<UpdateClinicDto> updateClinicValidator,
        IValidator<AffiliateDoctorDto> affiliateDoctorValidator,
        IValidator<CreateReceptionistDto> createReceptionistValidator)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _createClinicValidator = createClinicValidator;
        _updateClinicValidator = updateClinicValidator;
        _affiliateDoctorValidator = affiliateDoctorValidator;
        _createReceptionistValidator = createReceptionistValidator;
    }

    public async Task<PaginatedList<ClinicDto>> GetClinicsAsync(int pageNumber = 1, int pageSize = 10, CancellationToken cancellationToken = default)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Clinics.AsNoTracking();

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new ClinicDto
            {
                ClinicId = c.ClinicId,
                ClinicName = c.ClinicName,
                Specialty = c.Specialty,
                Address = c.Address,
                Phone = c.Phone,
                Email = c.Email,
                WorkingHours = c.WorkingHours,
                Status = c.Status,
                DoctorsCount = c.ClinicDoctors.Count,
                ReceptionistsCount = c.Receptionists.Count,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new PaginatedList<ClinicDto>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<ClinicDetailDto> GetClinicByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var clinic = await _context.Clinics
            .Include(c => c.ClinicDoctors)
                .ThenInclude(cd => cd.Doctor)
            .Include(c => c.Receptionists)
                .ThenInclude(r => r.User)
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.ClinicId == id, cancellationToken);

        if (clinic == null)
        {
            throw new NotFoundException("Clinic", id);
        }

        return new ClinicDetailDto
        {
            ClinicId = clinic.ClinicId,
            ClinicName = clinic.ClinicName,
            Specialty = clinic.Specialty,
            Address = clinic.Address,
            Phone = clinic.Phone,
            Email = clinic.Email,
            WorkingHours = clinic.WorkingHours,
            Status = clinic.Status,
            DoctorsCount = clinic.ClinicDoctors.Count,
            ReceptionistsCount = clinic.Receptionists.Count,
            CreatedAt = clinic.CreatedAt,
            Doctors = clinic.ClinicDoctors.Select(cd => new ClinicDoctorDto
            {
                ClinicDoctorId = cd.ClinicDoctorId,
                ClinicId = cd.ClinicId,
                ClinicName = clinic.ClinicName,
                DoctorId = cd.DoctorId,
                DoctorName = cd.Doctor.FullName,
                Specialty = cd.Doctor.Specialty,
                LicenseNumber = cd.Doctor.LicenseNumber,
                JoinedAt = cd.JoinedAt,
                Status = cd.Status
            }).ToList(),
            Receptionists = clinic.Receptionists.Select(r => new ReceptionistDto
            {
                ReceptionistId = r.ReceptionistId,
                UserId = r.UserId,
                ClinicId = r.ClinicId,
                ClinicName = clinic.ClinicName,
                FullName = r.FullName,
                Email = r.User.Email,
                Phone = r.User.Phone
            }).ToList()
        };
    }

    public async Task<IEnumerable<ClinicDto>> SearchClinicsAsync(string query, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return Enumerable.Empty<ClinicDto>();
        }

        var normalized = query.Trim().ToLower();

        return await _context.Clinics
            .AsNoTracking()
            .Where(c => c.ClinicName.ToLower().Contains(normalized) ||
                        c.Specialty.ToLower().Contains(normalized) ||
                        c.Address.ToLower().Contains(normalized) ||
                        c.Phone.Contains(normalized) ||
                        c.Email.ToLower().Contains(normalized))
            .OrderBy(c => c.ClinicName)
            .Take(50)
            .Select(c => new ClinicDto
            {
                ClinicId = c.ClinicId,
                ClinicName = c.ClinicName,
                Specialty = c.Specialty,
                Address = c.Address,
                Phone = c.Phone,
                Email = c.Email,
                WorkingHours = c.WorkingHours,
                Status = c.Status,
                DoctorsCount = c.ClinicDoctors.Count,
                ReceptionistsCount = c.Receptionists.Count,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<ClinicDto> CreateClinicAsync(CreateClinicDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _createClinicValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            throw new ValidationException(errors);
        }

        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        var exists = await _context.Clinics.AnyAsync(c => c.Email.ToLower() == normalizedEmail || c.ClinicName.ToLower() == dto.ClinicName.Trim().ToLower(), cancellationToken);
        if (exists)
        {
            throw new ConflictException("A clinic with this name or email already exists.");
        }

        var clinic = new Clinic
        {
            ClinicName = dto.ClinicName.Trim(),
            Specialty = dto.Specialty.Trim(),
            Address = dto.Address.Trim(),
            Phone = dto.Phone.Trim(),
            Email = normalizedEmail,
            WorkingHours = dto.WorkingHours.Trim(),
            Status = dto.Status,
            CreatedAt = DateTime.UtcNow
        };

        _context.Clinics.Add(clinic);
        await _context.SaveChangesAsync(cancellationToken);

        return new ClinicDto
        {
            ClinicId = clinic.ClinicId,
            ClinicName = clinic.ClinicName,
            Specialty = clinic.Specialty,
            Address = clinic.Address,
            Phone = clinic.Phone,
            Email = clinic.Email,
            WorkingHours = clinic.WorkingHours,
            Status = clinic.Status,
            DoctorsCount = 0,
            ReceptionistsCount = 0,
            CreatedAt = clinic.CreatedAt
        };
    }

    public async Task<ClinicDto> UpdateClinicAsync(int id, UpdateClinicDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _updateClinicValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            throw new ValidationException(errors);
        }

        var clinic = await _context.Clinics
            .Include(c => c.ClinicDoctors)
            .Include(c => c.Receptionists)
            .FirstOrDefaultAsync(c => c.ClinicId == id, cancellationToken);

        if (clinic == null)
        {
            throw new NotFoundException("Clinic", id);
        }

        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        var emailConflict = await _context.Clinics.AnyAsync(c => c.ClinicId != id && c.Email.ToLower() == normalizedEmail, cancellationToken);
        if (emailConflict)
        {
            throw new ConflictException("Another clinic with this email already exists.");
        }

        clinic.ClinicName = dto.ClinicName.Trim();
        clinic.Specialty = dto.Specialty.Trim();
        clinic.Address = dto.Address.Trim();
        clinic.Phone = dto.Phone.Trim();
        clinic.Email = normalizedEmail;
        clinic.WorkingHours = dto.WorkingHours.Trim();
        clinic.Status = dto.Status;

        await _context.SaveChangesAsync(cancellationToken);

        return new ClinicDto
        {
            ClinicId = clinic.ClinicId,
            ClinicName = clinic.ClinicName,
            Specialty = clinic.Specialty,
            Address = clinic.Address,
            Phone = clinic.Phone,
            Email = clinic.Email,
            WorkingHours = clinic.WorkingHours,
            Status = clinic.Status,
            DoctorsCount = clinic.ClinicDoctors.Count,
            ReceptionistsCount = clinic.Receptionists.Count,
            CreatedAt = clinic.CreatedAt
        };
    }

    public async Task<ClinicDoctorDto> AffiliateDoctorAsync(int clinicId, AffiliateDoctorDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _affiliateDoctorValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            throw new ValidationException(errors);
        }

        var clinic = await _context.Clinics.FindAsync(new object[] { clinicId }, cancellationToken);
        if (clinic == null)
        {
            throw new NotFoundException("Clinic", clinicId);
        }

        var doctor = await _context.Doctors.FindAsync(new object[] { dto.DoctorId }, cancellationToken);
        if (doctor == null)
        {
            throw new NotFoundException("Doctor", dto.DoctorId);
        }

        var existing = await _context.ClinicDoctors
            .FirstOrDefaultAsync(cd => cd.ClinicId == clinicId && cd.DoctorId == dto.DoctorId, cancellationToken);

        if (existing != null)
        {
            existing.Status = dto.Status;
            await _context.SaveChangesAsync(cancellationToken);

            return new ClinicDoctorDto
            {
                ClinicDoctorId = existing.ClinicDoctorId,
                ClinicId = clinic.ClinicId,
                ClinicName = clinic.ClinicName,
                DoctorId = doctor.DoctorId,
                DoctorName = doctor.FullName,
                Specialty = doctor.Specialty,
                LicenseNumber = doctor.LicenseNumber,
                JoinedAt = existing.JoinedAt,
                Status = existing.Status
            };
        }

        var affiliation = new ClinicDoctor
        {
            ClinicId = clinicId,
            DoctorId = dto.DoctorId,
            Status = dto.Status,
            JoinedAt = DateTime.UtcNow
        };

        _context.ClinicDoctors.Add(affiliation);
        await _context.SaveChangesAsync(cancellationToken);

        return new ClinicDoctorDto
        {
            ClinicDoctorId = affiliation.ClinicDoctorId,
            ClinicId = clinic.ClinicId,
            ClinicName = clinic.ClinicName,
            DoctorId = doctor.DoctorId,
            DoctorName = doctor.FullName,
            Specialty = doctor.Specialty,
            LicenseNumber = doctor.LicenseNumber,
            JoinedAt = affiliation.JoinedAt,
            Status = affiliation.Status
        };
    }

    public async Task RemoveDoctorAffiliationAsync(int clinicId, int doctorId, CancellationToken cancellationToken = default)
    {
        var affiliation = await _context.ClinicDoctors
            .FirstOrDefaultAsync(cd => cd.ClinicId == clinicId && cd.DoctorId == doctorId, cancellationToken);

        if (affiliation == null)
        {
            throw new NotFoundException($"Affiliation between Clinic {clinicId} and Doctor {doctorId} was not found.");
        }

        _context.ClinicDoctors.Remove(affiliation);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<ClinicDoctorDto>> GetClinicDoctorsAsync(int clinicId, CancellationToken cancellationToken = default)
    {
        var clinicExists = await _context.Clinics.AnyAsync(c => c.ClinicId == clinicId, cancellationToken);
        if (!clinicExists)
        {
            throw new NotFoundException("Clinic", clinicId);
        }

        return await _context.ClinicDoctors
            .Include(cd => cd.Clinic)
            .Include(cd => cd.Doctor)
            .Where(cd => cd.ClinicId == clinicId)
            .Select(cd => new ClinicDoctorDto
            {
                ClinicDoctorId = cd.ClinicDoctorId,
                ClinicId = cd.ClinicId,
                ClinicName = cd.Clinic.ClinicName,
                DoctorId = cd.DoctorId,
                DoctorName = cd.Doctor.FullName,
                Specialty = cd.Doctor.Specialty,
                LicenseNumber = cd.Doctor.LicenseNumber,
                JoinedAt = cd.JoinedAt,
                Status = cd.Status
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<ReceptionistDto> AddReceptionistAsync(int clinicId, CreateReceptionistDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _createReceptionistValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            throw new ValidationException(errors);
        }

        var clinic = await _context.Clinics.FindAsync(new object[] { clinicId }, cancellationToken);
        if (clinic == null)
        {
            throw new NotFoundException("Clinic", clinicId);
        }

        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        var normalizedPhone = dto.Phone.Trim();

        var emailExists = await _context.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail, cancellationToken);
        if (emailExists)
        {
            throw new ConflictException("Email is already registered.");
        }

        var phoneExists = await _context.Users.AnyAsync(u => u.Phone == normalizedPhone, cancellationToken);
        if (phoneExists)
        {
            throw new ConflictException("Phone number is already registered.");
        }

        var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Receptionist", cancellationToken);
        if (role == null)
        {
            throw new NotFoundException("Role 'Receptionist' was not found.");
        }

        var user = new User
        {
            Email = normalizedEmail,
            Phone = normalizedPhone,
            RoleId = role.RoleId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);

        var receptionist = new Receptionist
        {
            User = user,
            ClinicId = clinicId,
            FullName = dto.FullName.Trim()
        };

        user.Receptionist = receptionist;

        _context.Users.Add(user);
        _context.Receptionists.Add(receptionist);
        await _context.SaveChangesAsync(cancellationToken);

        return new ReceptionistDto
        {
            ReceptionistId = receptionist.ReceptionistId,
            UserId = user.UserId,
            ClinicId = clinic.ClinicId,
            ClinicName = clinic.ClinicName,
            FullName = receptionist.FullName,
            Email = user.Email,
            Phone = user.Phone
        };
    }

    public async Task<IEnumerable<ReceptionistDto>> GetClinicReceptionistsAsync(int clinicId, CancellationToken cancellationToken = default)
    {
        var clinic = await _context.Clinics.FindAsync(new object[] { clinicId }, cancellationToken);
        if (clinic == null)
        {
            throw new NotFoundException("Clinic", clinicId);
        }

        return await _context.Receptionists
            .Include(r => r.User)
            .Include(r => r.Clinic)
            .Where(r => r.ClinicId == clinicId)
            .Select(r => new ReceptionistDto
            {
                ReceptionistId = r.ReceptionistId,
                UserId = r.UserId,
                ClinicId = r.ClinicId,
                ClinicName = r.Clinic.ClinicName,
                FullName = r.FullName,
                Email = r.User.Email,
                Phone = r.User.Phone
            })
            .ToListAsync(cancellationToken);
    }
}

