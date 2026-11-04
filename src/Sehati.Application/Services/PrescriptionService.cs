using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Sehati.Application.Common.Exceptions;
using Sehati.Application.Common.Interfaces;
using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Prescriptions;
using Sehati.Domain.Entities;
using ValidationException = Sehati.Application.Common.Exceptions.ValidationException;

namespace Sehati.Application.Services;

public class PrescriptionService : IPrescriptionService
{
    private readonly IApplicationDbContext _context;
    private readonly IValidator<CreatePrescriptionDto> _createPrescriptionValidator;
    private readonly IValidator<CreatePrescriptionItemDto> _createPrescriptionItemValidator;

    public PrescriptionService(
        IApplicationDbContext context,
        IValidator<CreatePrescriptionDto> createPrescriptionValidator,
        IValidator<CreatePrescriptionItemDto> createPrescriptionItemValidator)
    {
        _context = context;
        _createPrescriptionValidator = createPrescriptionValidator;
        _createPrescriptionItemValidator = createPrescriptionItemValidator;
    }

    public async Task<PaginatedList<PrescriptionDto>> GetPrescriptionsAsync(
        int? patientId = null,
        int? doctorId = null,
        int? visitId = null,
        int pageNumber = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Prescriptions
            .Include(p => p.Patient)
            .Include(p => p.Doctor)
            .Include(p => p.PrescriptionItems)
            .AsNoTracking();

        if (patientId.HasValue)
        {
            query = query.Where(p => p.PatientId == patientId.Value);
        }

        if (doctorId.HasValue)
        {
            query = query.Where(p => p.DoctorId == doctorId.Value);
        }

        if (visitId.HasValue)
        {
            query = query.Where(p => p.VisitId == visitId.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(p => p.PrescriptionDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PrescriptionDto
            {
                PrescriptionId = p.PrescriptionId,
                VisitId = p.VisitId,
                DoctorId = p.DoctorId,
                DoctorName = p.Doctor.FullName,
                DoctorSpecialty = p.Doctor.Specialty,
                PatientId = p.PatientId,
                PatientName = p.Patient.FullName,
                UnifiedPatientId = p.Patient.UnifiedPatientId,
                PrescriptionDate = p.PrescriptionDate,
                Notes = p.Notes,
                ItemsCount = p.PrescriptionItems.Count
            })
            .ToListAsync(cancellationToken);

        return new PaginatedList<PrescriptionDto>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<PrescriptionDetailDto> GetPrescriptionByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var prescription = await _context.Prescriptions
            .Include(p => p.Patient)
            .Include(p => p.Doctor)
            .Include(p => p.PrescriptionItems)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.PrescriptionId == id, cancellationToken);

        if (prescription == null)
        {
            throw new NotFoundException("Prescription", id);
        }

        return new PrescriptionDetailDto
        {
            PrescriptionId = prescription.PrescriptionId,
            VisitId = prescription.VisitId,
            DoctorId = prescription.DoctorId,
            DoctorName = prescription.Doctor.FullName,
            DoctorSpecialty = prescription.Doctor.Specialty,
            PatientId = prescription.PatientId,
            PatientName = prescription.Patient.FullName,
            UnifiedPatientId = prescription.Patient.UnifiedPatientId,
            PrescriptionDate = prescription.PrescriptionDate,
            Notes = prescription.Notes,
            ItemsCount = prescription.PrescriptionItems.Count,
            Items = prescription.PrescriptionItems.Select(i => new PrescriptionItemDto
            {
                PrescriptionItemId = i.PrescriptionItemId,
                PrescriptionId = i.PrescriptionId,
                MedicationName = i.MedicationName,
                Dosage = i.Dosage,
                Frequency = i.Frequency,
                Duration = i.Duration,
                Instructions = i.Instructions
            }).ToList()
        };
    }

    public async Task<PrescriptionDetailDto> CreatePrescriptionAsync(CreatePrescriptionDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _createPrescriptionValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            throw new ValidationException(errors);
        }

        var visit = await _context.Visits.FindAsync(new object[] { dto.VisitId }, cancellationToken);
        if (visit == null)
        {
            throw new NotFoundException("Visit", dto.VisitId);
        }

        var doctor = await _context.Doctors.FindAsync(new object[] { dto.DoctorId }, cancellationToken);
        if (doctor == null)
        {
            throw new NotFoundException("Doctor", dto.DoctorId);
        }

        var patient = await _context.Patients.FindAsync(new object[] { dto.PatientId }, cancellationToken);
        if (patient == null)
        {
            throw new NotFoundException("Patient", dto.PatientId);
        }

        var prescription = new Prescription
        {
            VisitId = dto.VisitId,
            DoctorId = dto.DoctorId,
            PatientId = dto.PatientId,
            PrescriptionDate = DateTime.UtcNow,
            Notes = dto.Notes?.Trim(),
            PrescriptionItems = dto.Items.Select(i => new PrescriptionItem
            {
                MedicationName = i.MedicationName.Trim(),
                Dosage = i.Dosage.Trim(),
                Frequency = i.Frequency.Trim(),
                Duration = i.Duration.Trim(),
                Instructions = i.Instructions?.Trim()
            }).ToList()
        };

        _context.Prescriptions.Add(prescription);
        await _context.SaveChangesAsync(cancellationToken);

        return new PrescriptionDetailDto
        {
            PrescriptionId = prescription.PrescriptionId,
            VisitId = prescription.VisitId,
            DoctorId = doctor.DoctorId,
            DoctorName = doctor.FullName,
            DoctorSpecialty = doctor.Specialty,
            PatientId = patient.PatientId,
            PatientName = patient.FullName,
            UnifiedPatientId = patient.UnifiedPatientId,
            PrescriptionDate = prescription.PrescriptionDate,
            Notes = prescription.Notes,
            ItemsCount = prescription.PrescriptionItems.Count,
            Items = prescription.PrescriptionItems.Select(i => new PrescriptionItemDto
            {
                PrescriptionItemId = i.PrescriptionItemId,
                PrescriptionId = i.PrescriptionId,
                MedicationName = i.MedicationName,
                Dosage = i.Dosage,
                Frequency = i.Frequency,
                Duration = i.Duration,
                Instructions = i.Instructions
            }).ToList()
        };
    }

