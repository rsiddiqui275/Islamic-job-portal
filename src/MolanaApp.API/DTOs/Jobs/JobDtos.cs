using MolanaApp.Domain.Enums;

namespace MolanaApp.API.DTOs.Jobs;

public class CreateJobDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public IslamicDesignation RequiredDesignation { get; set; }
    public List<IslamicDesignation> PreferredDesignations { get; set; } = new();
    public JobType JobType { get; set; }
    
    public int? MinExperienceYears { get; set; }
    public int? MaxExperienceYears { get; set; }
    public List<string> RequiredSkills { get; set; } = new();
    public List<string> RequiredLanguages { get; set; } = new();
    public string? QualificationRequirements { get; set; }
    
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string SalaryCurrency { get; set; } = "PKR";
    public bool IsSalaryNegotiable { get; set; }
    public bool ShowSalary { get; set; } = true;
    
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? Address { get; set; }
    public bool IsRemote { get; set; }
    
    public List<string> Benefits { get; set; } = new();
    public bool AccommodationProvided { get; set; }
    public bool FoodProvided { get; set; }
    
    public DateTime? ExpiresAt { get; set; }
}

public class JobDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public IslamicDesignation RequiredDesignation { get; set; }
    public string RequiredDesignationName { get; set; } = string.Empty;
    public List<IslamicDesignation> PreferredDesignations { get; set; } = new();
    public JobType JobType { get; set; }
    public JobStatus Status { get; set; }
    
    public int? MinExperienceYears { get; set; }
    public int? MaxExperienceYears { get; set; }
    public List<string> RequiredSkills { get; set; } = new();
    public List<string> RequiredLanguages { get; set; } = new();
    
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string SalaryCurrency { get; set; } = string.Empty;
    public bool ShowSalary { get; set; }
    
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public bool IsRemote { get; set; }
    
    public List<string> Benefits { get; set; } = new();
    public bool AccommodationProvided { get; set; }
    public bool FoodProvided { get; set; }
    
    public DateTime PostedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    
    public int ViewCount { get; set; }
    public int ApplicationCount { get; set; }
    
    public EmployerSummaryDto Employer { get; set; } = null!;
}

public class EmployerSummaryDto
{
    public Guid Id { get; set; }
    public string OrganizationName { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public bool IsVerified { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactEmail { get; set; }
    public string? City { get; set; }
}

public class JobSearchDto
{
    public string? Keyword { get; set; }
    public IslamicDesignation? Designation { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public decimal? MinSalary { get; set; }
    public decimal? MaxSalary { get; set; }
    public JobType? JobType { get; set; }
    public bool? IsRemote { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string SortBy { get; set; } = "PostedAt";
    public bool SortDescending { get; set; } = true;
}

public class PagedResultDto<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}
