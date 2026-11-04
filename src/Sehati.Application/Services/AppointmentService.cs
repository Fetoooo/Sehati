using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Sehati.Application.Common.Exceptions;
using Sehati.Application.Common.Interfaces;
using Sehati.Application.Common.Models;
using Sehati.Application.DTOs.Appointments;
using Sehati.Domain.Entities;
using Sehati.Domain.Enums;
using ValidationException = Sehati.Application.Common.Exceptions.ValidationException;

namespace Sehati.Application.Services;

public class AppointmentService : IAppointmentService
{
    private readonly IApplicationDbContext _context;
    private readonly IValidator<CreateAppointmentDto> _createAppointmentValidator;
    private readonly IValidator<UpdateAppointmentStatusDto> _updateAppointmentStatusValidator;
    private readonly IValidator<RescheduleAppointmentDto> _rescheduleAppointmentValidator;
    private readonly IValidator<CreateFollowUpDto> _createFollowUpValidator;
    private readonly IValidator<UpdateFollowUpStatusDto> _updateFollowUpStatusValidator;

    public AppointmentService(
        IApplicationDbContext context,
        IValidator<CreateAppointmentDto> createAppointmentValidator,
        IValidator<UpdateAppointmentStatusDto> updateAppointmentStatusValidator,
        IValidator<RescheduleAppointmentDto> rescheduleAppointmentValidator,
        IValidator<CreateFollowUpDto> createFollowUpValidator,
        IValidator<UpdateFollowUpStatusDto> updateFollowUpStatusValidator)
    {
        _context = context;
        _createAppointmentValidator = createAppointmentValidator;
        _updateAppointmentStatusValidator = updateAppointmentStatusValidator;
        _rescheduleAppointmentValidator = rescheduleAppointmentValidator;
        _createFollowUpValidator = createFollowUpValidator;
        _updateFollowUpStatusValidator = updateFollowUpStatusValidator;
    }

    public async Task<PaginatedList<AppointmentDto>> GetAppointmentsAsync(
        int? clinicId = null,
        int? doctorId = null,
        int? patientId = null,
        DateOnly? date = null,
        int pageNumber = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .Include(a => a.Clinic)
            .AsNoTracking();

        if (clinicId.HasValue)
        {
            query = query.Where(a => a.ClinicId == clinicId.Value);
        }

        if (doctorId.HasValue)
        {
            query = query.Where(a => a.DoctorId == doctorId.Value);
        }

        if (patientId.HasValue)
        {
            query = query.Where(a => a.PatientId == patientId.Value);
        }

        if (date.HasValue)
        {
            query = query.Where(a => a.AppointmentDate == date.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(a => a.AppointmentDate)
            .ThenBy(a => a.StartTime)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AppointmentDto
            {
                AppointmentId = a.AppointmentId,
                PatientId = a.PatientId,
                PatientName = a.Patient.FullName,
                UnifiedPatientId = a.Patient.UnifiedPatientId,
                DoctorId = a.DoctorId,
                DoctorName = a.Doctor.FullName,
                DoctorSpecialty = a.Doctor.Specialty,
                ClinicId = a.ClinicId,
                ClinicName = a.Clinic.ClinicName,
                AppointmentDate = a.AppointmentDate,
                StartTime = a.StartTime,
                EndTime = a.EndTime,
                Status = a.Status,
                Notes = a.Notes
            })
            .ToListAsync(cancellationToken);

        return new PaginatedList<AppointmentDto>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<AppointmentDto> GetAppointmentByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var appointment = await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .Include(a => a.Clinic)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.AppointmentId == id, cancellationToken);

        if (appointment == null)
        {
            throw new NotFoundException("Appointment", id);
        }

        return new AppointmentDto
        {
            AppointmentId = appointment.AppointmentId,
            PatientId = appointment.PatientId,
            PatientName = appointment.Patient.FullName,
            UnifiedPatientId = appointment.Patient.UnifiedPatientId,
            DoctorId = appointment.DoctorId,
            DoctorName = appointment.Doctor.FullName,
            DoctorSpecialty = appointment.Doctor.Specialty,
            ClinicId = appointment.ClinicId,
            ClinicName = appointment.Clinic.ClinicName,
            AppointmentDate = appointment.AppointmentDate,
            StartTime = appointment.StartTime,
            EndTime = appointment.EndTime,
            Status = appointment.Status,
            Notes = appointment.Notes
        };
    }

