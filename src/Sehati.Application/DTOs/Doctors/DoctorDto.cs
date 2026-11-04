using Sehati.Application.DTOs.Clinics;

namespace Sehati.Application.DTOs.Doctors;

public class DoctorDto
{
    public int DoctorId { get; set; }
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Specialty { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int AffiliatedClinicsCount { get; set; }
}

public class DoctorDetailDto : DoctorDto
{
    public List<ClinicDoctorDto> AffiliatedClinics { get; set; } = new();
}

public class CreateDoctorDto
{
    public string FullName { get; set; } = string.Empty;
    public string Specialty { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public int? InitialClinicId { get; set; }
}

public class UpdateDoctorDto
{
    public string FullName { get; set; } = string.Empty;
    public string Specialty { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class DoctorScheduleSlotDto
{
    public int AppointmentId { get; set; }
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string UnifiedPatientId { get; set; } = string.Empty;
    public int ClinicId { get; set; }
    public string ClinicName { get; set; } = string.Empty;
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class DoctorScheduleDto
{
    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public string Specialty { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public List<DoctorScheduleSlotDto> Slots { get; set; } = new();
}

