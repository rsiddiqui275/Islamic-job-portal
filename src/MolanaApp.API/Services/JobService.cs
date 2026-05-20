using Microsoft.EntityFrameworkCore;
using MolanaApp.API.DTOs.Jobs;
using MolanaApp.Domain.Entities;
using MolanaApp.Domain.Enums;
using MolanaApp.Infrastructure.Data;

namespace MolanaApp.API.Services;

public interface IJobService
{
    Task<JobDto> CreateJobAsync(Guid employerId, CreateJobDto dto);
    Task<JobDto?> GetJobByIdAsync(Guid jobId);
    Task<PagedResultDto<JobDto>> SearchJobsAsync(JobSearchDto searchDto);
    Task<JobDto> UpdateJobAsync(Guid jobId, Guid employerId, CreateJobDto dto);
    Task<bool> DeleteJobAsync(Guid jobId, Guid employerId);
    Task<List<JobDto>> GetEmployerJobsAsync(Guid employerId);
    Task IncrementViewCountAsync(Guid jobId);
}

public class JobService : IJobService
{
    private readonly MolanaAppDbContext _context;

    public JobService(MolanaAppDbContext context)
    {
        _context = context;
    }

    public async Task<JobDto> CreateJobAsync(Guid employerId, CreateJobDto dto)
    {
        var employerProfile = await _context.EmployerProfiles
            .FirstOrDefaultAsync(e => e.UserId == employerId);

        if (employerProfile == null)
        {
            throw new InvalidOperationException("Employer profile not found");
        }

        var job = new Job
        {
            Id = Guid.NewGuid(),
            EmployerProfileId = employerProfile.Id,
            Title = dto.Title,
            Description = dto.Description,
            RequiredDesignation = dto.RequiredDesignation,
            PreferredDesignations = dto.PreferredDesignations,
            JobType = dto.JobType,
            Status = JobStatus.Active,
            MinExperienceYears = dto.MinExperienceYears,
            MaxExperienceYears = dto.MaxExperienceYears,
            RequiredSkills = dto.RequiredSkills,
            RequiredLanguages = dto.RequiredLanguages,
            QualificationRequirements = dto.QualificationRequirements,
            SalaryMin = dto.SalaryMin,
            SalaryMax = dto.SalaryMax,
            SalaryCurrency = dto.SalaryCurrency,
            IsSalaryNegotiable = dto.IsSalaryNegotiable,
            ShowSalary = dto.ShowSalary,
            City = dto.City,
            State = dto.State,
            Country = dto.Country,
            Address = dto.Address,
            IsRemote = dto.IsRemote,
            Benefits = dto.Benefits,
            AccommodationProvided = dto.AccommodationProvided,
            FoodProvided = dto.FoodProvided,
            ExpiresAt = dto.ExpiresAt,
            PostedAt = DateTime.UtcNow
        };

        _context.Jobs.Add(job);
        await _context.SaveChangesAsync();

        return await GetJobByIdAsync(job.Id) ?? throw new Exception("Failed to create job");
    }

    public async Task<JobDto?> GetJobByIdAsync(Guid jobId)
    {
        var job = await _context.Jobs
            .Include(j => j.EmployerProfile)
            .ThenInclude(e => e.User)
            .FirstOrDefaultAsync(j => j.Id == jobId);

        if (job == null) return null;

        return MapToJobDto(job);
    }

    public async Task<PagedResultDto<JobDto>> SearchJobsAsync(JobSearchDto searchDto)
    {
        var query = _context.Jobs
            .Include(j => j.EmployerProfile)
            .ThenInclude(e => e.User)
            .Where(j => j.Status == JobStatus.Active);

        // Apply filters
        if (!string.IsNullOrEmpty(searchDto.Keyword))
        {
            query = query.Where(j => 
                j.Title.Contains(searchDto.Keyword) || 
                j.Description.Contains(searchDto.Keyword));
        }

        if (searchDto.Designation.HasValue)
        {
            query = query.Where(j => j.RequiredDesignation == searchDto.Designation.Value);
        }

        if (!string.IsNullOrEmpty(searchDto.City))
        {
            query = query.Where(j => j.City.Contains(searchDto.City));
        }

        if (!string.IsNullOrEmpty(searchDto.State))
        {
            query = query.Where(j => j.State.Contains(searchDto.State));
        }

        if (!string.IsNullOrEmpty(searchDto.Country))
        {
            query = query.Where(j => j.Country.Contains(searchDto.Country));
        }

        if (searchDto.MinSalary.HasValue)
        {
            query = query.Where(j => j.SalaryMax >= searchDto.MinSalary.Value);
        }

        if (searchDto.MaxSalary.HasValue)
        {
            query = query.Where(j => j.SalaryMin <= searchDto.MaxSalary.Value);
        }

        if (searchDto.JobType.HasValue)
        {
            query = query.Where(j => j.JobType == searchDto.JobType.Value);
        }

        if (searchDto.IsRemote.HasValue)
        {
            query = query.Where(j => j.IsRemote == searchDto.IsRemote.Value);
        }

        // Get total count
        var totalCount = await query.CountAsync();

        // Apply sorting
        query = searchDto.SortBy switch
        {
            "Salary" => searchDto.SortDescending 
                ? query.OrderByDescending(j => j.SalaryMax) 
                : query.OrderBy(j => j.SalaryMin),
            "Title" => searchDto.SortDescending 
                ? query.OrderByDescending(j => j.Title) 
                : query.OrderBy(j => j.Title),
            _ => searchDto.SortDescending 
                ? query.OrderByDescending(j => j.PostedAt) 
                : query.OrderBy(j => j.PostedAt)
        };

        // Apply pagination
        var jobs = await query
            .Skip((searchDto.Page - 1) * searchDto.PageSize)
            .Take(searchDto.PageSize)
            .ToListAsync();

        return new PagedResultDto<JobDto>
        {
            Items = jobs.Select(MapToJobDto).ToList(),
            TotalCount = totalCount,
            Page = searchDto.Page,
            PageSize = searchDto.PageSize
        };
    }

