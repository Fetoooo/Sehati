using System.Security.Claims;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Sehati.Application.Common.Exceptions;
using Sehati.Application.Common.Interfaces;
using Sehati.Application.DTOs.Auth;
using Sehati.Domain.Entities;
using Sehati.Domain.Enums;
using ValidationException = Sehati.Application.Common.Exceptions.ValidationException;

namespace Sehati.Application.Services;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasherService _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly IUnifiedPatientIdGenerator _patientIdGenerator;
    private readonly IValidator<RegisterDto> _registerValidator;
    private readonly IValidator<LoginDto> _loginValidator;
    private readonly IValidator<RefreshTokenDto> _refreshTokenValidator;

    public AuthService(
        IApplicationDbContext context,
        IPasswordHasherService passwordHasher,
        ITokenService tokenService,
        IUnifiedPatientIdGenerator patientIdGenerator,
        IValidator<RegisterDto> registerValidator,
        IValidator<LoginDto> loginValidator,
        IValidator<RefreshTokenDto> refreshTokenValidator)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _patientIdGenerator = patientIdGenerator;
        _registerValidator = registerValidator;
        _loginValidator = loginValidator;
        _refreshTokenValidator = refreshTokenValidator;
    }

    public async Task<TokenResponseDto> RegisterAsync(RegisterDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _registerValidator.ValidateAsync(dto, cancellationToken);
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

        var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == dto.RoleName, cancellationToken);
        if (role == null)
        {
            throw new ValidationException("RoleName", $"Role '{dto.RoleName}' does not exist.");
        }

        var user = new User
        {
            Email = normalizedEmail,
            Phone = normalizedPhone,
            RoleId = role.RoleId,
            Role = role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);

        string fullName = dto.FullName.Trim();
        string? unifiedPatientId = null;
        string? specialty = null;

        bool lockAcquired = false;
        if (role.RoleName.Equals("Patient", StringComparison.OrdinalIgnoreCase))
        {
            await IUnifiedPatientIdGenerator.PatientCreationLock.WaitAsync(cancellationToken);
            lockAcquired = true;
        }

        try
        {
            if (role.RoleName.Equals("Patient", StringComparison.OrdinalIgnoreCase))
            {
                var currentYear = DateTime.UtcNow.Year;
                var count = await _context.Patients.CountAsync(cancellationToken);
                var nextSeq = count + 1;
                while (await _context.Patients.AnyAsync(p => p.UnifiedPatientId == _patientIdGenerator.GenerateId(nextSeq, currentYear), cancellationToken))
                {
                    nextSeq++;
                }
                unifiedPatientId = _patientIdGenerator.GenerateId(nextSeq, currentYear);

                var patient = new Patient
                {
                    User = user,
                    FullName = fullName,
                    UnifiedPatientId = unifiedPatientId,
                    DateOfBirth = dto.DateOfBirth ?? new DateOnly(2000, 1, 1),
                    Gender = dto.Gender ?? Gender.Male,
                    Address = dto.Address?.Trim(),
                    EmergencyContact = dto.EmergencyContact?.Trim(),
                    CreatedAt = DateTime.UtcNow,
                    MedicalRecord = new MedicalRecord
                    {
                        CreatedAt = DateTime.UtcNow,
                        LastUpdatedAt = DateTime.UtcNow
                    },
                    EmergencyProfile = new EmergencyProfile
                    {
                        BloodType = BloodType.Unknown,
                        EmergencyContactName = dto.EmergencyContact?.Trim() ?? string.Empty,
                        EmergencyContactPhone = string.Empty,
                        LastUpdatedAt = DateTime.UtcNow
                    }
                };

                user.Patient = patient;
                _context.Patients.Add(patient);
            }
            else if (role.RoleName.Equals("Doctor", StringComparison.OrdinalIgnoreCase))
            {
                specialty = dto.Specialty?.Trim() ?? string.Empty;
                var doctor = new Doctor
                {
                    User = user,
                    FullName = fullName,
                    Specialty = specialty,
                    LicenseNumber = dto.LicenseNumber?.Trim() ?? string.Empty,
                    Phone = normalizedPhone,
                    Email = normalizedEmail
                };

                user.Doctor = doctor;
                _context.Doctors.Add(doctor);
            }
            else if (role.RoleName.Equals("Receptionist", StringComparison.OrdinalIgnoreCase))
            {
                // If registering a receptionist, assign to first clinic if available or clinic 1
                var defaultClinic = await _context.Clinics.FirstOrDefaultAsync(cancellationToken);
                var receptionist = new Receptionist
                {
                    User = user,
                    FullName = fullName,
                    ClinicId = defaultClinic?.ClinicId ?? 1
                };

                user.Receptionist = receptionist;
                _context.Receptionists.Add(receptionist);
            }

            var refreshToken = _tokenService.GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

            _context.Users.Add(user);
            await _context.SaveChangesAsync(cancellationToken);

            var tokenResponse = _tokenService.GenerateTokens(user, role.RoleName, fullName, unifiedPatientId, specialty);
            tokenResponse.RefreshToken = refreshToken;

            return tokenResponse;
        }
        finally
        {
            if (lockAcquired)
            {
                IUnifiedPatientIdGenerator.PatientCreationLock.Release();
            }
        }
    }

    public async Task<TokenResponseDto> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _loginValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            throw new ValidationException(errors);
        }

        var query = dto.EmailOrPhone.Trim().ToLowerInvariant();

        var user = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Patient)
            .Include(u => u.Doctor)
            .Include(u => u.Receptionist)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == query || u.Phone == query, cancellationToken);

        if (user == null)
        {
            throw new UnauthorizedException("Invalid email/phone or password.");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedException("Your account has been deactivated. Please contact support.");
        }

        var passwordValid = _passwordHasher.VerifyPassword(user, user.PasswordHash, dto.Password);
        if (!passwordValid)
        {
            throw new UnauthorizedException("Invalid email/phone or password.");
        }

        var fullName = user.Patient?.FullName ?? user.Doctor?.FullName ?? user.Receptionist?.FullName ?? user.Email;
        var unifiedPatientId = user.Patient?.UnifiedPatientId;
        var specialty = user.Doctor?.Specialty;

        var tokenResponse = _tokenService.GenerateTokens(user, user.Role.RoleName, fullName, unifiedPatientId, specialty);
        var refreshToken = _tokenService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync(cancellationToken);

        tokenResponse.RefreshToken = refreshToken;
        return tokenResponse;
    }

    public async Task<TokenResponseDto> RefreshTokenAsync(RefreshTokenDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _refreshTokenValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            throw new ValidationException(errors);
        }

        var principal = _tokenService.GetPrincipalFromExpiredToken(dto.AccessToken);
        if (principal == null)
        {
            throw new UnauthorizedException("Invalid access token.");
        }

        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? principal.FindFirst("sub")?.Value;

        if (!int.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedException("Invalid token claims.");
        }

        var user = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Patient)
            .Include(u => u.Doctor)
            .Include(u => u.Receptionist)
            .FirstOrDefaultAsync(u => u.UserId == userId, cancellationToken);

        if (user == null || !user.IsActive)
        {
            throw new UnauthorizedException("User not found or inactive.");
        }

        if (user.RefreshToken != dto.RefreshToken || user.RefreshTokenExpiryTime == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            throw new UnauthorizedException("Invalid or expired refresh token.");
        }

        var fullName = user.Patient?.FullName ?? user.Doctor?.FullName ?? user.Receptionist?.FullName ?? user.Email;
        var unifiedPatientId = user.Patient?.UnifiedPatientId;
        var specialty = user.Doctor?.Specialty;

        var tokenResponse = _tokenService.GenerateTokens(user, user.Role.RoleName, fullName, unifiedPatientId, specialty);
        var newRefreshToken = _tokenService.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync(cancellationToken);

        tokenResponse.RefreshToken = newRefreshToken;
        return tokenResponse;
    }

    public async Task LogoutAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId, cancellationToken);
        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<UserDto> GetCurrentUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .Include(u => u.Patient)
            .Include(u => u.Doctor)
            .Include(u => u.Receptionist)
            .FirstOrDefaultAsync(u => u.UserId == userId, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException(nameof(User), userId);
        }

        var fullName = user.Patient?.FullName ?? user.Doctor?.FullName ?? user.Receptionist?.FullName ?? user.Email;

        return new UserDto
        {
            UserId = user.UserId,
            Email = user.Email,
            Phone = user.Phone,
            Role = user.Role.RoleName,
            FullName = fullName,
            UnifiedPatientId = user.Patient?.UnifiedPatientId,
            Specialty = user.Doctor?.Specialty,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }
}
