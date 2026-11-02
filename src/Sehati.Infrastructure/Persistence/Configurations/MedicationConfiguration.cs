using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sehati.Domain.Entities;

namespace Sehati.Infrastructure.Persistence.Configurations;

public class MedicationConfiguration : IEntityTypeConfiguration<Medication>
{
    public void Configure(EntityTypeBuilder<Medication> builder)
    {
        builder.ToTable("Medications");

        builder.HasKey(m => m.MedicationId);

        builder.Property(m => m.MedicationName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(m => m.Dosage)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(m => m.Frequency)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(m => m.StartDate)
            .IsRequired();

        builder.HasOne(m => m.Patient)
            .WithMany(p => p.Medications)
            .HasForeignKey(m => m.PatientId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