    public async Task<AppointmentDto> CreateAppointmentAsync(CreateAppointmentDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _createAppointmentValidator.ValidateAsync(dto, cancellationToken);
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

        // Check doctor double-booking conflict
        var doctorConflict = await _context.Appointments
            .AnyAsync(a => a.DoctorId == dto.DoctorId &&
                           a.AppointmentDate == dto.AppointmentDate &&
                           a.Status != AppointmentStatus.Cancelled &&
                           a.StartTime < dto.EndTime &&
                           dto.StartTime < a.EndTime, cancellationToken);

        if (doctorConflict)
        {
            throw new ConflictException("The doctor already has an appointment scheduled during this time slot.");
        }

        // Check patient double-booking conflict
        var patientConflict = await _context.Appointments
            .AnyAsync(a => a.PatientId == dto.PatientId &&
                           a.AppointmentDate == dto.AppointmentDate &&
                           a.Status != AppointmentStatus.Cancelled &&
                           a.StartTime < dto.EndTime &&
                           dto.StartTime < a.EndTime, cancellationToken);

        if (patientConflict)
        {
            throw new ConflictException("The patient already has an appointment scheduled during this time slot.");
        }

        var appointment = new Appointment
        {
            PatientId = dto.PatientId,
            DoctorId = dto.DoctorId,
            ClinicId = dto.ClinicId,
            AppointmentDate = dto.AppointmentDate,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            Status = AppointmentStatus.Pending,
            Notes = dto.Notes?.Trim()
        };

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync(cancellationToken);

        return new AppointmentDto
        {
            AppointmentId = appointment.AppointmentId,
            PatientId = patient.PatientId,
            PatientName = patient.FullName,
            UnifiedPatientId = patient.UnifiedPatientId,
            DoctorId = doctor.DoctorId,
            DoctorName = doctor.FullName,
            DoctorSpecialty = doctor.Specialty,
            ClinicId = clinic.ClinicId,
            ClinicName = clinic.ClinicName,
            AppointmentDate = appointment.AppointmentDate,
            StartTime = appointment.StartTime,
            EndTime = appointment.EndTime,
            Status = appointment.Status,
            Notes = appointment.Notes
        };
    }

    public async Task<AppointmentDto> UpdateAppointmentStatusAsync(int id, UpdateAppointmentStatusDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _updateAppointmentStatusValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            throw new ValidationException(errors);
        }

        var appointment = await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .Include(a => a.Clinic)
            .FirstOrDefaultAsync(a => a.AppointmentId == id, cancellationToken);

        if (appointment == null)
        {
            throw new NotFoundException("Appointment", id);
        }

        appointment.Status = dto.Status;
        if (!string.IsNullOrEmpty(dto.Notes))
        {
            appointment.Notes = dto.Notes.Trim();
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new AppointmentDto
        {
            AppointmentId = appointment.AppointmentId,
            PatientId = appointment.PatientId,
            PatientName = appointment.Patient.FullName,
            UnifiedPatientId = appointment.Patient.UnifiedPatientId,
            DoctorId = appointment.DoctorId,
            DoctorName = appointment.Doctor.FullName,
            DoctorSpecialty = appointment.Doctor.Specialty,
            ClinicId = appointment.ClinicId,
            ClinicName = appointment.Clinic.ClinicName,
            AppointmentDate = appointment.AppointmentDate,
            StartTime = appointment.StartTime,
            EndTime = appointment.EndTime,
            Status = appointment.Status,
            Notes = appointment.Notes
        };
    }

