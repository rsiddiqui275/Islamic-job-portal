using MolanaApp.Domain.Enums;

namespace MolanaApp.API.DTOs.Profiles;

public class CandidateProfileDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }
    
    public IslamicDesignation PrimaryDesignation { get; set; }
    public string PrimaryDesignationName { get; set; } = string.Empty;
    public List<IslamicDesignation> AdditionalDesignations { get; set; } = new();
    public string? MadrasaName { get; set; }
    public int? YearsOfExperience { get; set; }
    public string? Biography { get; set; }
    
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    
    public decimal? ExpectedSalaryMin { get; set; }
    public decimal? ExpectedSalaryMax { get; set; }
    public string? SalaryCurrency { get; set; }
    
    public List<string> Languages { get; set; } = new();
    public List<string> Skills { get; set; } = new();
    
    public bool IsAvailableForWork { get; set; }
    public JobType PreferredJobType { get; set; }
    public bool WillingToRelocate { get; set; }
}

public class UpdateCandidateProfileDto
{
    public IslamicDesignation PrimaryDesignation { get; set; }
    public List<IslamicDesignation> AdditionalDesignations { get; set; } = new();
    public string? MadrasaName { get; set; }
    public int? YearsOfExperience { get; set; }
    public string? Biography { get; set; }
    
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? Address { get; set; }
    
    public decimal? ExpectedSalaryMin { get; set; }
    public decimal? ExpectedSalaryMax { get; set; }
    public string? SalaryCurrency { get; set; }
    
    public List<string> Languages { get; set; } = new();
    public List<string> Skills { get; set; } = new();
    
    public bool IsAvailableForWork { get; set; }
    public JobType PreferredJobType { get; set; }
    public bool WillingToRelocate { get; set; }
}

public class EmployerProfileDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    
    public string OrganizationName { get; set; } = string.Empty;
    public string OrganizationType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Website { get; set; }
    public string? LogoUrl { get; set; }
    
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? Address { get; set; }
    
    public string? ContactPersonName { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    
    public bool IsVerified { get; set; }
    public int TotalJobs { get; set; }
}

public class UpdateEmployerProfileDto
{
    public string OrganizationName { get; set; } = string.Empty;
    public string OrganizationType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Website { get; set; }
    
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? Address { get; set; }
    
    public string? ContactPersonName { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
}
