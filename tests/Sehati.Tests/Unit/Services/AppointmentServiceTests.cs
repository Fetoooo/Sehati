using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Sehati.Application.Common.Exceptions;
using Sehati.Application.DTOs.Appointments;
using Sehati.Application.Services;
using Sehati.Application.Validators.Appointments;
using Sehati.Domain.Entities;
using Sehati.Domain.Enums;
using Sehati.Infrastructure.Persistence;

namespace Sehati.Tests.Unit.Services;

public class AppointmentServiceTests
{
    private readonly SehatiDbContext _context;
    private readonly AppointmentService _appointmentService;

    public AppointmentServiceTests()
    {
        var options = new DbContextOptionsBuilder<SehatiDbContext>()
            .UseInMemoryDatabase(databaseName: $"SehatiAppointmentTestDb_{Guid.NewGuid()}")
            .Options;

        _context = new SehatiDbContext(options);

        // Seed roles
        _context.Roles.AddRange(
            new Role { RoleId = 1, RoleName = "Patient" },
            new Role { RoleId = 2, RoleName = "Doctor" },
            new Role { RoleId = 3, RoleName = "Receptionist" },
            new Role { RoleId = 4, RoleName = "ClinicAdmin" },
            new Role { RoleId = 5, RoleName = "SystemAdmin" }
        );
        _context.SaveChanges();

        _appointmentService = new AppointmentService(
            _context,
            new CreateAppointmentDtoValidator(),
            new UpdateAppointmentStatusDtoValidator(),
            new RescheduleAppointmentDtoValidator(),
            new CreateFollowUpDtoValidator(),
            new UpdateFollowUpStatusDtoValidator()
        );
    }

    private async Task<(Clinic clinic, Doctor doctor, Patient patient)> SeedBaseEntitiesAsync()
    {
        var clinic = new Clinic
        {
            ClinicName = "Al-Amal Medical Center",
            Specialty = "General",
            Address = "Nasr City",
            Phone = "+201011112222",
            Email = "alamal@example.com",
            WorkingHours = "09:00 - 17:00",
            Status = ClinicStatus.Active
        };
        _context.Clinics.Add(clinic);

        var docUser = new User { Email = "dr.doc@test.com", Phone = "+201022223333", RoleId = 2, PasswordHash = "hash" };
        _context.Users.Add(docUser);
        await _context.SaveChangesAsync();

        var doctor = new Doctor
        {
            UserId = docUser.UserId,
            FullName = "Dr. Magdy Yacoub",
            Specialty = "Cardiology",
            LicenseNumber = "DOC-CAR-101",
            Phone = docUser.Phone,
            Email = docUser.Email
        };
        _context.Doctors.Add(doctor);

        var patUser = new User { Email = "pat.patient@test.com", Phone = "+201033334444", RoleId = 1, PasswordHash = "hash" };
        _context.Users.Add(patUser);
        await _context.SaveChangesAsync();

        var patient = new Patient
        {
            UserId = patUser.UserId,
            FullName = "Hassan Ahmed",
            UnifiedPatientId = "SH-2026-000201",
            DateOfBirth = new DateOnly(1985, 3, 15),
            Gender = Gender.Male
        };
        _context.Patients.Add(patient);

        await _context.SaveChangesAsync();
        return (clinic, doctor, patient);
    }

