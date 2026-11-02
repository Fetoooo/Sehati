using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sehati.Domain.Entities;

namespace Sehati.Infrastructure.Persistence.Configurations;

public class PrescriptionItemConfiguration : IEntityTypeConfiguration<PrescriptionItem>
{
    public void Configure(EntityTypeBuilder<PrescriptionItem> builder)
    {
        builder.ToTable("PrescriptionItems");

        builder.HasKey(pi => pi.PrescriptionItemId);

        builder.Property(pi => pi.MedicationName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(pi => pi.Dosage)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(pi => pi.Frequency)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(pi => pi.Duration)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasOne(pi => pi.Prescription)
            .WithMany(p => p.PrescriptionItems)
            .HasForeignKey(pi => pi.PrescriptionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
