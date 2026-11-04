using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Sehati.Application.Common.Exceptions;
using Sehati.Application.Common.Interfaces;
using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Clinics;
using Sehati.Application.DTOs.Doctors;
using Sehati.Domain.Entities;
using Sehati.Domain.Enums;
using ValidationException = Sehati.Application.Common.Exceptions.ValidationException;

namespace Sehati.Application.Services;

public class DoctorService : IDoctorService
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasherService _passwordHasher;
    private readonly IValidator<CreateDoctorDto> _createDoctorValidator;
    private readonly IValidator<UpdateDoctorDto> _updateDoctorValidator;

    public DoctorService(
        IApplicationDbContext context,
        IPasswordHasherService passwordHasher,
        IValidator<CreateDoctorDto> createDoctorValidator,
        IValidator<UpdateDoctorDto> updateDoctorValidator)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _createDoctorValidator = createDoctorValidator;
        _updateDoctorValidator = updateDoctorValidator;
    }

    public async Task<PaginatedList<DoctorDto>> GetDoctorsAsync(int pageNumber = 1, int pageSize = 10, string? specialty = null, CancellationToken cancellationToken = default)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Doctors.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(specialty))
        {
            var trimmedSpecialty = specialty.Trim().ToLower();
            query = query.Where(d => d.Specialty.ToLower().Contains(trimmedSpecialty));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(d => d.FullName)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new DoctorDto
            {
                DoctorId = d.DoctorId,
                UserId = d.UserId,
                FullName = d.FullName,
                Specialty = d.Specialty,
                LicenseNumber = d.LicenseNumber,
                Phone = d.Phone,
                Email = d.Email,
                AffiliatedClinicsCount = d.ClinicDoctors.Count
            })
            .ToListAsync(cancellationToken);

        return new PaginatedList<DoctorDto>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<DoctorDetailDto> GetDoctorByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var doctor = await _context.Doctors
            .Include(d => d.ClinicDoctors)
                .ThenInclude(cd => cd.Clinic)
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.DoctorId == id, cancellationToken);

        if (doctor == null)
        {
            throw new NotFoundException("Doctor", id);
        }

        return new DoctorDetailDto
        {
            DoctorId = doctor.DoctorId,
            UserId = doctor.UserId,
            FullName = doctor.FullName,
            Specialty = doctor.Specialty,
            LicenseNumber = doctor.LicenseNumber,
            Phone = doctor.Phone,
            Email = doctor.Email,
            AffiliatedClinicsCount = doctor.ClinicDoctors.Count,
            AffiliatedClinics = doctor.ClinicDoctors.Select(cd => new ClinicDoctorDto
            {
                ClinicDoctorId = cd.ClinicDoctorId,
                ClinicId = cd.ClinicId,
                ClinicName = cd.Clinic.ClinicName,
                DoctorId = doctor.DoctorId,
                DoctorName = doctor.FullName,
                Specialty = doctor.Specialty,
                LicenseNumber = doctor.LicenseNumber,
                JoinedAt = cd.JoinedAt,
                Status = cd.Status
            }).ToList()
        };
    }

    public async Task<IEnumerable<DoctorDto>> SearchDoctorsAsync(string query, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return Enumerable.Empty<DoctorDto>();
        }

        var normalized = query.Trim().ToLower();

        return await _context.Doctors
            .AsNoTracking()
            .Where(d => d.FullName.ToLower().Contains(normalized) ||
                        d.Specialty.ToLower().Contains(normalized) ||
                        d.LicenseNumber.ToLower().Contains(normalized) ||
                        d.Phone.Contains(normalized) ||
                        d.Email.ToLower().Contains(normalized))
            .OrderBy(d => d.FullName)
            .Take(50)
            .Select(d => new DoctorDto
            {
                DoctorId = d.DoctorId,
                UserId = d.UserId,
                FullName = d.FullName,
                Specialty = d.Specialty,
                LicenseNumber = d.LicenseNumber,
                Phone = d.Phone,
                Email = d.Email,
                AffiliatedClinicsCount = d.ClinicDoctors.Count
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<DoctorDto> CreateDoctorAsync(CreateDoctorDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _createDoctorValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            throw new ValidationException(errors);
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

        if (dto.InitialClinicId.HasValue)
        {
            var clinicExists = await _context.Clinics.AnyAsync(c => c.ClinicId == dto.InitialClinicId.Value, cancellationToken);
            if (!clinicExists)
            {
                throw new NotFoundException("Clinic", dto.InitialClinicId.Value);
            }
        }

        var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Doctor", cancellationToken);
        if (role == null)
        {
            throw new NotFoundException("Role 'Doctor' was not found.");
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

        var doctor = new Doctor
        {
            User = user,
            FullName = dto.FullName.Trim(),
            Specialty = dto.Specialty.Trim(),
            LicenseNumber = dto.LicenseNumber.Trim(),
            Phone = normalizedPhone,
            Email = normalizedEmail
        };

        user.Doctor = doctor;
        _context.Users.Add(user);
        _context.Doctors.Add(doctor);

        if (dto.InitialClinicId.HasValue)
        {
            var affiliation = new ClinicDoctor
            {
                Doctor = doctor,
                ClinicId = dto.InitialClinicId.Value,
                Status = ClinicStatus.Active,
                JoinedAt = DateTime.UtcNow
            };
            _context.ClinicDoctors.Add(affiliation);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new DoctorDto
        {
            DoctorId = doctor.DoctorId,
            UserId = user.UserId,
            FullName = doctor.FullName,
            Specialty = doctor.Specialty,
            LicenseNumber = doctor.LicenseNumber,
            Phone = doctor.Phone,
            Email = doctor.Email,
            AffiliatedClinicsCount = dto.InitialClinicId.HasValue ? 1 : 0
        };
    }

    public async Task<DoctorDto> UpdateDoctorAsync(int id, UpdateDoctorDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _updateDoctorValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            throw new ValidationException(errors);
        }

        var doctor = await _context.Doctors
            .Include(d => d.User)
            .Include(d => d.ClinicDoctors)
            .FirstOrDefaultAsync(d => d.DoctorId == id, cancellationToken);

        if (doctor == null)
        {
            throw new NotFoundException("Doctor", id);
        }

        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        var normalizedPhone = dto.Phone.Trim();

        var emailConflict = await _context.Users.AnyAsync(u => u.UserId != doctor.UserId && u.Email.ToLower() == normalizedEmail, cancellationToken);
        if (emailConflict)
        {
            throw new ConflictException("Another user with this email already exists.");
        }

        var phoneConflict = await _context.Users.AnyAsync(u => u.UserId != doctor.UserId && u.Phone == normalizedPhone, cancellationToken);
        if (phoneConflict)
        {
            throw new ConflictException("Another user with this phone number already exists.");
        }

        doctor.FullName = dto.FullName.Trim();
        doctor.Specialty = dto.Specialty.Trim();
        doctor.LicenseNumber = dto.LicenseNumber.Trim();
        doctor.Phone = normalizedPhone;
        doctor.Email = normalizedEmail;

        if (doctor.User != null)
        {
            doctor.User.Email = normalizedEmail;
            doctor.User.Phone = normalizedPhone;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new DoctorDto
        {
            DoctorId = doctor.DoctorId,
            UserId = doctor.UserId,
            FullName = doctor.FullName,
            Specialty = doctor.Specialty,
            LicenseNumber = doctor.LicenseNumber,
            Phone = doctor.Phone,
            Email = doctor.Email,
            AffiliatedClinicsCount = doctor.ClinicDoctors.Count
        };
    }

    public async Task<DoctorScheduleDto> GetDoctorScheduleAsync(int doctorId, DateOnly date, CancellationToken cancellationToken = default)
    {
        var doctor = await _context.Doctors
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.DoctorId == doctorId, cancellationToken);

        if (doctor == null)
        {
            throw new NotFoundException("Doctor", doctorId);
        }

        var appointments = await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Clinic)
            .Where(a => a.DoctorId == doctorId && a.AppointmentDate == date)
            .OrderBy(a => a.StartTime)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return new DoctorScheduleDto
        {
            DoctorId = doctor.DoctorId,
            DoctorName = doctor.FullName,
            Specialty = doctor.Specialty,
            Date = date,
            Slots = appointments.Select(a => new DoctorScheduleSlotDto
            {
                AppointmentId = a.AppointmentId,
                PatientId = a.PatientId,
                PatientName = a.Patient.FullName,
                UnifiedPatientId = a.Patient.UnifiedPatientId,
                ClinicId = a.ClinicId,
                ClinicName = a.Clinic.ClinicName,
                StartTime = a.StartTime,
                EndTime = a.EndTime,
                Status = a.Status.ToString()
            }).ToList()
        };
    }
}

