using Microsoft.EntityFrameworkCore;
using MolanaApp.Domain.Entities;

namespace MolanaApp.Infrastructure.Data;

public class MolanaAppDbContext : DbContext
{
    public MolanaAppDbContext(DbContextOptions<MolanaAppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<CandidateProfile> CandidateProfiles => Set<CandidateProfile>();
    public DbSet<EmployerProfile> EmployerProfiles => Set<EmployerProfile>();
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<JobApplication> JobApplications => Set<JobApplication>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
        });

        // CandidateProfile configuration
        modelBuilder.Entity<CandidateProfile>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                .WithOne(u => u.CandidateProfile)
                .HasForeignKey<CandidateProfile>(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.Property(e => e.Languages)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList());
            
            entity.Property(e => e.Skills)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList());
            
            entity.Property(e => e.AdditionalDesignations)
                .HasConversion(
                    v => string.Join(',', v.Select(d => (int)d)),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(s => (Domain.Enums.IslamicDesignation)int.Parse(s)).ToList());
        });

        // EmployerProfile configuration
        modelBuilder.Entity<EmployerProfile>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                .WithOne(u => u.EmployerProfile)
                .HasForeignKey<EmployerProfile>(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.OrganizationName).IsRequired().HasMaxLength(200);
        });

        // Job configuration
        modelBuilder.Entity<Job>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.EmployerProfile)
                .WithMany(ep => ep.Jobs)
                .HasForeignKey(e => e.EmployerProfileId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).IsRequired();
            
            entity.Property(e => e.RequiredSkills)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList());
            
            entity.Property(e => e.RequiredLanguages)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList());
            
            entity.Property(e => e.Benefits)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList());
            
            entity.Property(e => e.PreferredDesignations)
                .HasConversion(
                    v => string.Join(',', v.Select(d => (int)d)),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(s => (Domain.Enums.IslamicDesignation)int.Parse(s)).ToList());
            
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.RequiredDesignation);
            entity.HasIndex(e => e.City);
        });

        // JobApplication configuration
        modelBuilder.Entity<JobApplication>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Job)
                .WithMany(j => j.Applications)
                .HasForeignKey(e => e.JobId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.CandidateProfile)
                .WithMany(c => c.Applications)
                .HasForeignKey(e => e.CandidateProfileId)
                .OnDelete(DeleteBehavior.NoAction);
            entity.HasIndex(e => new { e.JobId, e.CandidateProfileId }).IsUnique();
        });

        // Message configuration
        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Sender)
                .WithMany(u => u.SentMessages)
                .HasForeignKey(e => e.SenderId)
                .OnDelete(DeleteBehavior.NoAction);
            entity.HasOne(e => e.Receiver)
                .WithMany(u => u.ReceivedMessages)
                .HasForeignKey(e => e.ReceiverId)
                .OnDelete(DeleteBehavior.NoAction);
            entity.HasOne(e => e.ParentMessage)
                .WithMany(m => m.Replies)
                .HasForeignKey(e => e.ParentMessageId)
                .OnDelete(DeleteBehavior.NoAction);
            entity.HasIndex(e => new { e.SenderId, e.ReceiverId });
        });

        // Notification configuration
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.UserId, e.IsRead });
        });
    }
}
