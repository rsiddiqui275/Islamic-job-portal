using MolanaApp.Domain.Enums;

namespace MolanaApp.Domain.Entities;

public class CandidateProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    
    // Islamic Qualifications
    public IslamicDesignation PrimaryDesignation { get; set; }
    public List<IslamicDesignation> AdditionalDesignations { get; set; } = new();
    public string? MadrasaName { get; set; }
    public int? YearsOfExperience { get; set; }
    public string? Biography { get; set; }
    
    // Location
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? Address { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    
    // Salary Expectations
    public decimal? ExpectedSalaryMin { get; set; }
    public decimal? ExpectedSalaryMax { get; set; }
    public string? SalaryCurrency { get; set; } = "PKR";
    
    // Documents
    public string? ResumeUrl { get; set; }
    public string? CertificateUrl { get; set; }
    
    // Skills & Languages
    public List<string> Languages { get; set; } = new() { "Urdu", "Arabic" };
    public List<string> Skills { get; set; } = new();
    
    // Availability
    public bool IsAvailableForWork { get; set; } = true;
    public JobType PreferredJobType { get; set; } = JobType.FullTime;
    public bool WillingToRelocate { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation
    public User User { get; set; } = null!;
    public ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();
}