    public async Task<AppointmentDto> RescheduleAppointmentAsync(int id, RescheduleAppointmentDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _rescheduleAppointmentValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            throw new ValidationException(errors);
        }

        var appointment = await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .Include(a => a.Clinic)
            .FirstOrDefaultAsync(a => a.AppointmentId == id, cancellationToken);

        if (appointment == null)
        {
            throw new NotFoundException("Appointment", id);
        }

        // Check doctor conflict
        var doctorConflict = await _context.Appointments
            .AnyAsync(a => a.AppointmentId != id &&
                           a.DoctorId == appointment.DoctorId &&
                           a.AppointmentDate == dto.AppointmentDate &&
                           a.Status != AppointmentStatus.Cancelled &&
                           a.StartTime < dto.EndTime &&
                           dto.StartTime < a.EndTime, cancellationToken);

        if (doctorConflict)
        {
            throw new ConflictException("The doctor already has an appointment scheduled during the new time slot.");
        }

        // Check patient conflict
        var patientConflict = await _context.Appointments
            .AnyAsync(a => a.AppointmentId != id &&
                           a.PatientId == appointment.PatientId &&
                           a.AppointmentDate == dto.AppointmentDate &&
                           a.Status != AppointmentStatus.Cancelled &&
                           a.StartTime < dto.EndTime &&
                           dto.StartTime < a.EndTime, cancellationToken);

        if (patientConflict)
        {
            throw new ConflictException("The patient already has an appointment scheduled during the new time slot.");
        }

        appointment.AppointmentDate = dto.AppointmentDate;
        appointment.StartTime = dto.StartTime;
        appointment.EndTime = dto.EndTime;
        if (!string.IsNullOrEmpty(dto.Notes))
        {
            appointment.Notes = dto.Notes.Trim();
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new AppointmentDto
        {
            AppointmentId = appointment.AppointmentId,
            PatientId = appointment.PatientId,
            PatientName = appointment.Patient.FullName,
            UnifiedPatientId = appointment.Patient.UnifiedPatientId,
            DoctorId = appointment.DoctorId,
            DoctorName = appointment.Doctor.FullName,
            DoctorSpecialty = appointment.Doctor.Specialty,
            ClinicId = appointment.ClinicId,
            ClinicName = appointment.Clinic.ClinicName,
            AppointmentDate = appointment.AppointmentDate,
            StartTime = appointment.StartTime,
            EndTime = appointment.EndTime,
            Status = appointment.Status,
            Notes = appointment.Notes
        };
    }

    public async Task<IEnumerable<QueueItemDto>> GetDailyQueueAsync(int clinicId, DateOnly date, CancellationToken cancellationToken = default)
    {
        var clinicExists = await _context.Clinics.AnyAsync(c => c.ClinicId == clinicId, cancellationToken);
        if (!clinicExists)
        {
            throw new NotFoundException("Clinic", clinicId);
        }

        var appointments = await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .Where(a => a.ClinicId == clinicId &&
                        a.AppointmentDate == date &&
                        a.Status != AppointmentStatus.Cancelled)
            .OrderBy(a => a.StartTime)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return appointments.Select((a, idx) => new QueueItemDto
        {
            QueueNumber = idx + 1,
            AppointmentId = a.AppointmentId,
            PatientId = a.PatientId,
            PatientName = a.Patient.FullName,
            UnifiedPatientId = a.Patient.UnifiedPatientId,
            DoctorId = a.DoctorId,
            DoctorName = a.Doctor.FullName,
            AppointmentDate = a.AppointmentDate,
            StartTime = a.StartTime,
            Status = a.Status
        }).ToList();
    }

