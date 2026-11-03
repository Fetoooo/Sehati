using Microsoft.EntityFrameworkCore;
using Sehati.Domain.Entities;

namespace Sehati.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<Patient> Patients { get; }
    DbSet<Clinic> Clinics { get; }
    DbSet<Doctor> Doctors { get; }
    DbSet<ClinicDoctor> ClinicDoctors { get; }
    DbSet<Receptionist> Receptionists { get; }
    DbSet<MedicalRecord> MedicalRecords { get; }
    DbSet<Visit> Visits { get; }
    DbSet<Diagnosis> Diagnoses { get; }
    DbSet<Treatment> Treatments { get; }
    DbSet<Prescription> Prescriptions { get; }
    DbSet<PrescriptionItem> PrescriptionItems { get; }
    DbSet<Allergy> Allergies { get; }
    DbSet<Medication> Medications { get; }
    DbSet<Test> Tests { get; }
    DbSet<Scan> Scans { get; }
    DbSet<Appointment> Appointments { get; }
    DbSet<FollowUp> FollowUps { get; }
    DbSet<EmergencyProfile> EmergencyProfiles { get; }
    DbSet<AccessPermission> AccessPermissions { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<AuditLog> AuditLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

