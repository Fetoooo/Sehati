using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Sehati.Application.Common.Exceptions;
using Sehati.Application.Common.Interfaces;
using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Visits;
using Sehati.Domain.Entities;
using ValidationException = Sehati.Application.Common.Exceptions.ValidationException;

namespace Sehati.Application.Services;

public class VisitService : IVisitService
{
    private readonly IApplicationDbContext _context;
    private readonly IValidator<CreateVisitDto> _createVisitValidator;
    private readonly IValidator<UpdateVisitDto> _updateVisitValidator;
    private readonly IValidator<CreateDiagnosisDto> _createDiagnosisValidator;
    private readonly IValidator<CreateTreatmentDto> _createTreatmentValidator;

    public VisitService(
        IApplicationDbContext context,
        IValidator<CreateVisitDto> createVisitValidator,
        IValidator<UpdateVisitDto> updateVisitValidator,
        IValidator<CreateDiagnosisDto> createDiagnosisValidator,
        IValidator<CreateTreatmentDto> createTreatmentValidator)
    {
        _context = context;
        _createVisitValidator = createVisitValidator;
        _updateVisitValidator = updateVisitValidator;
        _createDiagnosisValidator = createDiagnosisValidator;
        _createTreatmentValidator = createTreatmentValidator;
    }

