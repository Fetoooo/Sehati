using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sehati.Domain.Entities;

namespace Sehati.Infrastructure.Persistence.Configurations;

public class PatientConfiguration : IEntityTypeConfiguration<Patient>
{
    public void Configure(EntityTypeBuilder<Patient> builder)
    {
        builder.ToTable("Patients");

        builder.HasKey(p => p.PatientId);

        builder.Property(p => p.UnifiedPatientId)
            .IsRequired()
            .HasMaxLength(30);

        builder.HasIndex(p => p.UnifiedPatientId)
            .IsUnique()
            .HasDatabaseName("IX_Patients_UnifiedId");

        builder.Property(p => p.FullName)
            .IsRequired()
            .HasMaxLength(150);

        builder.HasIndex(p => p.FullName)
            .HasDatabaseName("IX_Patients_FullName");

        builder.Property(p => p.DateOfBirth)
            .IsRequired();

        builder.Property(p => p.Gender)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(10);

        builder.Property(p => p.Address)
            .HasMaxLength(255);

        builder.Property(p => p.EmergencyContact)
            .HasMaxLength(100);

        builder.Property(p => p.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        // 1:1 Relationship with User
        builder.HasOne(p => p.User)
            .WithOne(u => u.Patient)
            .HasForeignKey<Patient>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(p => p.UserId)
            .IsUnique();
    }
}
