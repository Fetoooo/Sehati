using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sehati.Domain.Entities;

namespace Sehati.Infrastructure.Persistence.Configurations;

public class ClinicConfiguration : IEntityTypeConfiguration<Clinic>
{
    public void Configure(EntityTypeBuilder<Clinic> builder)
    {
        builder.ToTable("Clinics");

        builder.HasKey(c => c.ClinicId);

        builder.Property(c => c.ClinicName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(c => c.Specialty)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Address)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(c => c.Phone)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(c => c.Email)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(c => c.WorkingHours)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(c => c.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(c => c.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");
    }
}