    public async Task<JobDto> UpdateJobAsync(Guid jobId, Guid employerId, CreateJobDto dto)
    {
        var job = await _context.Jobs
            .Include(j => j.EmployerProfile)
            .FirstOrDefaultAsync(j => j.Id == jobId && j.EmployerProfile.UserId == employerId);

        if (job == null)
        {
            throw new InvalidOperationException("Job not found or access denied");
        }

        job.Title = dto.Title;
        job.Description = dto.Description;
        job.RequiredDesignation = dto.RequiredDesignation;
        job.PreferredDesignations = dto.PreferredDesignations;
        job.JobType = dto.JobType;
        job.MinExperienceYears = dto.MinExperienceYears;
        job.MaxExperienceYears = dto.MaxExperienceYears;
        job.RequiredSkills = dto.RequiredSkills;
        job.RequiredLanguages = dto.RequiredLanguages;
        job.QualificationRequirements = dto.QualificationRequirements;
        job.SalaryMin = dto.SalaryMin;
        job.SalaryMax = dto.SalaryMax;
        job.SalaryCurrency = dto.SalaryCurrency;
        job.IsSalaryNegotiable = dto.IsSalaryNegotiable;
        job.ShowSalary = dto.ShowSalary;
        job.City = dto.City;
        job.State = dto.State;
        job.Country = dto.Country;
        job.Address = dto.Address;
        job.IsRemote = dto.IsRemote;
        job.Benefits = dto.Benefits;
        job.AccommodationProvided = dto.AccommodationProvided;
        job.FoodProvided = dto.FoodProvided;
        job.ExpiresAt = dto.ExpiresAt;
        job.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetJobByIdAsync(job.Id) ?? throw new Exception("Failed to update job");
    }

    public async Task<bool> DeleteJobAsync(Guid jobId, Guid employerId)
    {
        var job = await _context.Jobs
            .Include(j => j.EmployerProfile)
            .FirstOrDefaultAsync(j => j.Id == jobId && j.EmployerProfile.UserId == employerId);

        if (job == null) return false;

        _context.Jobs.Remove(job);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<JobDto>> GetEmployerJobsAsync(Guid employerId)
    {
        var jobs = await _context.Jobs
            .Include(j => j.EmployerProfile)
            .ThenInclude(e => e.User)
            .Where(j => j.EmployerProfile.UserId == employerId)
            .OrderByDescending(j => j.PostedAt)
            .ToListAsync();

        return jobs.Select(MapToJobDto).ToList();
    }

    public async Task IncrementViewCountAsync(Guid jobId)
    {
        var job = await _context.Jobs.FindAsync(jobId);
        if (job != null)
        {
            job.ViewCount++;
            await _context.SaveChangesAsync();
        }
    }

    private static JobDto MapToJobDto(Job job)
    {
        return new JobDto
        {
            Id = job.Id,
            Title = job.Title,
            Description = job.Description,
            RequiredDesignation = job.RequiredDesignation,
            RequiredDesignationName = job.RequiredDesignation.ToString(),
            PreferredDesignations = job.PreferredDesignations,
            JobType = job.JobType,
            Status = job.Status,
            MinExperienceYears = job.MinExperienceYears,
            MaxExperienceYears = job.MaxExperienceYears,
            RequiredSkills = job.RequiredSkills,
            RequiredLanguages = job.RequiredLanguages,
            SalaryMin = job.ShowSalary ? job.SalaryMin : null,
            SalaryMax = job.ShowSalary ? job.SalaryMax : null,
            SalaryCurrency = job.SalaryCurrency,
            ShowSalary = job.ShowSalary,
            City = job.City,
            State = job.State,
            Country = job.Country,
            IsRemote = job.IsRemote,
            Benefits = job.Benefits,
            AccommodationProvided = job.AccommodationProvided,
            FoodProvided = job.FoodProvided,
            PostedAt = job.PostedAt,
            ExpiresAt = job.ExpiresAt,
            ViewCount = job.ViewCount,
            ApplicationCount = job.ApplicationCount,
            Employer = new EmployerSummaryDto
            {
                Id = job.EmployerProfile.Id,
                OrganizationName = job.EmployerProfile.OrganizationName,
                LogoUrl = job.EmployerProfile.LogoUrl,
                IsVerified = job.EmployerProfile.IsVerified,
                ContactPhone = job.EmployerProfile.ContactPhone,
                ContactEmail = job.EmployerProfile.ContactEmail,
                City = job.EmployerProfile.City
            }
        };
    }
}
