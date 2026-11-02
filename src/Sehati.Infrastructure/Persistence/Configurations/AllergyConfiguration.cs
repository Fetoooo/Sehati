using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sehati.Domain.Entities;

namespace Sehati.Infrastructure.Persistence.Configurations;

public class AllergyConfiguration : IEntityTypeConfiguration<Allergy>
{
    public void Configure(EntityTypeBuilder<Allergy> builder)
    {
        builder.ToTable("Allergies");

        builder.HasKey(a => a.AllergyId);

        builder.Property(a => a.AllergyName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(a => a.Reaction)
            .IsRequired()
            .HasMaxLength(255);

        builder.HasOne(a => a.Patient)
            .WithMany(p => p.Allergies)
            .HasForeignKey(a => a.PatientId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
