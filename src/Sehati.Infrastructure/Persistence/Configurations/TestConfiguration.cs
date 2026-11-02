using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sehati.Domain.Entities;

namespace Sehati.Infrastructure.Persistence.Configurations;

public class TestConfiguration : IEntityTypeConfiguration<Test>
{
    public void Configure(EntityTypeBuilder<Test> builder)
    {
        builder.ToTable("Tests");

        builder.HasKey(t => t.TestId);

        builder.Property(t => t.TestName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(t => t.TestDate)
            .IsRequired();

        builder.Property(t => t.FileUrl)
            .HasMaxLength(500);

        builder.HasOne(t => t.Patient)
            .WithMany(p => p.Tests)
            .HasForeignKey(t => t.PatientId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(t => t.Visit)
            .WithMany(v => v.Tests)
            .HasForeignKey(t => t.VisitId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
