using Sehati.Domain.Enums;

namespace Sehati.Application.DTOs.Appointments;

public class AppointmentDto
{
    public int AppointmentId { get; set; }
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string UnifiedPatientId { get; set; } = string.Empty;
    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public string DoctorSpecialty { get; set; } = string.Empty;
    public int ClinicId { get; set; }
    public string ClinicName { get; set; } = string.Empty;
    public DateOnly AppointmentDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public AppointmentStatus Status { get; set; }
    public string? Notes { get; set; }
}

public class CreateAppointmentDto
{
    public int PatientId { get; set; }
    public int DoctorId { get; set; }
    public int ClinicId { get; set; }
    public DateOnly AppointmentDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public string? Notes { get; set; }
}

public class UpdateAppointmentStatusDto
{
    public AppointmentStatus Status { get; set; }
    public string? Notes { get; set; }
}

public class RescheduleAppointmentDto
{
    public DateOnly AppointmentDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public string? Notes { get; set; }
}

public class QueueItemDto
{
    public int QueueNumber { get; set; }
    public int AppointmentId { get; set; }
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string UnifiedPatientId { get; set; } = string.Empty;
    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public DateOnly AppointmentDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public AppointmentStatus Status { get; set; }
}

public class FollowUpDto
{
    public int FollowUpId { get; set; }
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string UnifiedPatientId { get; set; } = string.Empty;
    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public int VisitId { get; set; }
    public DateOnly FollowUpDate { get; set; }
    public string? Notes { get; set; }
    public FollowUpStatus Status { get; set; }
}

public class CreateFollowUpDto
{
    public int PatientId { get; set; }
    public int DoctorId { get; set; }
    public int VisitId { get; set; }
    public DateOnly FollowUpDate { get; set; }
    public string? Notes { get; set; }
}

public class UpdateFollowUpStatusDto
{
    public FollowUpStatus Status { get; set; }
    public string? Notes { get; set; }
}

