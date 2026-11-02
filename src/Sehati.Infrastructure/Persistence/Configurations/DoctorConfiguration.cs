using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sehati.Domain.Entities;

namespace Sehati.Infrastructure.Persistence.Configurations;

public class DoctorConfiguration : IEntityTypeConfiguration<Doctor>
{
    public void Configure(EntityTypeBuilder<Doctor> builder)
    {
        builder.ToTable("Doctors");

        builder.HasKey(d => d.DoctorId);

        builder.Property(d => d.FullName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(d => d.Specialty)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(d => d.LicenseNumber)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(d => d.LicenseNumber)
            .IsUnique();

        builder.Property(d => d.Phone)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(d => d.Email)
            .IsRequired()
            .HasMaxLength(150);

        // 1:1 Relationship with User
        builder.HasOne(d => d.User)
            .WithOne(u => u.Doctor)
            .HasForeignKey<Doctor>(d => d.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(d => d.UserId)
            .IsUnique();
    }
}
