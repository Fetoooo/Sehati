using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sehati.Domain.Entities;

namespace Sehati.Infrastructure.Persistence.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLogs");

        builder.HasKey(al => al.AuditLogId);

        builder.Property(al => al.Action)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(al => al.EntityName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(al => al.IPAddress)
            .IsRequired()
            .HasMaxLength(45);

        builder.Property(al => al.Timestamp)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(al => al.Timestamp)
            .HasDatabaseName("IX_AuditLogs_Timestamp");

        builder.HasOne(al => al.User)
            .WithMany(u => u.AuditLogs)
            .HasForeignKey(al => al.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(al => al.Patient)
            .WithMany(p => p.AuditLogs)
            .HasForeignKey(al => al.PatientId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
