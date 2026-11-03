using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Sehati.Application.Common.Exceptions;
using Sehati.Application.DTOs.Auth;
using Sehati.Application.Services;
using Sehati.Application.Validators.Auth;
using Sehati.Domain.Entities;
using Sehati.Domain.Enums;
using Sehati.Infrastructure.Persistence;
using Sehati.Infrastructure.Services;

namespace Sehati.Tests.Unit.Services;

public class AuthServiceTests
{
    private readonly SehatiDbContext _context;
    private readonly PasswordHasherService _hasher;
    private readonly TokenService _tokenService;
    private readonly UnifiedPatientIdGenerator _idGenerator;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        var options = new DbContextOptionsBuilder<SehatiDbContext>()
            .UseInMemoryDatabase(databaseName: $"SehatiAuthTestDb_{Guid.NewGuid()}")
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

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "JwtSettings:Secret", "Super_Secret_Unit_Testing_Key_For_Auth_Service_32_Bytes" },
                { "JwtSettings:Issuer", "SehatiAuthTest" },
                { "JwtSettings:Audience", "SehatiAuthTestClient" },
                { "JwtSettings:ExpiryInMinutes", "60" }
            })
            .Build();

        _hasher = new PasswordHasherService();
        _tokenService = new TokenService(config);
        _idGenerator = new UnifiedPatientIdGenerator();

        _authService = new AuthService(
            _context,
            _hasher,
            _tokenService,
            _idGenerator,
            new RegisterDtoValidator(),
            new LoginDtoValidator(),
            new RefreshTokenDtoValidator()
        );
    }

    [Fact]
    public async Task RegisterAsync_PatientRole_ShouldCreateUserAndPatientProfile()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            Email = "patient.new@sehati.com",
            Password = "SecurePassword@2026",
            Phone = "+201011112222",
            FullName = "Tamer Hosny",
            RoleName = "Patient",
            DateOfBirth = new DateOnly(1990, 8, 15),
            Gender = Gender.Male
        };

        // Act
        var result = await _authService.RegisterAsync(registerDto);

        // Assert
        result.Should().NotBeNull();
        result.AccessToken.Should().NotBeNullOrWhiteSpace();
        result.RefreshToken.Should().NotBeNullOrWhiteSpace();
        result.User.Email.Should().Be("patient.new@sehati.com");
        result.User.Role.Should().Be("Patient");
        result.User.UnifiedPatientId.Should().StartWith("SH-");

        var dbUser = await _context.Users
            .Include(u => u.Patient)
            .ThenInclude(p => p!.MedicalRecord)
            .Include(u => u.Patient!.EmergencyProfile)
            .FirstOrDefaultAsync(u => u.Email == "patient.new@sehati.com");

        dbUser.Should().NotBeNull();
        dbUser!.Patient.Should().NotBeNull();
        dbUser.Patient!.FullName.Should().Be("Tamer Hosny");
        dbUser.Patient.MedicalRecord.Should().NotBeNull();
        dbUser.Patient.EmergencyProfile.Should().NotBeNull();
        dbUser.RefreshToken.Should().Be(result.RefreshToken);
    }

    [Fact]
    public async Task RegisterAsync_DoctorRole_ShouldCreateDoctorProfile()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            Email = "doctor.neuro@sehati.com",
            Password = "SecurePassword@2026",
            Phone = "+201022223333",
            FullName = "Dr. Mona Zaki",
            RoleName = "Doctor",
            Specialty = "Neurology",
            LicenseNumber = "EGY-MED-98765"
        };

        // Act
        var result = await _authService.RegisterAsync(registerDto);

        // Assert
        result.Should().NotBeNull();
        result.User.Role.Should().Be("Doctor");
        result.User.Specialty.Should().Be("Neurology");

        var dbDoctor = await _context.Doctors.FirstOrDefaultAsync(d => d.LicenseNumber == "EGY-MED-98765");
        dbDoctor.Should().NotBeNull();
        dbDoctor!.FullName.Should().Be("Dr. Mona Zaki");
        dbDoctor.Specialty.Should().Be("Neurology");
    }

    [Fact]
    public async Task RegisterAsync_WithDuplicateEmail_ShouldThrowConflictException()
    {
        // Arrange
        var initialDto = new RegisterDto
        {
            Email = "duplicate@sehati.com",
            Password = "SecurePassword@2026",
            Phone = "+201033334444",
            FullName = "First User",
            RoleName = "Patient"
        };
        await _authService.RegisterAsync(initialDto);

        var duplicateDto = new RegisterDto
        {
            Email = "duplicate@sehati.com",
            Password = "SecurePassword@2026",
            Phone = "+201055556666",
            FullName = "Second User",
            RoleName = "Patient"
        };

        // Act & Assert
        await Assert.ThrowsAsync<ConflictException>(() => _authService.RegisterAsync(duplicateDto));
    }

    [Fact]
    public async Task LoginAsync_WithValidEmail_ShouldReturnTokens()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            Email = "login.test@sehati.com",
            Password = "SecurePassword@2026",
            Phone = "+201044445555",
            FullName = "Login User",
            RoleName = "Patient"
        };
        await _authService.RegisterAsync(registerDto);

        var loginDto = new LoginDto
        {
            EmailOrPhone = "login.test@sehati.com",
            Password = "SecurePassword@2026"
        };

        // Act
        var result = await _authService.LoginAsync(loginDto);

        // Assert
        result.Should().NotBeNull();
        result.AccessToken.Should().NotBeNullOrWhiteSpace();
        result.RefreshToken.Should().NotBeNullOrWhiteSpace();
        result.User.Email.Should().Be("login.test@sehati.com");
    }

    [Fact]
    public async Task LoginAsync_WithValidPhone_ShouldReturnTokens()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            Email = "phone.test@sehati.com",
            Password = "SecurePassword@2026",
            Phone = "+201077778888",
            FullName = "Phone User",
            RoleName = "Patient"
        };
        await _authService.RegisterAsync(registerDto);

        var loginDto = new LoginDto
        {
            EmailOrPhone = "+201077778888",
            Password = "SecurePassword@2026"
        };

        // Act
        var result = await _authService.LoginAsync(loginDto);

        // Assert
        result.Should().NotBeNull();
        result.AccessToken.Should().NotBeNullOrWhiteSpace();
        result.User.Phone.Should().Be("+201077778888");
    }

    [Fact]
    public async Task LoginAsync_WithWrongPassword_ShouldThrowUnauthorizedException()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            Email = "wrongpass@sehati.com",
            Password = "SecurePassword@2026",
            Phone = "+201088889999",
            FullName = "User Name",
            RoleName = "Patient"
        };
        await _authService.RegisterAsync(registerDto);

        var loginDto = new LoginDto
        {
            EmailOrPhone = "wrongpass@sehati.com",
            Password = "IncorrectPassword123!"
        };

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedException>(() => _authService.LoginAsync(loginDto));
    }

    [Fact]
    public async Task RefreshTokenAsync_WithValidTokens_ShouldRotateTokens()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            Email = "refresh@sehati.com",
            Password = "SecurePassword@2026",
            Phone = "+201099990000",
            FullName = "Refresh User",
            RoleName = "Patient"
        };
        var initial = await _authService.RegisterAsync(registerDto);

        var refreshDto = new RefreshTokenDto
        {
            AccessToken = initial.AccessToken,
            RefreshToken = initial.RefreshToken
        };

        // Act
        var refreshed = await _authService.RefreshTokenAsync(refreshDto);

        // Assert
        refreshed.Should().NotBeNull();
        refreshed.AccessToken.Should().NotBeNullOrWhiteSpace();
        refreshed.RefreshToken.Should().NotBeNullOrWhiteSpace();
        refreshed.RefreshToken.Should().NotBe(initial.RefreshToken); // Token rotation
    }

    [Fact]
    public async Task LogoutAsync_ShouldInvalidateStoredRefreshToken()
    {
        // Arrange
        var registerDto = new RegisterDto
        {
            Email = "logout@sehati.com",
            Password = "SecurePassword@2026",
            Phone = "+201012121212",
            FullName = "Logout User",
            RoleName = "Patient"
        };
        var initial = await _authService.RegisterAsync(registerDto);

        // Act
        await _authService.LogoutAsync(initial.User.UserId);

        // Assert
        var user = await _context.Users.FindAsync(initial.User.UserId);
        user!.RefreshToken.Should().BeNull();
        user.RefreshTokenExpiryTime.Should().BeNull();
    }
}

