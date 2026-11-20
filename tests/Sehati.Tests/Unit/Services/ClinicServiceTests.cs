using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Sehati.Application.Common.Exceptions;
using Sehati.Application.DTOs.Clinics;
using Sehati.Application.Services;
using Sehati.Application.Validators.Clinics;
using Sehati.Domain.Entities;
using Sehati.Domain.Enums;
using Sehati.Infrastructure.Persistence;
using Sehati.Infrastructure.Services;
using Sehati.Tests.Common;

namespace Sehati.Tests.Unit.Services;

public class ClinicServiceTests
{
    private readonly SehatiDbContext _context;
    private readonly PasswordHasherService _hasher;
    private readonly ClinicService _clinicService;

    public ClinicServiceTests()
    {
        var options = new DbContextOptionsBuilder<SehatiDbContext>()
            .UseInMemoryDatabase(databaseName: $"SehatiClinicTestDb_{Guid.NewGuid()}")
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

        _clinicService = new ClinicService(
            _context,
            _hasher,
            new CreateClinicDtoValidator(),
            new UpdateClinicDtoValidator(),
            new AffiliateDoctorDtoValidator(),
            new CreateReceptionistDtoValidator()
        );
    }

    [Fact]
    public async Task CreateClinicAsync_WithValidData_CreatesClinic()
    {
        // Arrange
        var dto = new CreateClinicDto
        {
            ClinicName = "Al-Shifa Cardiology Clinic",
            Specialty = "Cardiology",
            Address = "123 Nile St, Cairo",
            Phone = "+201011112222",
            Email = "alshifa@example.com",
            WorkingHours = "09:00 - 17:00",
            Status = ClinicStatus.Active
        };

        // Act
        var result = await _clinicService.CreateClinicAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.ClinicId.Should().BeGreaterThan(0);
        result.ClinicName.Should().Be("Al-Shifa Cardiology Clinic");
        result.Specialty.Should().Be("Cardiology");
        result.Email.Should().Be("alshifa@example.com");

        var inDb = await _context.Clinics.FindAsync(result.ClinicId);
        inDb.Should().NotBeNull();
        inDb!.ClinicName.Should().Be("Al-Shifa Cardiology Clinic");
    }

