using MolanaApp.Domain.Enums;

namespace MolanaApp.Domain.Entities;

public class Job
{
    public Guid Id { get; set; }
    public Guid EmployerProfileId { get; set; }
    
    // Job Details
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public IslamicDesignation RequiredDesignation { get; set; }
    public List<IslamicDesignation> PreferredDesignations { get; set; } = new();
    public JobType JobType { get; set; }
    public JobStatus Status { get; set; } = JobStatus.Draft;
    
    // Requirements
    public int? MinExperienceYears { get; set; }
    public int? MaxExperienceYears { get; set; }
    public List<string> RequiredSkills { get; set; } = new();
    public List<string> RequiredLanguages { get; set; } = new() { "Urdu", "Arabic" };
    public string? QualificationRequirements { get; set; }
    
    // Salary
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string SalaryCurrency { get; set; } = "PKR";
    public bool IsSalaryNegotiable { get; set; }
    public bool ShowSalary { get; set; } = true;
    
    // Location
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? Address { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public bool IsRemote { get; set; }
    
    // Benefits
    public List<string> Benefits { get; set; } = new();
    public bool AccommodationProvided { get; set; }
    public bool FoodProvided { get; set; }
    
    // Dates
    public DateTime PostedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Statistics
    public int ViewCount { get; set; }
    public int ApplicationCount { get; set; }
    
    // Navigation
    public EmployerProfile EmployerProfile { get; set; } = null!;
    public ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();
}
