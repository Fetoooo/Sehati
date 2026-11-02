using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sehati.Domain.Entities;

namespace Sehati.Infrastructure.Persistence.Configurations;

public class TreatmentConfiguration : IEntityTypeConfiguration<Treatment>
{
    public void Configure(EntityTypeBuilder<Treatment> builder)
    {
        builder.ToTable("Treatments");

        builder.HasKey(t => t.TreatmentId);

        builder.Property(t => t.TreatmentDescription)
            .IsRequired();

        builder.Property(t => t.StartDate)
            .IsRequired();

        builder.HasOne(t => t.Visit)
            .WithMany(v => v.Treatments)
            .HasForeignKey(t => t.VisitId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
