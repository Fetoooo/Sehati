using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Sehati.Application.Common.Exceptions;
using Sehati.Application.Common.Interfaces;
using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Patients;
using Sehati.Domain.Entities;
using Sehati.Domain.Enums;
using ValidationException = Sehati.Application.Common.Exceptions.ValidationException;

namespace Sehati.Application.Services;

public class PatientService : IPatientService
{
    private readonly IApplicationDbContext _context;
    private readonly IUnifiedPatientIdGenerator _patientIdGenerator;
    private readonly IPasswordHasherService _passwordHasher;
    private readonly IValidator<CreatePatientDto> _createPatientValidator;
    private readonly IValidator<UpdatePatientDto> _updatePatientValidator;
    private readonly IValidator<CreateAllergyDto> _createAllergyValidator;
    private readonly IValidator<CreateMedicationDto> _createMedicationValidator;
    private readonly IValidator<CreateTestDto> _createTestValidator;
    private readonly IValidator<CreateScanDto> _createScanValidator;

    public PatientService(
        IApplicationDbContext context,
        IUnifiedPatientIdGenerator patientIdGenerator,
        IPasswordHasherService passwordHasher,
        IValidator<CreatePatientDto> createPatientValidator,
        IValidator<UpdatePatientDto> updatePatientValidator,
        IValidator<CreateAllergyDto> createAllergyValidator,
        IValidator<CreateMedicationDto> createMedicationValidator,
        IValidator<CreateTestDto> createTestValidator,
        IValidator<CreateScanDto> createScanValidator)
    {
        _context = context;
        _patientIdGenerator = patientIdGenerator;
        _passwordHasher = passwordHasher;
        _createPatientValidator = createPatientValidator;
        _updatePatientValidator = updatePatientValidator;
        _createAllergyValidator = createAllergyValidator;
        _createMedicationValidator = createMedicationValidator;
        _createTestValidator = createTestValidator;
        _createScanValidator = createScanValidator;
    }

    public async Task<PaginatedList<PatientDto>> GetPatientsAsync(int pageNumber = 1, int pageSize = 10, CancellationToken cancellationToken = default)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Patients
            .Include(p => p.User)
            .AsNoTracking();

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PatientDto
            {
                PatientId = p.PatientId,
                UserId = p.UserId,
                UnifiedPatientId = p.UnifiedPatientId,
                FullName = p.FullName,
                DateOfBirth = p.DateOfBirth,
                Gender = p.Gender,
                Address = p.Address,
                EmergencyContact = p.EmergencyContact,
                Phone = p.User.Phone,
                Email = p.User.Email,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new PaginatedList<PatientDto>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<PatientDetailDto> GetPatientByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var patient = await _context.Patients
            .Include(p => p.User)
            .Include(p => p.MedicalRecord)
            .Include(p => p.EmergencyProfile)
            .Include(p => p.Allergies)
            .Include(p => p.Medications)
            .Include(p => p.Tests)
            .Include(p => p.Scans)
            .Include(p => p.Visits)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.PatientId == id, cancellationToken);

        if (patient == null)
        {
            throw new NotFoundException(nameof(Patient), id);
        }