    public async Task<PaginatedList<VisitDto>> GetVisitsAsync(
        int? patientId = null,
        int? doctorId = null,
        int? clinicId = null,
        int pageNumber = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Visits
            .Include(v => v.Patient)
            .Include(v => v.Doctor)
            .Include(v => v.Clinic)
            .Include(v => v.Diagnoses)
            .Include(v => v.Treatments)
            .Include(v => v.Prescriptions)
            .AsNoTracking();

        if (patientId.HasValue)
        {
            query = query.Where(v => v.PatientId == patientId.Value);
        }

        if (doctorId.HasValue)
        {
            query = query.Where(v => v.DoctorId == doctorId.Value);
        }

        if (clinicId.HasValue)
        {
            query = query.Where(v => v.ClinicId == clinicId.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(v => v.VisitDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(v => new VisitDto
            {
                VisitId = v.VisitId,
                PatientId = v.PatientId,
                PatientName = v.Patient.FullName,
                UnifiedPatientId = v.Patient.UnifiedPatientId,
                DoctorId = v.DoctorId,
                DoctorName = v.Doctor.FullName,
                DoctorSpecialty = v.Doctor.Specialty,
                ClinicId = v.ClinicId,
                ClinicName = v.Clinic.ClinicName,
                VisitDate = v.VisitDate,
                ChiefComplaint = v.ChiefComplaint,
                Notes = v.Notes,
                Status = v.Status,
                DiagnosesCount = v.Diagnoses.Count,
                TreatmentsCount = v.Treatments.Count,
                PrescriptionsCount = v.Prescriptions.Count
            })
            .ToListAsync(cancellationToken);

        return new PaginatedList<VisitDto>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<VisitDetailDto> GetVisitByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var visit = await _context.Visits
            .Include(v => v.Patient)
            .Include(v => v.Doctor)
            .Include(v => v.Clinic)
            .Include(v => v.Diagnoses)
            .Include(v => v.Treatments)
            .Include(v => v.Prescriptions)
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.VisitId == id, cancellationToken);

        if (visit == null)
        {
            throw new NotFoundException("Visit", id);
        }

        return new VisitDetailDto
        {
            VisitId = visit.VisitId,
            PatientId = visit.PatientId,
            PatientName = visit.Patient.FullName,
            UnifiedPatientId = visit.Patient.UnifiedPatientId,
            DoctorId = visit.DoctorId,
            DoctorName = visit.Doctor.FullName,
            DoctorSpecialty = visit.Doctor.Specialty,
            ClinicId = visit.ClinicId,
            ClinicName = visit.Clinic.ClinicName,
            VisitDate = visit.VisitDate,
            ChiefComplaint = visit.ChiefComplaint,
            Notes = visit.Notes,
            Status = visit.Status,
            DiagnosesCount = visit.Diagnoses.Count,
            TreatmentsCount = visit.Treatments.Count,
            PrescriptionsCount = visit.Prescriptions.Count,
            Diagnoses = visit.Diagnoses.Select(d => new DiagnosisDto
            {
                DiagnosisId = d.DiagnosisId,
                VisitId = d.VisitId,
                DiagnosisName = d.DiagnosisName,
                Description = d.Description,
                DiagnosisDate = d.DiagnosisDate
            }).ToList(),
            Treatments = visit.Treatments.Select(t => new TreatmentDto
            {
                TreatmentId = t.TreatmentId,
                VisitId = t.VisitId,
                TreatmentDescription = t.TreatmentDescription,
                StartDate = t.StartDate,
                EndDate = t.EndDate,
                Instructions = t.Instructions
            }).ToList(),
            PrescriptionIds = visit.Prescriptions.Select(p => p.PrescriptionId).ToList()
        };
    }

    public async Task<VisitDto> CreateVisitAsync(CreateVisitDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _createVisitValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            throw new ValidationException(errors);
        }

        var patient = await _context.Patients.FindAsync(new object[] { dto.PatientId }, cancellationToken);
        if (patient == null)
        {
            throw new NotFoundException("Patient", dto.PatientId);
        }

        var doctor = await _context.Doctors.FindAsync(new object[] { dto.DoctorId }, cancellationToken);
        if (doctor == null)
        {
            throw new NotFoundException("Doctor", dto.DoctorId);
        }

        var clinic = await _context.Clinics.FindAsync(new object[] { dto.ClinicId }, cancellationToken);
        if (clinic == null)
        {
            throw new NotFoundException("Clinic", dto.ClinicId);
        }

        var visit = new Visit
        {
            PatientId = dto.PatientId,
            DoctorId = dto.DoctorId,
            ClinicId = dto.ClinicId,
            ChiefComplaint = dto.ChiefComplaint.Trim(),
            Notes = dto.Notes?.Trim(),
            Status = dto.Status,
            VisitDate = DateTime.UtcNow
        };

        _context.Visits.Add(visit);
        await _context.SaveChangesAsync(cancellationToken);

        return new VisitDto
        {
            VisitId = visit.VisitId,
            PatientId = patient.PatientId,
            PatientName = patient.FullName,
            UnifiedPatientId = patient.UnifiedPatientId,
            DoctorId = doctor.DoctorId,
            DoctorName = doctor.FullName,
            DoctorSpecialty = doctor.Specialty,
            ClinicId = clinic.ClinicId,
            ClinicName = clinic.ClinicName,
            VisitDate = visit.VisitDate,
            ChiefComplaint = visit.ChiefComplaint,
            Notes = visit.Notes,
            Status = visit.Status,
            DiagnosesCount = 0,
            TreatmentsCount = 0,
            PrescriptionsCount = 0
        };
    }

    public async Task<VisitDto> UpdateVisitAsync(int id, UpdateVisitDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _updateVisitValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            throw new ValidationException(errors);
        }

        var visit = await _context.Visits
            .Include(v => v.Patient)
            .Include(v => v.Doctor)
            .Include(v => v.Clinic)
            .Include(v => v.Diagnoses)
            .Include(v => v.Treatments)
            .Include(v => v.Prescriptions)
            .FirstOrDefaultAsync(v => v.VisitId == id, cancellationToken);

        if (visit == null)
        {
            throw new NotFoundException("Visit", id);
        }

        if (!string.IsNullOrEmpty(dto.ChiefComplaint))
        {
            visit.ChiefComplaint = dto.ChiefComplaint.Trim();
        }

        if (!string.IsNullOrEmpty(dto.Notes))
        {
            visit.Notes = dto.Notes.Trim();
        }

        visit.Status = dto.Status;

        await _context.SaveChangesAsync(cancellationToken);

        return new VisitDto
        {
            VisitId = visit.VisitId,
            PatientId = visit.PatientId,
            PatientName = visit.Patient.FullName,
            UnifiedPatientId = visit.Patient.UnifiedPatientId,
            DoctorId = visit.DoctorId,
            DoctorName = visit.Doctor.FullName,
            DoctorSpecialty = visit.Doctor.Specialty,
            ClinicId = visit.ClinicId,
            ClinicName = visit.Clinic.ClinicName,
            VisitDate = visit.VisitDate,
            ChiefComplaint = visit.ChiefComplaint,
            Notes = visit.Notes,
            Status = visit.Status,
            DiagnosesCount = visit.Diagnoses.Count,
            TreatmentsCount = visit.Treatments.Count,
            PrescriptionsCount = visit.Prescriptions.Count
        };
    }

