using Sehati.Domain.Enums;

namespace Sehati.Application.DTOs.Clinics;

public class ClinicDto
{
    public int ClinicId { get; set; }
    public string ClinicName { get; set; } = string.Empty;
    public string Specialty { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string WorkingHours { get; set; } = string.Empty;
    public ClinicStatus Status { get; set; }
    public int DoctorsCount { get; set; }
    public int ReceptionistsCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ClinicDetailDto : ClinicDto
{
    public List<ClinicDoctorDto> Doctors { get; set; } = new();
    public List<ReceptionistDto> Receptionists { get; set; } = new();
}

public class CreateClinicDto
{
    public string ClinicName { get; set; } = string.Empty;
    public string Specialty { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string WorkingHours { get; set; } = string.Empty;
    public ClinicStatus Status { get; set; } = ClinicStatus.Active;
}

public class UpdateClinicDto
{
    public string ClinicName { get; set; } = string.Empty;
    public string Specialty { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string WorkingHours { get; set; } = string.Empty;
    public ClinicStatus Status { get; set; }
}

public class ClinicDoctorDto
{
    public int ClinicDoctorId { get; set; }
    public int ClinicId { get; set; }
    public string ClinicName { get; set; } = string.Empty;
    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public string Specialty { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public DateTime JoinedAt { get; set; }
    public ClinicStatus Status { get; set; }
}

public class AffiliateDoctorDto
{
    public int DoctorId { get; set; }
    public ClinicStatus Status { get; set; } = ClinicStatus.Active;
}

public class ReceptionistDto
{
    public int ReceptionistId { get; set; }
    public int UserId { get; set; }
    public int ClinicId { get; set; }
    public string ClinicName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}

public class CreateReceptionistDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