        return MapToDetailDto(patient);
    }

    public async Task<PatientDetailDto?> GetPatientByUnifiedIdAsync(string unifiedId, CancellationToken cancellationToken = default)
    {
        var normalizedId = unifiedId.Trim().ToUpperInvariant();

        var patient = await _context.Patients
            .Include(p => p.User)
            .Include(p => p.MedicalRecord)
            .Include(p => p.EmergencyProfile)
            .Include(p => p.Allergies)
            .Include(p => p.Medications)
            .Include(p => p.Tests)
            .Include(p => p.Scans)
            .Include(p => p.Visits)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UnifiedPatientId.ToUpper() == normalizedId, cancellationToken);

        return patient == null ? null : MapToDetailDto(patient);
    }

    public async Task<IEnumerable<PatientDto>> SearchPatientsAsync(string query, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return Enumerable.Empty<PatientDto>();
        }

        var searchTerm = query.Trim().ToLowerInvariant();

        var results = await _context.Patients
            .Include(p => p.User)
            .AsNoTracking()
            .Where(p => p.UnifiedPatientId.ToLower().Contains(searchTerm) ||
                        p.FullName.ToLower().Contains(searchTerm) ||
                        p.User.Phone.Contains(searchTerm) ||
                        (p.User.Email != null && p.User.Email.ToLower().Contains(searchTerm)))
            .OrderBy(p => p.FullName)
            .Take(50)
            .Select(p => new PatientDto
            {
                PatientId = p.PatientId,
                UserId = p.UserId,
                UnifiedPatientId = p.UnifiedPatientId,
                FullName = p.FullName,
                DateOfBirth = p.DateOfBirth,
                Gender = p.Gender,
                Address = p.Address,
                EmergencyContact = p.EmergencyContact,
                Phone = p.User.Phone,
                Email = p.User.Email,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return results;
    }

    public async Task<PatientDto> CreatePatientAsync(CreatePatientDto dto, CancellationToken cancellationToken = default)
    {
        var validation = await _createPatientValidator.ValidateAsync(dto, cancellationToken);
        if (!validation.IsValid)
        {
            throw new ValidationException(validation.ToDictionary());
        }

        var normalizedPhone = dto.Phone.Trim();
        var phoneExists = await _context.Users.AnyAsync(u => u.Phone == normalizedPhone, cancellationToken);
        if (phoneExists)
        {
            throw new ConflictException("A user with this phone number already exists.");
        }

        var normalizedEmail = !string.IsNullOrWhiteSpace(dto.Email)
            ? dto.Email.Trim().ToLowerInvariant()
            : $"{normalizedPhone.Replace("+", "")}@patient.sehati.com";

        var emailExists = await _context.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail, cancellationToken);
        if (emailExists)
        {
            throw new ConflictException("A user with this email address already exists.");
        }

        var patientRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Patient", cancellationToken)
            ?? throw new InvalidOperationException("Patient role is not seeded in the database.");

        await IUnifiedPatientIdGenerator.PatientCreationLock.WaitAsync(cancellationToken);
        try
        {
            var currentYear = DateTime.UtcNow.Year;
            var count = await _context.Patients.CountAsync(cancellationToken);
            var nextSeq = count + 1;
            while (await _context.Patients.AnyAsync(p => p.UnifiedPatientId == _patientIdGenerator.GenerateId(nextSeq, currentYear), cancellationToken))
            {
                nextSeq++;
            }
            var unifiedId = _patientIdGenerator.GenerateId(nextSeq, currentYear);

            var user = new User
            {
                Email = normalizedEmail,
                Phone = normalizedPhone,
                RoleId = patientRole.RoleId,
                Role = patientRole,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var tempPassword = "Sehati@" + Guid.NewGuid().ToString("N")[..8] + "1!";
            user.PasswordHash = _passwordHasher.HashPassword(user, tempPassword);

            var patient = new Patient
            {
                User = user,
                UnifiedPatientId = unifiedId,
                FullName = dto.FullName.Trim(),
                DateOfBirth = dto.DateOfBirth,
                Gender = dto.Gender,
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
                    BloodType = dto.BloodType,
                    EmergencyNotes = dto.EmergencyNotes?.Trim(),
                    EmergencyContactName = dto.EmergencyContact?.Trim() ?? string.Empty,
                    EmergencyContactPhone = string.Empty,
                    LastUpdatedAt = DateTime.UtcNow
                }
            };

            user.Patient = patient;

            _context.Users.Add(user);
            _context.Patients.Add(patient);
            await _context.SaveChangesAsync(cancellationToken);

            return new PatientDto
            {
                PatientId = patient.PatientId,
                UserId = user.UserId,
                UnifiedPatientId = patient.UnifiedPatientId,
                FullName = patient.FullName,
                DateOfBirth = patient.DateOfBirth,
                Gender = patient.Gender,
                Address = patient.Address,
                EmergencyContact = patient.EmergencyContact,
                Phone = user.Phone,
                Email = user.Email,
                CreatedAt = patient.CreatedAt
            };
        }
        finally
        {
            IUnifiedPatientIdGenerator.PatientCreationLock.Release();
        }
    }

    public async Task<PatientDto> UpdatePatientAsync(int id, UpdatePatientDto dto, CancellationToken cancellationToken = default)
    {
        var validation = await _updatePatientValidator.ValidateAsync(dto, cancellationToken);
        if (!validation.IsValid)
        {
            throw new ValidationException(validation.ToDictionary());
        }

        var patient = await _context.Patients
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.PatientId == id, cancellationToken);

        if (patient == null)
        {
            throw new NotFoundException(nameof(Patient), id);
        }

        patient.FullName = dto.FullName.Trim();
        patient.DateOfBirth = dto.DateOfBirth;
        patient.Gender = dto.Gender;
        patient.Address = dto.Address?.Trim();
        patient.EmergencyContact = dto.EmergencyContact?.Trim();

        if (!string.IsNullOrWhiteSpace(dto.Phone) && dto.Phone.Trim() != patient.User.Phone)
        {
            var newPhone = dto.Phone.Trim();
            var phoneTaken = await _context.Users.AnyAsync(u => u.Phone == newPhone && u.UserId != patient.UserId, cancellationToken);
            if (phoneTaken)
            {
                throw new ConflictException("Phone number is already associated with another user account.");
            }
            patient.User.Phone = newPhone;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new PatientDto
        {
            PatientId = patient.PatientId,
            UserId = patient.UserId,
            UnifiedPatientId = patient.UnifiedPatientId,
            FullName = patient.FullName,
            DateOfBirth = patient.DateOfBirth,
            Gender = patient.Gender,
            Address = patient.Address,
            EmergencyContact = patient.EmergencyContact,
            Phone = patient.User.Phone,
            Email = patient.User.Email,
            CreatedAt = patient.CreatedAt
        };
    }

    // Allergies
    public async Task<IEnumerable<AllergyDto>> GetAllergiesAsync(int patientId, CancellationToken cancellationToken = default)
    {
        await EnsurePatientExistsAsync(patientId, cancellationToken);

        return await _context.Allergies
            .Where(a => a.PatientId == patientId)
            .Select(a => new AllergyDto
            {
                AllergyId = a.AllergyId,
                PatientId = a.PatientId,
                AllergyName = a.AllergyName,
                Reaction = a.Reaction,
                Notes = a.Notes
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<AllergyDto> AddAllergyAsync(int patientId, CreateAllergyDto dto, CancellationToken cancellationToken = default)
    {
        var validation = await _createAllergyValidator.ValidateAsync(dto, cancellationToken);
        if (!validation.IsValid)
        {
            throw new ValidationException(validation.ToDictionary());
        }

        var patient = await _context.Patients
            .Include(p => p.EmergencyProfile)
            .FirstOrDefaultAsync(p => p.PatientId == patientId, cancellationToken);

        if (patient == null)
        {
            throw new NotFoundException(nameof(Patient), patientId);
        }

        var allergy = new Allergy
        {
            PatientId = patientId,
            AllergyName = dto.AllergyName.Trim(),
            Reaction = dto.Reaction.Trim(),
            Notes = dto.Notes?.Trim()
        };

        if (patient.EmergencyProfile != null)
        {
            patient.EmergencyProfile.LastUpdatedAt = DateTime.UtcNow;
        }

        _context.Allergies.Add(allergy);
        await _context.SaveChangesAsync(cancellationToken);

        return new AllergyDto
        {
            AllergyId = allergy.AllergyId,
            PatientId = allergy.PatientId,
            AllergyName = allergy.AllergyName,
            Reaction = allergy.Reaction,
            Notes = allergy.Notes
        };
    }

    public async Task DeleteAllergyAsync(int patientId, int allergyId, CancellationToken cancellationToken = default)
    {
        var allergy = await _context.Allergies
            .FirstOrDefaultAsync(a => a.AllergyId == allergyId && a.PatientId == patientId, cancellationToken);

        if (allergy == null)
        {
            throw new NotFoundException(nameof(Allergy), allergyId);
        }

        _context.Allergies.Remove(allergy);
        await _context.SaveChangesAsync(cancellationToken);
    }

    // Medications
    public async Task<IEnumerable<MedicationDto>> GetMedicationsAsync(int patientId, CancellationToken cancellationToken = default)
    {
        await EnsurePatientExistsAsync(patientId, cancellationToken);

        return await _context.Medications
            .Where(m => m.PatientId == patientId)
            .OrderByDescending(m => m.StartDate)
            .Select(m => new MedicationDto
            {
                MedicationId = m.MedicationId,
                PatientId = m.PatientId,
                MedicationName = m.MedicationName,
                Dosage = m.Dosage,
                Frequency = m.Frequency,
                StartDate = m.StartDate,
                EndDate = m.EndDate,
                Notes = m.Notes
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<MedicationDto> AddMedicationAsync(int patientId, CreateMedicationDto dto, CancellationToken cancellationToken = default)
    {
        var validation = await _createMedicationValidator.ValidateAsync(dto, cancellationToken);
        if (!validation.IsValid)
        {
            throw new ValidationException(validation.ToDictionary());
        }

        var patient = await _context.Patients
            .Include(p => p.EmergencyProfile)
            .FirstOrDefaultAsync(p => p.PatientId == patientId, cancellationToken);

        if (patient == null)
        {
            throw new NotFoundException(nameof(Patient), patientId);
        }

        var medication = new Medication
        {
            PatientId = patientId,
            MedicationName = dto.MedicationName.Trim(),
            Dosage = dto.Dosage.Trim(),
            Frequency = dto.Frequency.Trim(),
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Notes = dto.Notes?.Trim()
        };

        if (patient.EmergencyProfile != null)
        {
            patient.EmergencyProfile.LastUpdatedAt = DateTime.UtcNow;
        }

        _context.Medications.Add(medication);
        await _context.SaveChangesAsync(cancellationToken);

        return new MedicationDto
        {
            MedicationId = medication.MedicationId,
            PatientId = medication.PatientId,
            MedicationName = medication.MedicationName,
            Dosage = medication.Dosage,
            Frequency = medication.Frequency,
            StartDate = medication.StartDate,
            EndDate = medication.EndDate,
            Notes = medication.Notes
        };
    }

    public async Task DeleteMedicationAsync(int patientId, int medicationId, CancellationToken cancellationToken = default)
    {
        var medication = await _context.Medications
            .FirstOrDefaultAsync(m => m.MedicationId == medicationId && m.PatientId == patientId, cancellationToken);

        if (medication == null)
        {
            throw new NotFoundException(nameof(Medication), medicationId);
        }

        _context.Medications.Remove(medication);
        await _context.SaveChangesAsync(cancellationToken);
    }

    // Tests
    public async Task<IEnumerable<TestDto>> GetTestsAsync(int patientId, CancellationToken cancellationToken = default)
    {
        await EnsurePatientExistsAsync(patientId, cancellationToken);

        return await _context.Tests
            .Where(t => t.PatientId == patientId)
            .OrderByDescending(t => t.TestDate)
            .Select(t => new TestDto
            {
                TestId = t.TestId,
                PatientId = t.PatientId,
                VisitId = t.VisitId,
                TestName = t.TestName,
                TestDate = t.TestDate,
                Result = t.Result,
                Notes = t.Notes,
                FileUrl = t.FileUrl
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<TestDto> AddTestAsync(int patientId, CreateTestDto dto, CancellationToken cancellationToken = default)
    {
        var validation = await _createTestValidator.ValidateAsync(dto, cancellationToken);
        if (!validation.IsValid)
        {
            throw new ValidationException(validation.ToDictionary());
        }

        await EnsurePatientExistsAsync(patientId, cancellationToken);

        var test = new Test
        {
            PatientId = patientId,
            VisitId = dto.VisitId,
            TestName = dto.TestName.Trim(),
            TestDate = dto.TestDate,
            Result = dto.Result?.Trim(),
            Notes = dto.Notes?.Trim(),
            FileUrl = dto.FileUrl?.Trim()
        };

        _context.Tests.Add(test);
        await _context.SaveChangesAsync(cancellationToken);

        return new TestDto
        {
            TestId = test.TestId,
            PatientId = test.PatientId,
            VisitId = test.VisitId,
            TestName = test.TestName,
            TestDate = test.TestDate,
            Result = test.Result,
            Notes = test.Notes,
            FileUrl = test.FileUrl
        };
    }

    public async Task DeleteTestAsync(int patientId, int testId, CancellationToken cancellationToken = default)
    {
        var test = await _context.Tests
            .FirstOrDefaultAsync(t => t.TestId == testId && t.PatientId == patientId, cancellationToken);

        if (test == null)
        {
            throw new NotFoundException(nameof(Test), testId);
        }

        _context.Tests.Remove(test);
        await _context.SaveChangesAsync(cancellationToken);
    }

    // Scans
    public async Task<IEnumerable<ScanDto>> GetScansAsync(int patientId, CancellationToken cancellationToken = default)
    {
        await EnsurePatientExistsAsync(patientId, cancellationToken);

        return await _context.Scans
            .Where(s => s.PatientId == patientId)
            .OrderByDescending(s => s.ScanDate)
            .Select(s => new ScanDto
            {
                ScanId = s.ScanId,
                PatientId = s.PatientId,
                VisitId = s.VisitId,
                ScanType = s.ScanType,
                ScanDate = s.ScanDate,
                Result = s.Result,
                FileUrl = s.FileUrl,
                Notes = s.Notes
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<ScanDto> AddScanAsync(int patientId, CreateScanDto dto, CancellationToken cancellationToken = default)
    {
        var validation = await _createScanValidator.ValidateAsync(dto, cancellationToken);
        if (!validation.IsValid)
        {
            throw new ValidationException(validation.ToDictionary());
        }

        await EnsurePatientExistsAsync(patientId, cancellationToken);

        var scan = new Scan
        {
            PatientId = patientId,
            VisitId = dto.VisitId,
            ScanType = dto.ScanType.Trim(),
            ScanDate = dto.ScanDate,
            Result = dto.Result?.Trim(),
            FileUrl = dto.FileUrl?.Trim(),
            Notes = dto.Notes?.Trim()
        };

        _context.Scans.Add(scan);
        await _context.SaveChangesAsync(cancellationToken);

        return new ScanDto
        {
            ScanId = scan.ScanId,
            PatientId = scan.PatientId,
            VisitId = scan.VisitId,
            ScanType = scan.ScanType,
            ScanDate = scan.ScanDate,
            Result = scan.Result,
            FileUrl = scan.FileUrl,
            Notes = scan.Notes
        };
    }

    public async Task DeleteScanAsync(int patientId, int scanId, CancellationToken cancellationToken = default)
    {
        var scan = await _context.Scans
            .FirstOrDefaultAsync(s => s.ScanId == scanId && s.PatientId == patientId, cancellationToken);

        if (scan == null)
        {
            throw new NotFoundException(nameof(Scan), scanId);
        }

        _context.Scans.Remove(scan);
        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsurePatientExistsAsync(int patientId, CancellationToken cancellationToken)
    {
        var exists = await _context.Patients.AnyAsync(p => p.PatientId == patientId, cancellationToken);
        if (!exists)
        {
            throw new NotFoundException(nameof(Patient), patientId);
        }
    }

    private static PatientDetailDto MapToDetailDto(Patient patient)
    {
        var activeMedications = patient.Medications
            .Where(m => !m.EndDate.HasValue || m.EndDate.Value >= DateOnly.FromDateTime(DateTime.UtcNow))
            .ToList();

        return new PatientDetailDto
        {
            PatientId = patient.PatientId,
            UserId = patient.UserId,
            UnifiedPatientId = patient.UnifiedPatientId,
            FullName = patient.FullName,
            DateOfBirth = patient.DateOfBirth,
            Gender = patient.Gender,
            Address = patient.Address,
            EmergencyContact = patient.EmergencyContact,
            Phone = patient.User.Phone,
            Email = patient.User.Email,
            CreatedAt = patient.CreatedAt,

            MedicalRecordId = patient.MedicalRecord?.MedicalRecordId ?? 0,
            BloodType = patient.EmergencyProfile?.BloodType ?? BloodType.Unknown,
            EmergencyNotes = patient.EmergencyProfile?.EmergencyNotes,
            EmergencyContactName = patient.EmergencyProfile?.EmergencyContactName ?? string.Empty,
            EmergencyContactPhone = patient.EmergencyProfile?.EmergencyContactPhone ?? string.Empty,

            AllergiesCount = patient.Allergies.Count,
            ActiveMedicationsCount = activeMedications.Count,
            TestsCount = patient.Tests.Count,
            ScansCount = patient.Scans.Count,
            VisitsCount = patient.Visits.Count,

            Allergies = patient.Allergies.Select(a => new AllergyDto
            {
                AllergyId = a.AllergyId,
                PatientId = a.PatientId,
                AllergyName = a.AllergyName,
                Reaction = a.Reaction,
                Notes = a.Notes
            }).ToList(),

            Medications = patient.Medications.Select(m => new MedicationDto
            {
                MedicationId = m.MedicationId,
                PatientId = m.PatientId,
                MedicationName = m.MedicationName,
                Dosage = m.Dosage,
                Frequency = m.Frequency,
                StartDate = m.StartDate,
                EndDate = m.EndDate,
                Notes = m.Notes
            }).ToList(),

            RecentTests = patient.Tests.OrderByDescending(t => t.TestDate).Take(5).Select(t => new TestDto
            {
                TestId = t.TestId,
                PatientId = t.PatientId,
                VisitId = t.VisitId,
                TestName = t.TestName,
                TestDate = t.TestDate,
                Result = t.Result,
                Notes = t.Notes,
                FileUrl = t.FileUrl
            }).ToList(),

            RecentScans = patient.Scans.OrderByDescending(s => s.ScanDate).Take(5).Select(s => new ScanDto
            {
                ScanId = s.ScanId,
                PatientId = s.PatientId,
                VisitId = s.VisitId,
                ScanType = s.ScanType,
                ScanDate = s.ScanDate,
                Result = s.Result,
                FileUrl = s.FileUrl,
                Notes = s.Notes
            }).ToList()
        };
    }
}