    public async Task<IEnumerable<DiagnosisDto>> GetVisitDiagnosesAsync(int visitId, CancellationToken cancellationToken = default)
    {
        var visitExists = await _context.Visits.AnyAsync(v => v.VisitId == visitId, cancellationToken);
        if (!visitExists)
        {
            throw new NotFoundException("Visit", visitId);
        }

        return await _context.Diagnoses
            .Where(d => d.VisitId == visitId)
            .OrderByDescending(d => d.DiagnosisDate)
            .Select(d => new DiagnosisDto
            {
                DiagnosisId = d.DiagnosisId,
                VisitId = d.VisitId,
                DiagnosisName = d.DiagnosisName,
                Description = d.Description,
                DiagnosisDate = d.DiagnosisDate
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<DiagnosisDto> AddDiagnosisAsync(int visitId, CreateDiagnosisDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _createDiagnosisValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            throw new ValidationException(errors);
        }

        var visitExists = await _context.Visits.AnyAsync(v => v.VisitId == visitId, cancellationToken);
        if (!visitExists)
        {
            throw new NotFoundException("Visit", visitId);
        }

        var diagnosis = new Diagnosis
        {
            VisitId = visitId,
            DiagnosisName = dto.DiagnosisName.Trim(),
            Description = dto.Description?.Trim(),
            DiagnosisDate = DateTime.UtcNow
        };

        _context.Diagnoses.Add(diagnosis);
        await _context.SaveChangesAsync(cancellationToken);

        return new DiagnosisDto
        {
            DiagnosisId = diagnosis.DiagnosisId,
            VisitId = diagnosis.VisitId,
            DiagnosisName = diagnosis.DiagnosisName,
            Description = diagnosis.Description,
            DiagnosisDate = diagnosis.DiagnosisDate
        };
    }

    public async Task DeleteDiagnosisAsync(int visitId, int diagnosisId, CancellationToken cancellationToken = default)
    {
        var diagnosis = await _context.Diagnoses
            .FirstOrDefaultAsync(d => d.VisitId == visitId && d.DiagnosisId == diagnosisId, cancellationToken);

        if (diagnosis == null)
        {
            throw new NotFoundException($"Diagnosis with ID {diagnosisId} was not found on Visit {visitId}.");
        }

        _context.Diagnoses.Remove(diagnosis);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<TreatmentDto>> GetVisitTreatmentsAsync(int visitId, CancellationToken cancellationToken = default)
    {
        var visitExists = await _context.Visits.AnyAsync(v => v.VisitId == visitId, cancellationToken);
        if (!visitExists)
        {
            throw new NotFoundException("Visit", visitId);
        }

        return await _context.Treatments
            .Where(t => t.VisitId == visitId)
            .OrderByDescending(t => t.StartDate)
            .Select(t => new TreatmentDto
            {
                TreatmentId = t.TreatmentId,
                VisitId = t.VisitId,
                TreatmentDescription = t.TreatmentDescription,
                StartDate = t.StartDate,
                EndDate = t.EndDate,
                Instructions = t.Instructions
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<TreatmentDto> AddTreatmentAsync(int visitId, CreateTreatmentDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _createTreatmentValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            throw new ValidationException(errors);
        }

        var visitExists = await _context.Visits.AnyAsync(v => v.VisitId == visitId, cancellationToken);
        if (!visitExists)
        {
            throw new NotFoundException("Visit", visitId);
        }

        var treatment = new Treatment
        {
            VisitId = visitId,
            TreatmentDescription = dto.TreatmentDescription.Trim(),
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Instructions = dto.Instructions?.Trim()
        };

        _context.Treatments.Add(treatment);
        await _context.SaveChangesAsync(cancellationToken);

        return new TreatmentDto
        {
            TreatmentId = treatment.TreatmentId,
            VisitId = treatment.VisitId,
            TreatmentDescription = treatment.TreatmentDescription,
            StartDate = treatment.StartDate,
            EndDate = treatment.EndDate,
            Instructions = treatment.Instructions
        };
    }

    public async Task DeleteTreatmentAsync(int visitId, int treatmentId, CancellationToken cancellationToken = default)
    {
        var treatment = await _context.Treatments
            .FirstOrDefaultAsync(t => t.VisitId == visitId && t.TreatmentId == treatmentId, cancellationToken);

        if (treatment == null)
        {
            throw new NotFoundException($"Treatment with ID {treatmentId} was not found on Visit {visitId}.");
        }

        _context.Treatments.Remove(treatment);
        await _context.SaveChangesAsync(cancellationToken);
    }
}

