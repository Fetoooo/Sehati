using Microsoft.EntityFrameworkCore;
using Sehati.Application.Common.Interfaces;
using Sehati.Domain.Entities;

namespace Sehati.Infrastructure.Persistence;

public class SehatiDbContext : DbContext, IApplicationDbContext
{
    public SehatiDbContext(DbContextOptions<SehatiDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Clinic> Clinics => Set<Clinic>();
    public DbSet<Doctor> Doctors => Set<Doctor>();
    public DbSet<ClinicDoctor> ClinicDoctors => Set<ClinicDoctor>();
    public DbSet<Receptionist> Receptionists => Set<Receptionist>();
    public DbSet<MedicalRecord> MedicalRecords => Set<MedicalRecord>();
    public DbSet<Visit> Visits => Set<Visit>();
    public DbSet<Diagnosis> Diagnoses => Set<Diagnosis>();
    public DbSet<Treatment> Treatments => Set<Treatment>();
    public DbSet<Prescription> Prescriptions => Set<Prescription>();
    public DbSet<PrescriptionItem> PrescriptionItems => Set<PrescriptionItem>();
    public DbSet<Allergy> Allergies => Set<Allergy>();
    public DbSet<Medication> Medications => Set<Medication>();
    public DbSet<Test> Tests => Set<Test>();
    public DbSet<Scan> Scans => Set<Scan>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<FollowUp> FollowUps => Set<FollowUp>();
    public DbSet<EmergencyProfile> EmergencyProfiles => Set<EmergencyProfile>();
    public DbSet<AccessPermission> AccessPermissions => Set<AccessPermission>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SehatiDbContext).Assembly);
    }
}
