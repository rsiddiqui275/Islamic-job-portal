namespace MolanaApp.Domain.Entities;

public class EmployerProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    
    // Organization Details
    public string OrganizationName { get; set; } = string.Empty;
    public string OrganizationType { get; set; } = string.Empty; // Masjid, Madrasa, Islamic Center, etc.
    public string? Description { get; set; }
    public string? Website { get; set; }
    public string? LogoUrl { get; set; }
    
    // Location
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? Address { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    
    // Contact
    public string? ContactPersonName { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    
    // Verification
    public bool IsVerified { get; set; }
    public string? VerificationDocumentUrl { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation
    public User User { get; set; } = null!;
    public ICollection<Job> Jobs { get; set; } = new List<Job>();
}
