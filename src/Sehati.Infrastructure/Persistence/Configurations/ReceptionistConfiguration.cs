using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sehati.Domain.Entities;

namespace Sehati.Infrastructure.Persistence.Configurations;

public class ReceptionistConfiguration : IEntityTypeConfiguration<Receptionist>
{
    public void Configure(EntityTypeBuilder<Receptionist> builder)
    {
        builder.ToTable("Receptionists");

        builder.HasKey(r => r.ReceptionistId);

        builder.Property(r => r.FullName)
            .IsRequired()
            .HasMaxLength(150);

        // 1:1 Relationship with User
        builder.HasOne(r => r.User)
            .WithOne(u => u.Receptionist)
            .HasForeignKey<Receptionist>(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(r => r.UserId)
            .IsUnique();

        // N:1 Relationship with Clinic
        builder.HasOne(r => r.Clinic)
            .WithMany(c => c.Receptionists)
            .HasForeignKey(r => r.ClinicId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
