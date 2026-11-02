using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sehati.Domain.Entities;

namespace Sehati.Infrastructure.Persistence.Configurations;

public class ClinicDoctorConfiguration : IEntityTypeConfiguration<ClinicDoctor>
{
    public void Configure(EntityTypeBuilder<ClinicDoctor> builder)
    {
        builder.ToTable("ClinicDoctors");

        builder.HasKey(cd => cd.ClinicDoctorId);

        builder.HasIndex(cd => new { cd.ClinicId, cd.DoctorId })
            .IsUnique();

        builder.Property(cd => cd.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(cd => cd.JoinedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(cd => cd.Clinic)
            .WithMany(c => c.ClinicDoctors)
            .HasForeignKey(cd => cd.ClinicId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(cd => cd.Doctor)
            .WithMany(d => d.ClinicDoctors)
            .HasForeignKey(cd => cd.DoctorId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
