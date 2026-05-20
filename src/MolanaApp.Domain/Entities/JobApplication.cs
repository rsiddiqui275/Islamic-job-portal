using MolanaApp.Domain.Enums;

namespace MolanaApp.Domain.Entities;

public class JobApplication
{
    public Guid Id { get; set; }
    public Guid JobId { get; set; }
    public Guid CandidateProfileId { get; set; }
    
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;
    public string? CoverLetter { get; set; }
    public string? ResumeUrl { get; set; }
    public decimal? ExpectedSalary { get; set; }
    public string? AdditionalNotes { get; set; }
    
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Employer feedback
    public string? EmployerNotes { get; set; }
    public int? Rating { get; set; } // 1-5 star rating
    
    // Navigation
    public Job Job { get; set; } = null!;
    public CandidateProfile CandidateProfile { get; set; } = null!;
}
