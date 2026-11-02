using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sehati.Domain.Entities;

namespace Sehati.Infrastructure.Persistence.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");

        builder.HasKey(n => n.NotificationId);

        builder.Property(n => n.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(n => n.Message)
            .IsRequired();

        builder.Property(n => n.Type)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(n => n.IsRead)
            .HasDefaultValue(false);

        builder.Property(n => n.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
