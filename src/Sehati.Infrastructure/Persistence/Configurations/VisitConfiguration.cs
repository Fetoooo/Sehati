using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sehati.Domain.Entities;

namespace Sehati.Infrastructure.Persistence.Configurations;

public class VisitConfiguration : IEntityTypeConfiguration<Visit>
{
    public void Configure(EntityTypeBuilder<Visit> builder)
    {
        builder.ToTable("Visits");

        builder.HasKey(v => v.VisitId);

        builder.Property(v => v.ChiefComplaint)
            .IsRequired();

        builder.Property(v => v.VisitDate)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(v => v.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.HasIndex(v => new { v.PatientId, v.VisitDate })
            .HasDatabaseName("IX_Visits_Patient_Date");

        builder.HasOne(v => v.Patient)
            .WithMany(p => p.Visits)
            .HasForeignKey(v => v.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(v => v.Doctor)
            .WithMany(d => d.Visits)
            .HasForeignKey(v => v.DoctorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(v => v.Clinic)
            .WithMany(c => c.Visits)
            .HasForeignKey(v => v.ClinicId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
