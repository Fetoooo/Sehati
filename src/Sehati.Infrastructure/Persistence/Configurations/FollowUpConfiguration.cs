using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sehati.Domain.Entities;

namespace Sehati.Infrastructure.Persistence.Configurations;

public class FollowUpConfiguration : IEntityTypeConfiguration<FollowUp>
{
    public void Configure(EntityTypeBuilder<FollowUp> builder)
    {
        builder.ToTable("FollowUps");

        builder.HasKey(f => f.FollowUpId);

        builder.Property(f => f.FollowUpDate)
            .IsRequired();

        builder.Property(f => f.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.HasOne(f => f.Patient)
            .WithMany(p => p.FollowUps)
            .HasForeignKey(f => f.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(f => f.Doctor)
            .WithMany(d => d.FollowUps)
            .HasForeignKey(f => f.DoctorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(f => f.Visit)
            .WithMany(v => v.FollowUps)
            .HasForeignKey(f => f.VisitId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