    [Fact]
    public async Task CreateClinicAsync_WithDuplicateEmail_ThrowsConflictException()
    {
        // Arrange
        var clinic = new Clinic
        {
            ClinicName = "Original Clinic",
            Specialty = "General",
            Address = "Address 1",
            Phone = "+201011112223",
            Email = "duplicate@clinic.com",
            WorkingHours = "09:00 - 17:00",
            Status = ClinicStatus.Active
        };
        _context.Clinics.Add(clinic);
        await _context.SaveChangesAsync();

        var dto = new CreateClinicDto
        {
            ClinicName = "Another Clinic",
            Specialty = "Pediatrics",
            Address = "Address 2",
            Phone = "+201011112224",
            Email = "duplicate@clinic.com",
            WorkingHours = "09:00 - 17:00",
            Status = ClinicStatus.Active
        };

        // Act
        var act = () => _clinicService.CreateClinicAsync(dto);

        // Assert
        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task GetClinicsAsync_ReturnsPaginatedClinics()
    {
        // Arrange
        for (int i = 1; i <= 5; i++)
        {
            _context.Clinics.Add(new Clinic
            {
                ClinicName = $"Clinic {i}",
                Specialty = "General Care",
                Address = $"Street {i}",
                Phone = $"+20109999000{i}",
                Email = $"clinic{i}@test.com",
                WorkingHours = "08:00 - 16:00",
                Status = ClinicStatus.Active
            });
        }
        await _context.SaveChangesAsync();

        // Act
        var result = await _clinicService.GetClinicsAsync(pageNumber: 1, pageSize: 3);

        // Assert
        result.Items.Should().HaveCount(3);
        result.TotalCount.Should().Be(5);
        result.TotalPages.Should().Be(2);
    }

    [Fact]
    public async Task GetClinicByIdAsync_ReturnsClinicDetailsWithStaff()
    {
        // Arrange
        var clinic = new Clinic
        {
            ClinicName = "Cairo Specialized Clinic",
            Specialty = "Orthopedics",
            Address = "Tahrir Square",
            Phone = "+201055556666",
            Email = "cairo.specialized@test.com",
            WorkingHours = "10:00 - 20:00",
            Status = ClinicStatus.Active
        };
        _context.Clinics.Add(clinic);
        await _context.SaveChangesAsync();

        var user = new User
        {
            Email = "doctor.ortho@test.com",
            Phone = "+201055556667",
            RoleId = 2,
            PasswordHash = "hash"
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var doctor = new Doctor
        {
            UserId = user.UserId,
            FullName = "Dr. Ahmed Ortho",
            Specialty = "Orthopedics",
            LicenseNumber = "DOC-ORTHO-1",
            Phone = user.Phone,
            Email = user.Email
        };
        _context.Doctors.Add(doctor);
        await _context.SaveChangesAsync();

        _context.ClinicDoctors.Add(new ClinicDoctor
        {
            ClinicId = clinic.ClinicId,
            DoctorId = doctor.DoctorId,
            Status = ClinicStatus.Active
        });
        await _context.SaveChangesAsync();

        // Act
        var result = await _clinicService.GetClinicByIdAsync(clinic.ClinicId);

        // Assert
        result.Should().NotBeNull();
        result.ClinicName.Should().Be("Cairo Specialized Clinic");
        result.Doctors.Should().HaveCount(1);
        result.Doctors.First().DoctorName.Should().Be("Dr. Ahmed Ortho");
    }

    [Fact]
    public async Task AffiliateDoctorAsync_AssociatesDoctorWithClinic()
    {
        // Arrange
        var clinic = new Clinic
        {
            ClinicName = "Alexandria Health Center",
            Specialty = "Dermatology",
            Address = "Corniche Alex",
            Phone = "+201077778888",
            Email = "alex.health@test.com",
            WorkingHours = "09:00 - 18:00",
            Status = ClinicStatus.Active
        };
        _context.Clinics.Add(clinic);

        var user = new User
        {
            Email = "dr.derm@test.com",
            Phone = "+201077778889",
            RoleId = 2,
            PasswordHash = "hash"
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var doctor = new Doctor
        {
            UserId = user.UserId,
            FullName = "Dr. Sara Derm",
            Specialty = "Dermatology",
            LicenseNumber = "DOC-DERM-2",
            Phone = user.Phone,
            Email = user.Email
        };
        _context.Doctors.Add(doctor);
        await _context.SaveChangesAsync();

        // Act
        var dto = new AffiliateDoctorDto { DoctorId = doctor.DoctorId, Status = ClinicStatus.Active };
        var result = await _clinicService.AffiliateDoctorAsync(clinic.ClinicId, dto);

        // Assert
        result.Should().NotBeNull();
        result.ClinicId.Should().Be(clinic.ClinicId);
        result.DoctorId.Should().Be(doctor.DoctorId);
        result.DoctorName.Should().Be("Dr. Sara Derm");

        var affiliationInDb = await _context.ClinicDoctors
            .FirstOrDefaultAsync(cd => cd.ClinicId == clinic.ClinicId && cd.DoctorId == doctor.DoctorId);
        affiliationInDb.Should().NotBeNull();
    }

    [Fact]
    public async Task AddReceptionistAsync_CreatesReceptionistUserAndLink()
    {
        // Arrange
        var clinic = new Clinic
        {
            ClinicName = "Giza Clinic",
            Specialty = "Pediatrics",
            Address = "Giza",
            Phone = "+201033334444",
            Email = "giza@test.com",
            WorkingHours = "08:00 - 16:00",
            Status = ClinicStatus.Active
        };
        _context.Clinics.Add(clinic);
        await _context.SaveChangesAsync();

        var dto = new CreateReceptionistDto
        {
            FullName = "Mona Receptionist",
            Email = "mona.reception@test.com",
            Phone = "+201033334445",
            Password = TestAuthHelper.CreateValidPassword()
        };

        // Act
        var result = await _clinicService.AddReceptionistAsync(clinic.ClinicId, dto);

        // Assert
        result.Should().NotBeNull();
        result.FullName.Should().Be("Mona Receptionist");
        result.Email.Should().Be("mona.reception@test.com");
        result.ClinicId.Should().Be(clinic.ClinicId);

        var receptionistInDb = await _context.Receptionists
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.ReceptionistId == result.ReceptionistId);
        receptionistInDb.Should().NotBeNull();
        receptionistInDb!.User.RoleId.Should().Be(3); // Receptionist
    }

    [Fact]
    public async Task UpdateClinicAsync_WithValidData_UpdatesClinic()
    {
        // Arrange
        var clinic = new Clinic
        {
            ClinicName = "Original Clinic",
            Specialty = "General",
            Address = "Address 1",
            Phone = "+201012345678",
            Email = "original@test.com",
            WorkingHours = "09:00 - 17:00",
            Status = ClinicStatus.Active
        };
        _context.Clinics.Add(clinic);
        await _context.SaveChangesAsync();

        var dto = new UpdateClinicDto
        {
            ClinicName = "Updated Clinic Name",
            Specialty = "Cardiology",
            Address = "New Address 2",
            Phone = "+201099998888",
            Email = "updated@test.com",
            WorkingHours = "10:00 - 18:00",
            Status = ClinicStatus.Active
        };

        // Act
        var result = await _clinicService.UpdateClinicAsync(clinic.ClinicId, dto);

        // Assert
        result.Should().NotBeNull();
        result.ClinicName.Should().Be("Updated Clinic Name");
        result.Specialty.Should().Be("Cardiology");
        result.Email.Should().Be("updated@test.com");
    }

    [Fact]
    public async Task GetClinicDoctorsAsync_ReturnsAffiliatedDoctors()
    {
        // Arrange
        var clinic = new Clinic
        {
            ClinicName = "Alexandria Clinic",
            Specialty = "Dentistry",
            Address = "Alexandria",
            Phone = "+201044445555",
            Email = "alex@test.com",
            WorkingHours = "09:00 - 17:00",
            Status = ClinicStatus.Active
        };
        _context.Clinics.Add(clinic);
        await _context.SaveChangesAsync();

        var doctor = new Doctor
        {
            FullName = "Dr. Tarek Dentist",
            Email = "tarek@dentist.com",
            Phone = "+201044445556",
            Specialty = "Dentistry",
            LicenseNumber = "LIC-DENT-01"
        };
        _context.Doctors.Add(doctor);
        await _context.SaveChangesAsync();

        _context.ClinicDoctors.Add(new ClinicDoctor
        {
            ClinicId = clinic.ClinicId,
            DoctorId = doctor.DoctorId,
            Status = ClinicStatus.Active
        });
        await _context.SaveChangesAsync();

        // Act
        var doctors = (await _clinicService.GetClinicDoctorsAsync(clinic.ClinicId)).ToList();

        // Assert
        doctors.Should().HaveCount(1);
        doctors[0].DoctorName.Should().Be("Dr. Tarek Dentist");
    }

    [Fact]
    public async Task RemoveDoctorAffiliationAsync_RemovesAffiliation()
    {
        // Arrange
        var clinic = new Clinic
        {
            ClinicName = "Mansoura Clinic",
            Specialty = "Orthopedics",
            Address = "Mansoura",
            Phone = "+201066667777",
            Email = "mansoura@test.com",
            WorkingHours = "09:00 - 17:00",
            Status = ClinicStatus.Active
        };
        _context.Clinics.Add(clinic);
        await _context.SaveChangesAsync();

        var doctor = new Doctor
        {
            FullName = "Dr. Sherif Ortho",
            Email = "sherif@ortho.com",
            Phone = "+201066667778",
            Specialty = "Orthopedics",
            LicenseNumber = "LIC-ORTHO-01"
        };
        _context.Doctors.Add(doctor);
        await _context.SaveChangesAsync();

        var affiliation = new ClinicDoctor
        {
            ClinicId = clinic.ClinicId,
            DoctorId = doctor.DoctorId,
            Status = ClinicStatus.Active
        };
        _context.ClinicDoctors.Add(affiliation);
        await _context.SaveChangesAsync();

        // Act
        await _clinicService.RemoveDoctorAffiliationAsync(clinic.ClinicId, doctor.DoctorId);

        // Assert
        var exists = await _context.ClinicDoctors.AnyAsync(cd => cd.ClinicId == clinic.ClinicId && cd.DoctorId == doctor.DoctorId);
        exists.Should().BeFalse();
    }
}

