using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sehati.Domain.Entities;

namespace Sehati.Infrastructure.Persistence.Configurations;

public class AccessPermissionConfiguration : IEntityTypeConfiguration<AccessPermission>
{
    public void Configure(EntityTypeBuilder<AccessPermission> builder)
    {
        builder.ToTable("AccessPermissions");

        builder.HasKey(ap => ap.AccessPermissionId);

        builder.Property(ap => ap.AccessType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(ap => ap.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(ap => ap.GrantedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(ap => new { ap.PatientId, ap.DoctorId, ap.Status, ap.ExpiresAt })
            .HasDatabaseName("IX_AccessPermissions_Lookup");

        builder.HasOne(ap => ap.Patient)
            .WithMany(p => p.AccessPermissions)
            .HasForeignKey(ap => ap.PatientId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ap => ap.Doctor)
            .WithMany(d => d.AccessPermissions)
            .HasForeignKey(ap => ap.DoctorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ap => ap.Clinic)
            .WithMany(c => c.AccessPermissions)
            .HasForeignKey(ap => ap.ClinicId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