    public async Task<PrescriptionItemDto> AddPrescriptionItemAsync(int prescriptionId, CreatePrescriptionItemDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _createPrescriptionItemValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            throw new ValidationException(errors);
        }

        var prescriptionExists = await _context.Prescriptions.AnyAsync(p => p.PrescriptionId == prescriptionId, cancellationToken);
        if (!prescriptionExists)
        {
            throw new NotFoundException("Prescription", prescriptionId);
        }

        var item = new PrescriptionItem
        {
            PrescriptionId = prescriptionId,
            MedicationName = dto.MedicationName.Trim(),
            Dosage = dto.Dosage.Trim(),
            Frequency = dto.Frequency.Trim(),
            Duration = dto.Duration.Trim(),
            Instructions = dto.Instructions?.Trim()
        };

        _context.PrescriptionItems.Add(item);
        await _context.SaveChangesAsync(cancellationToken);

        return new PrescriptionItemDto
        {
            PrescriptionItemId = item.PrescriptionItemId,
            PrescriptionId = item.PrescriptionId,
            MedicationName = item.MedicationName,
            Dosage = item.Dosage,
            Frequency = item.Frequency,
            Duration = item.Duration,
            Instructions = item.Instructions
        };
    }

    public async Task DeletePrescriptionItemAsync(int prescriptionId, int itemId, CancellationToken cancellationToken = default)
    {
        var item = await _context.PrescriptionItems
            .FirstOrDefaultAsync(i => i.PrescriptionId == prescriptionId && i.PrescriptionItemId == itemId, cancellationToken);

        if (item == null)
        {
            throw new NotFoundException($"Prescription item with ID {itemId} was not found on Prescription {prescriptionId}.");
        }

        _context.PrescriptionItems.Remove(item);
        await _context.SaveChangesAsync(cancellationToken);
    }
}