    public async Task<IEnumerable<FollowUpDto>> GetFollowUpsAsync(int? patientId = null, int? doctorId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.FollowUps
            .Include(f => f.Patient)
            .Include(f => f.Doctor)
            .AsNoTracking();

        if (patientId.HasValue)
        {
            query = query.Where(f => f.PatientId == patientId.Value);
        }

        if (doctorId.HasValue)
        {
            query = query.Where(f => f.DoctorId == doctorId.Value);
        }

        return await query
            .OrderByDescending(f => f.FollowUpDate)
            .Select(f => new FollowUpDto
            {
                FollowUpId = f.FollowUpId,
                PatientId = f.PatientId,
                PatientName = f.Patient.FullName,
                UnifiedPatientId = f.Patient.UnifiedPatientId,
                DoctorId = f.DoctorId,
                DoctorName = f.Doctor.FullName,
                VisitId = f.VisitId,
                FollowUpDate = f.FollowUpDate,
                Notes = f.Notes,
                Status = f.Status
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<FollowUpDto> GetFollowUpByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var followUp = await _context.FollowUps
            .Include(f => f.Patient)
            .Include(f => f.Doctor)
            .AsNoTracking()
            .FirstOrDefaultAsync(f => f.FollowUpId == id, cancellationToken);

        if (followUp == null)
        {
            throw new NotFoundException("FollowUp", id);
        }

        return new FollowUpDto
        {
            FollowUpId = followUp.FollowUpId,
            PatientId = followUp.PatientId,
            PatientName = followUp.Patient.FullName,
            UnifiedPatientId = followUp.Patient.UnifiedPatientId,
            DoctorId = followUp.DoctorId,
            DoctorName = followUp.Doctor.FullName,
            VisitId = followUp.VisitId,
            FollowUpDate = followUp.FollowUpDate,
            Notes = followUp.Notes,
            Status = followUp.Status
        };
    }

    public async Task<FollowUpDto> CreateFollowUpAsync(CreateFollowUpDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _createFollowUpValidator.ValidateAsync(dto, cancellationToken);
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

        var visit = await _context.Visits.FindAsync(new object[] { dto.VisitId }, cancellationToken);
        if (visit == null)
        {
            throw new NotFoundException("Visit", dto.VisitId);
        }

        var followUp = new FollowUp
        {
            PatientId = dto.PatientId,
            DoctorId = dto.DoctorId,
            VisitId = dto.VisitId,
            FollowUpDate = dto.FollowUpDate,
            Notes = dto.Notes?.Trim(),
            Status = FollowUpStatus.Scheduled
        };

        _context.FollowUps.Add(followUp);
        await _context.SaveChangesAsync(cancellationToken);

        return new FollowUpDto
        {
            FollowUpId = followUp.FollowUpId,
            PatientId = patient.PatientId,
            PatientName = patient.FullName,
            UnifiedPatientId = patient.UnifiedPatientId,
            DoctorId = doctor.DoctorId,
            DoctorName = doctor.FullName,
            VisitId = followUp.VisitId,
            FollowUpDate = followUp.FollowUpDate,
            Notes = followUp.Notes,
            Status = followUp.Status
        };
    }

    public async Task<FollowUpDto> UpdateFollowUpStatusAsync(int id, UpdateFollowUpStatusDto dto, CancellationToken cancellationToken = default)
    {
        var validationResult = await _updateFollowUpStatusValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            throw new ValidationException(errors);
        }

        var followUp = await _context.FollowUps
            .Include(f => f.Patient)
            .Include(f => f.Doctor)
            .FirstOrDefaultAsync(f => f.FollowUpId == id, cancellationToken);

        if (followUp == null)
        {
            throw new NotFoundException("FollowUp", id);
        }

        followUp.Status = dto.Status;
        if (!string.IsNullOrEmpty(dto.Notes))
        {
            followUp.Notes = dto.Notes.Trim();
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new FollowUpDto
        {
            FollowUpId = followUp.FollowUpId,
            PatientId = followUp.PatientId,
            PatientName = followUp.Patient.FullName,
            UnifiedPatientId = followUp.Patient.UnifiedPatientId,
            DoctorId = followUp.DoctorId,
            DoctorName = followUp.Doctor.FullName,
            VisitId = followUp.VisitId,
            FollowUpDate = followUp.FollowUpDate,
            Notes = followUp.Notes,
            Status = followUp.Status
        };
    }
}

