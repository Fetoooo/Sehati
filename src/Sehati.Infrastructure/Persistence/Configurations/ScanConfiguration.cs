using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sehati.Domain.Entities;

namespace Sehati.Infrastructure.Persistence.Configurations;

public class ScanConfiguration : IEntityTypeConfiguration<Scan>
{
    public void Configure(EntityTypeBuilder<Scan> builder)
    {
        builder.ToTable("Scans");

        builder.HasKey(s => s.ScanId);

        builder.Property(s => s.ScanType)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(s => s.ScanDate)
            .IsRequired();

        builder.Property(s => s.FileUrl)
            .HasMaxLength(500);

        builder.HasOne(s => s.Patient)
            .WithMany(p => p.Scans)
            .HasForeignKey(s => s.PatientId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.Visit)
            .WithMany(v => v.Scans)
            .HasForeignKey(s => s.VisitId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
