namespace MolanaApp.Domain.Entities;

public class Notification
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // JobApplication, Message, JobAlert, etc.
    public string? Data { get; set; } // JSON data for navigation
    
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReadAt { get; set; }
    
    // Navigation
    public User User { get; set; } = null!;
}
