using MolanaApp.Domain.Enums;

namespace MolanaApp.API.DTOs.Applications;

public class CreateApplicationDto
{
    public Guid JobId { get; set; }
    public string? CoverLetter { get; set; }
    public decimal? ExpectedSalary { get; set; }
    public string? AdditionalNotes { get; set; }
}

public class ApplicationDto
{
    public Guid Id { get; set; }
    public Guid JobId { get; set; }
    public Guid CandidateProfileId { get; set; }
    
    public ApplicationStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public string? CoverLetter { get; set; }
    public decimal? ExpectedSalary { get; set; }
    
    public DateTime AppliedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    
    // For employer view
    public CandidateSummaryDto? Candidate { get; set; }
    
    // For candidate view
    public JobSummaryDto? Job { get; set; }
}

public class CandidateSummaryDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }
    public string? PhoneNumber { get; set; }
    public IslamicDesignation PrimaryDesignation { get; set; }
    public string PrimaryDesignationName { get; set; } = string.Empty;
    public int? YearsOfExperience { get; set; }
    public string City { get; set; } = string.Empty;
}

public class JobSummaryDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string OrganizationName { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public JobStatus Status { get; set; }
}

public class UpdateApplicationStatusDto
{
    public ApplicationStatus Status { get; set; }
    public string? EmployerNotes { get; set; }
    public int? Rating { get; set; }
}

public class ApplicationStatusResponseDto
{
    public bool HasApplied { get; set; }
    public ApplicationStatus? Status { get; set; }
    public string? StatusName { get; set; }
    public DateTime? AppliedAt { get; set; }
}
