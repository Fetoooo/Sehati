using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sehati.Domain.Entities;

namespace Sehati.Infrastructure.Persistence.Configurations;

public class EmergencyProfileConfiguration : IEntityTypeConfiguration<EmergencyProfile>
{
    public void Configure(EntityTypeBuilder<EmergencyProfile> builder)
    {
        builder.ToTable("EmergencyProfiles");

        builder.HasKey(ep => ep.EmergencyProfileId);

        builder.Property(ep => ep.BloodType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(15);

        builder.Property(ep => ep.EmergencyContactName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(ep => ep.EmergencyContactPhone)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(ep => ep.LastUpdatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        // 1:1 Relationship with Patient
        builder.HasOne(ep => ep.Patient)
            .WithOne(p => p.EmergencyProfile)
            .HasForeignKey<EmergencyProfile>(ep => ep.PatientId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(ep => ep.PatientId)
            .IsUnique();
    }
}
