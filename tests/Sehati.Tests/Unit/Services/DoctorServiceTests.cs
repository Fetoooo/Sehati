using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Sehati.Application.Common.Exceptions;
using Sehati.Application.DTOs.Doctors;
using Sehati.Application.Services;
using Sehati.Application.Validators.Doctors;
using Sehati.Domain.Entities;
using Sehati.Domain.Enums;
using Sehati.Infrastructure.Persistence;
using Sehati.Infrastructure.Services;
using Sehati.Tests.Common;

namespace Sehati.Tests.Unit.Services;

public class DoctorServiceTests
{
    private readonly SehatiDbContext _context;
    private readonly PasswordHasherService _hasher;
    private readonly DoctorService _doctorService;

    public DoctorServiceTests()
    {
        var options = new DbContextOptionsBuilder<SehatiDbContext>()
            .UseInMemoryDatabase(databaseName: $"SehatiDoctorTestDb_{Guid.NewGuid()}")
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

        _hasher = new PasswordHasherService();

        _doctorService = new DoctorService(
            _context,
            _hasher,
            new CreateDoctorDtoValidator(),
            new UpdateDoctorDtoValidator()
        );
    }

    [Fact]
    public async Task CreateDoctorAsync_WithValidData_CreatesDoctorAndUser()
    {
        // Arrange
        var clinic = new Clinic
        {
            ClinicName = "Cairo Care Center",
            Specialty = "Neurology",
            Address = "Nasr City",
            Phone = "+201011223344",
            Email = "cairocare@test.com",
            WorkingHours = "09:00 - 17:00",
            Status = ClinicStatus.Active
        };
        _context.Clinics.Add(clinic);
        await _context.SaveChangesAsync();

        var dto = new CreateDoctorDto
        {
            FullName = "Dr. Tamer Neurology",
            Specialty = "Neurology",
            LicenseNumber = "EGY-DOC-8899",
            Phone = "+201012345678",
            Email = "dr.tamer@hospital.com",
            Password = TestAuthHelper.CreateValidPassword(),
            InitialClinicId = clinic.ClinicId
        };

        // Act
        var result = await _doctorService.CreateDoctorAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.DoctorId.Should().BeGreaterThan(0);
        result.FullName.Should().Be("Dr. Tamer Neurology");
        result.Specialty.Should().Be("Neurology");
        result.LicenseNumber.Should().Be("EGY-DOC-8899");
        result.AffiliatedClinicsCount.Should().Be(1);

        var doctorInDb = await _context.Doctors
            .Include(d => d.User)
            .Include(d => d.ClinicDoctors)
            .FirstOrDefaultAsync(d => d.DoctorId == result.DoctorId);

        doctorInDb.Should().NotBeNull();
        doctorInDb!.User.RoleId.Should().Be(2); // Doctor
        doctorInDb.ClinicDoctors.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetDoctorsAsync_WithSpecialtyFilter_ReturnsMatchingDoctors()
    {
        // Arrange
        var user1 = new User { Email = "doc1@test.com", Phone = "+201090000001", RoleId = 2, PasswordHash = "hash" };
        var user2 = new User { Email = "doc2@test.com", Phone = "+201090000002", RoleId = 2, PasswordHash = "hash" };
        _context.Users.AddRange(user1, user2);
        await _context.SaveChangesAsync();

        _context.Doctors.AddRange(
            new Doctor { UserId = user1.UserId, FullName = "Dr. Ali Cardio", Specialty = "Cardiology", LicenseNumber = "C1", Phone = user1.Phone, Email = user1.Email },
            new Doctor { UserId = user2.UserId, FullName = "Dr. Maha Neuro", Specialty = "Neurology", LicenseNumber = "N1", Phone = user2.Phone, Email = user2.Email }
        );
        await _context.SaveChangesAsync();

        // Act
        var result = await _doctorService.GetDoctorsAsync(specialty: "Cardio");

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items.First().FullName.Should().Be("Dr. Ali Cardio");
    }

    [Fact]
    public async Task GetDoctorScheduleAsync_ReturnsChronologicalAppointmentsForDay()
    {
        // Arrange
        var clinic = new Clinic
        {
            ClinicName = "Metro Clinic",
            Specialty = "General",
            Address = "Downtown",
            Phone = "+201011119999",
            Email = "metro@test.com",
            WorkingHours = "08:00 - 18:00",
            Status = ClinicStatus.Active
        };
        _context.Clinics.Add(clinic);

        var docUser = new User { Email = "dr.schedule@test.com", Phone = "+201011119998", RoleId = 2, PasswordHash = "hash" };
        _context.Users.Add(docUser);
        await _context.SaveChangesAsync();

        var doctor = new Doctor
        {
            UserId = docUser.UserId,
            FullName = "Dr. Sameh Schedule",
            Specialty = "General Practice",
            LicenseNumber = "DOC-SCH-1",
            Phone = docUser.Phone,
            Email = docUser.Email
        };
        _context.Doctors.Add(doctor);

        var patUser = new User { Email = "patient.sch@test.com", Phone = "+201011119997", RoleId = 1, PasswordHash = "hash" };
        _context.Users.Add(patUser);
        await _context.SaveChangesAsync();

        var patient = new Patient
        {
            UserId = patUser.UserId,
            FullName = "Patient Gamal",
            UnifiedPatientId = "SH-2026-000101",
            DateOfBirth = new DateOnly(1990, 5, 10),
            Gender = Gender.Male
        };
        _context.Patients.Add(patient);
        await _context.SaveChangesAsync();

        var targetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));

        _context.Appointments.AddRange(
            new Appointment
            {
                ClinicId = clinic.ClinicId,
                DoctorId = doctor.DoctorId,
                PatientId = patient.PatientId,
                AppointmentDate = targetDate,
                StartTime = new TimeOnly(11, 0),
                EndTime = new TimeOnly(11, 30),
                Status = AppointmentStatus.Confirmed
            },
            new Appointment
            {
                ClinicId = clinic.ClinicId,
                DoctorId = doctor.DoctorId,
                PatientId = patient.PatientId,
                AppointmentDate = targetDate,
                StartTime = new TimeOnly(9, 0),
                EndTime = new TimeOnly(9, 30),
                Status = AppointmentStatus.Confirmed
            }
        );
        await _context.SaveChangesAsync();

        // Act
        var result = await _doctorService.GetDoctorScheduleAsync(doctor.DoctorId, targetDate);

        // Assert
        result.Should().NotBeNull();
        result.Slots.Should().HaveCount(2);
        result.Slots[0].StartTime.Should().Be(new TimeOnly(9, 0));
        result.Slots[1].StartTime.Should().Be(new TimeOnly(11, 0));
    }
}

