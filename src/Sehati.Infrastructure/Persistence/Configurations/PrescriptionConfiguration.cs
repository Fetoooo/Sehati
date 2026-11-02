using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sehati.Domain.Entities;

namespace Sehati.Infrastructure.Persistence.Configurations;

public class PrescriptionConfiguration : IEntityTypeConfiguration<Prescription>
{
    public void Configure(EntityTypeBuilder<Prescription> builder)
    {
        builder.ToTable("Prescriptions");

        builder.HasKey(p => p.PrescriptionId);

        builder.Property(p => p.PrescriptionDate)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(p => p.Visit)
            .WithMany(v => v.Prescriptions)
            .HasForeignKey(p => p.VisitId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(p => p.Doctor)
            .WithMany(d => d.Prescriptions)
            .HasForeignKey(p => p.DoctorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Patient)
            .WithMany(pt => pt.Prescriptions)
            .HasForeignKey(p => p.PatientId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
