using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sehati.Domain.Entities;

namespace Sehati.Infrastructure.Persistence.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("Roles");

        builder.HasKey(r => r.RoleId);

        builder.Property(r => r.RoleName)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(r => r.RoleName)
            .IsUnique();

        // Seed initial 5 roles
        builder.HasData(
            new Role { RoleId = 1, RoleName = "Patient" },
            new Role { RoleId = 2, RoleName = "Doctor" },
            new Role { RoleId = 3, RoleName = "Receptionist" },
            new Role { RoleId = 4, RoleName = "ClinicAdmin" },
            new Role { RoleId = 5, RoleName = "SystemAdmin" }
        );
    }
}