    [Fact]
    public async Task CreateAppointmentAsync_WithValidData_CreatesAppointment()
    {
        // Arrange
        var (clinic, doctor, patient) = await SeedBaseEntitiesAsync();
        var tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));

        var dto = new CreateAppointmentDto
        {
            ClinicId = clinic.ClinicId,
            DoctorId = doctor.DoctorId,
            PatientId = patient.PatientId,
            AppointmentDate = tomorrow,
            StartTime = new TimeOnly(10, 0),
            EndTime = new TimeOnly(10, 30),
            Notes = "Regular checkup"
        };

        // Act
        var result = await _appointmentService.CreateAppointmentAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.AppointmentId.Should().BeGreaterThan(0);
        result.PatientName.Should().Be("Hassan Ahmed");
        result.DoctorName.Should().Be("Dr. Magdy Yacoub");
        result.ClinicName.Should().Be("Al-Amal Medical Center");
        result.Status.Should().Be(AppointmentStatus.Pending);

        var inDb = await _context.Appointments.FindAsync(result.AppointmentId);
        inDb.Should().NotBeNull();
        inDb!.Notes.Should().Be("Regular checkup");
    }

    [Fact]
    public async Task CreateAppointmentAsync_WhenDoctorHasOverlappingAppointment_ThrowsConflictException()
    {
        // Arrange
        var (clinic, doctor, patient) = await SeedBaseEntitiesAsync();
        var tomorrow = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));

        _context.Appointments.Add(new Appointment
        {
            ClinicId = clinic.ClinicId,
            DoctorId = doctor.DoctorId,
            PatientId = patient.PatientId,
            AppointmentDate = tomorrow,
            StartTime = new TimeOnly(14, 0),
            EndTime = new TimeOnly(14, 30),
            Status = AppointmentStatus.Confirmed
        });
        await _context.SaveChangesAsync();

        var patUser2 = new User { Email = "pat2@test.com", Phone = "+201044445555", RoleId = 1, PasswordHash = "hash" };
        _context.Users.Add(patUser2);
        await _context.SaveChangesAsync();

        var patient2 = new Patient
        {
            UserId = patUser2.UserId,
            FullName = "Ali Mahmoud",
            UnifiedPatientId = "SH-2026-000202",
            DateOfBirth = new DateOnly(1992, 1, 1),
            Gender = Gender.Male
        };
        _context.Patients.Add(patient2);
        await _context.SaveChangesAsync();

        var conflictingDto = new CreateAppointmentDto
        {
            ClinicId = clinic.ClinicId,
            DoctorId = doctor.DoctorId,
            PatientId = patient2.PatientId,
            AppointmentDate = tomorrow,
            StartTime = new TimeOnly(14, 15),
            EndTime = new TimeOnly(14, 45)
        };

        // Act
        var act = () => _appointmentService.CreateAppointmentAsync(conflictingDto);

        // Assert
        await act.Should().ThrowAsync<ConflictException>()
            .WithMessage("*doctor already has an appointment*");
    }

    [Fact]
    public async Task UpdateAppointmentStatusAsync_UpdatesStatus()
    {
        // Arrange
        var (clinic, doctor, patient) = await SeedBaseEntitiesAsync();
        var appointment = new Appointment
        {
            ClinicId = clinic.ClinicId,
            DoctorId = doctor.DoctorId,
            PatientId = patient.PatientId,
            AppointmentDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2)),
            StartTime = new TimeOnly(11, 0),
            EndTime = new TimeOnly(11, 30),
            Status = AppointmentStatus.Pending
        };
        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();

        var updateDto = new UpdateAppointmentStatusDto
        {
            Status = AppointmentStatus.Confirmed,
            Notes = "Confirmed via phone"
        };

        // Act
        var result = await _appointmentService.UpdateAppointmentStatusAsync(appointment.AppointmentId, updateDto);

        // Assert
        result.Status.Should().Be(AppointmentStatus.Confirmed);
        result.Notes.Should().Be("Confirmed via phone");

        var inDb = await _context.Appointments.FindAsync(appointment.AppointmentId);
        inDb!.Status.Should().Be(AppointmentStatus.Confirmed);
    }

    [Fact]
    public async Task RescheduleAppointmentAsync_WithValidNewSlot_UpdatesAppointmentTime()
    {
        // Arrange
        var (clinic, doctor, patient) = await SeedBaseEntitiesAsync();
        var originalDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        var newDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(3));

        var appointment = new Appointment
        {
            ClinicId = clinic.ClinicId,
            DoctorId = doctor.DoctorId,
            PatientId = patient.PatientId,
            AppointmentDate = originalDate,
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(9, 30),
            Status = AppointmentStatus.Confirmed
        };
        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();

        var rescheduleDto = new RescheduleAppointmentDto
        {
            AppointmentDate = newDate,
            StartTime = new TimeOnly(15, 0),
            EndTime = new TimeOnly(15, 30),
            Notes = "Patient requested change"
        };

        // Act
        var result = await _appointmentService.RescheduleAppointmentAsync(appointment.AppointmentId, rescheduleDto);

        // Assert
        result.AppointmentDate.Should().Be(newDate);
        result.StartTime.Should().Be(new TimeOnly(15, 0));
        result.EndTime.Should().Be(new TimeOnly(15, 30));

        var inDb = await _context.Appointments.FindAsync(appointment.AppointmentId);
        inDb!.AppointmentDate.Should().Be(newDate);
    }

    [Fact]
    public async Task GetDailyQueueAsync_ReturnsOrderedQueueWithSequentialNumbers()
    {
        // Arrange
        var (clinic, doctor, patient) = await SeedBaseEntitiesAsync();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var patUser2 = new User { Email = "pat.queue2@test.com", Phone = "+201088889999", RoleId = 1, PasswordHash = "hash" };
        _context.Users.Add(patUser2);
        await _context.SaveChangesAsync();

        var patient2 = new Patient
        {
            UserId = patUser2.UserId,
            FullName = "Kareem Tarek",
            UnifiedPatientId = "SH-2026-000203",
            DateOfBirth = new DateOnly(1995, 6, 20),
            Gender = Gender.Male
        };
        _context.Patients.Add(patient2);
        await _context.SaveChangesAsync();

        // Add 2 appointments in reverse order of time
        _context.Appointments.AddRange(
            new Appointment
            {
                ClinicId = clinic.ClinicId,
                DoctorId = doctor.DoctorId,
                PatientId = patient2.PatientId,
                AppointmentDate = today,
                StartTime = new TimeOnly(10, 30),
                EndTime = new TimeOnly(11, 0),
                Status = AppointmentStatus.Confirmed
            },
            new Appointment
            {
                ClinicId = clinic.ClinicId,
                DoctorId = doctor.DoctorId,
                PatientId = patient.PatientId,
                AppointmentDate = today,
                StartTime = new TimeOnly(9, 0),
                EndTime = new TimeOnly(9, 30),
                Status = AppointmentStatus.Confirmed
            }
        );
        await _context.SaveChangesAsync();

        // Act
        var queue = (await _appointmentService.GetDailyQueueAsync(clinic.ClinicId, today)).ToList();

        // Assert
        queue.Should().HaveCount(2);
        queue[0].QueueNumber.Should().Be(1);
        queue[0].PatientName.Should().Be("Hassan Ahmed");
        queue[0].StartTime.Should().Be(new TimeOnly(9, 0));

        queue[1].QueueNumber.Should().Be(2);
        queue[1].PatientName.Should().Be("Kareem Tarek");
        queue[1].StartTime.Should().Be(new TimeOnly(10, 30));
    }

    [Fact]
    public async Task CreateFollowUpAsync_WithValidData_CreatesFollowUp()
    {
        // Arrange
        var (clinic, doctor, patient) = await SeedBaseEntitiesAsync();

        var visit = new Visit
        {
            ClinicId = clinic.ClinicId,
            DoctorId = doctor.DoctorId,
            PatientId = patient.PatientId,
            VisitDate = DateTime.UtcNow.AddDays(-1),
            ChiefComplaint = "Initial consultation"
        };
        _context.Visits.Add(visit);
        await _context.SaveChangesAsync();

        var nextWeek = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7));
        var dto = new CreateFollowUpDto
        {
            PatientId = patient.PatientId,
            DoctorId = doctor.DoctorId,
            VisitId = visit.VisitId,
            FollowUpDate = nextWeek,
            Notes = "Re-check blood pressure"
        };

        // Act
        var result = await _appointmentService.CreateFollowUpAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.FollowUpId.Should().BeGreaterThan(0);
        result.PatientName.Should().Be("Hassan Ahmed");
        result.DoctorName.Should().Be("Dr. Magdy Yacoub");
        result.Status.Should().Be(FollowUpStatus.Scheduled);
        result.Notes.Should().Be("Re-check blood pressure");

        var inDb = await _context.FollowUps.FindAsync(result.FollowUpId);
        inDb.Should().NotBeNull();
        inDb!.Notes.Should().Be("Re-check blood pressure");
    }
}

