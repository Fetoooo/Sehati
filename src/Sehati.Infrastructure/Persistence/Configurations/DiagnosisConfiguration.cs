using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sehati.Domain.Entities;

namespace Sehati.Infrastructure.Persistence.Configurations;

public class DiagnosisConfiguration : IEntityTypeConfiguration<Diagnosis>
{
    public void Configure(EntityTypeBuilder<Diagnosis> builder)
    {
        builder.ToTable("Diagnoses");

        builder.HasKey(d => d.DiagnosisId);

        builder.Property(d => d.DiagnosisName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(d => d.DiagnosisDate)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(d => d.Visit)
            .WithMany(v => v.Diagnoses)
            .HasForeignKey(d => d.VisitId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
