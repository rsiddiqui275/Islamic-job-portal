using Microsoft.EntityFrameworkCore;
using MolanaApp.API.DTOs.Applications;
using MolanaApp.API.DTOs.Jobs;
using MolanaApp.Domain.Entities;
using MolanaApp.Domain.Enums;
using MolanaApp.Infrastructure.Data;

namespace MolanaApp.API.Services;

public interface IApplicationService
{
    Task<ApplicationDto> ApplyForJobAsync(Guid candidateUserId, CreateApplicationDto dto);
    Task<ApplicationDto?> GetApplicationByIdAsync(Guid applicationId, Guid userId);
    Task<PagedResultDto<ApplicationDto>> GetCandidateApplicationsAsync(Guid candidateUserId, int page, int pageSize);
    Task<PagedResultDto<ApplicationDto>> GetJobApplicationsAsync(Guid jobId, Guid employerId, int page, int pageSize);
    Task<PagedResultDto<ApplicationDto>> GetAllEmployerApplicationsAsync(Guid employerId, int page, int pageSize);
    Task<ApplicationDto> UpdateApplicationStatusAsync(Guid applicationId, Guid employerId, UpdateApplicationStatusDto dto);
    Task<bool> WithdrawApplicationAsync(Guid applicationId, Guid candidateUserId);
    Task<bool> HasAppliedAsync(Guid candidateUserId, Guid jobId);
    Task<ApplicationStatusResponseDto> GetApplicationStatusForJobAsync(Guid candidateUserId, Guid jobId);
}

public class ApplicationService : IApplicationService
{
    private readonly MolanaAppDbContext _context;
    private readonly INotificationService _notificationService;

    public ApplicationService(MolanaAppDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<ApplicationDto> ApplyForJobAsync(Guid candidateUserId, CreateApplicationDto dto)
    {
        var candidateProfile = await _context.CandidateProfiles
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.UserId == candidateUserId);

        if (candidateProfile == null)
        {
            throw new InvalidOperationException("Candidate profile not found");
        }

        var job = await _context.Jobs
            .Include(j => j.EmployerProfile)
            .FirstOrDefaultAsync(j => j.Id == dto.JobId);
        if (job == null || job.Status != JobStatus.Active)
        {
            throw new InvalidOperationException("Job not found or not accepting applications");
        }

        // Check if already applied (excluding withdrawn)
        var existingApplication = await _context.JobApplications
            .FirstOrDefaultAsync(a => a.JobId == dto.JobId && a.CandidateProfileId == candidateProfile.Id);

        if (existingApplication != null)
        {
            if (existingApplication.Status == ApplicationStatus.Withdrawn)
            {
                // Re-activate withdrawn application
                existingApplication.Status = ApplicationStatus.Pending;
                existingApplication.CoverLetter = dto.CoverLetter;
                existingApplication.ExpectedSalary = dto.ExpectedSalary;
                existingApplication.AdditionalNotes = dto.AdditionalNotes;
                existingApplication.AppliedAt = DateTime.UtcNow;
                existingApplication.UpdatedAt = DateTime.UtcNow;
                existingApplication.ReviewedAt = null;
                job.ApplicationCount++;
                
                await _context.SaveChangesAsync();

                // Send notification to employer
                var candidateName = $"{candidateProfile.User.FirstName} {candidateProfile.User.LastName}";
                await _notificationService.CreateNotificationAsync(
                    job.EmployerProfile.UserId,
                    "New Job Application / نئی درخواست",
                    $"{candidateName} has re-applied for your job: {job.Title}",
                    "JobApplication",
                    System.Text.Json.JsonSerializer.Serialize(new { jobId = job.Id, applicationId = existingApplication.Id })
                );

                return await GetApplicationByIdAsync(existingApplication.Id, candidateUserId) 
                    ?? throw new Exception("Failed to re-apply");
            }
            throw new InvalidOperationException("Already applied for this job");
        }

        var application = new JobApplication
        {
            Id = Guid.NewGuid(),
            JobId = dto.JobId,
            CandidateProfileId = candidateProfile.Id,
            CoverLetter = dto.CoverLetter,
            ExpectedSalary = dto.ExpectedSalary,
            AdditionalNotes = dto.AdditionalNotes,
            ResumeUrl = candidateProfile.ResumeUrl,
            Status = ApplicationStatus.Pending,
            AppliedAt = DateTime.UtcNow
        };

        _context.JobApplications.Add(application);

        // Increment application count
        job.ApplicationCount++;

        await _context.SaveChangesAsync();

        // Send notification to employer
        var applicantName = $"{candidateProfile.User.FirstName} {candidateProfile.User.LastName}";
        await _notificationService.CreateNotificationAsync(
            job.EmployerProfile.UserId,
            "New Job Application / نئی درخواست",
            $"{applicantName} has applied for your job: {job.Title}",
            "JobApplication",
            System.Text.Json.JsonSerializer.Serialize(new { jobId = job.Id, applicationId = application.Id })
        );

        return await GetApplicationByIdAsync(application.Id, candidateUserId) 
            ?? throw new Exception("Failed to create application");
    }

    public async Task<ApplicationDto?> GetApplicationByIdAsync(Guid applicationId, Guid userId)
    {
        var application = await _context.JobApplications
            .Include(a => a.Job)
            .ThenInclude(j => j.EmployerProfile)
            .Include(a => a.CandidateProfile)
            .ThenInclude(c => c.User)
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (application == null) return null;

        // Check access rights
        var hasAccess = application.CandidateProfile.UserId == userId ||
                        application.Job.EmployerProfile.UserId == userId;

        if (!hasAccess) return null;

        return MapToApplicationDto(application, application.CandidateProfile.UserId == userId);
    }

    public async Task<PagedResultDto<ApplicationDto>> GetCandidateApplicationsAsync(
        Guid candidateUserId, int page, int pageSize)
    {
        var candidateProfile = await _context.CandidateProfiles
            .FirstOrDefaultAsync(c => c.UserId == candidateUserId);

        if (candidateProfile == null)
        {
            return new PagedResultDto<ApplicationDto>();
        }

        var query = _context.JobApplications
            .Include(a => a.Job)
            .ThenInclude(j => j.EmployerProfile)
            .Where(a => a.CandidateProfileId == candidateProfile.Id)
            .OrderByDescending(a => a.AppliedAt);

        var totalCount = await query.CountAsync();

        var applications = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResultDto<ApplicationDto>
        {
            Items = applications.Select(a => MapToApplicationDto(a, true)).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<PagedResultDto<ApplicationDto>> GetJobApplicationsAsync(
        Guid jobId, Guid employerId, int page, int pageSize)
    {
        var job = await _context.Jobs
            .Include(j => j.EmployerProfile)
            .FirstOrDefaultAsync(j => j.Id == jobId && j.EmployerProfile.UserId == employerId);

        if (job == null)
        {
            return new PagedResultDto<ApplicationDto>();
        }

        var query = _context.JobApplications
            .Include(a => a.CandidateProfile)
            .ThenInclude(c => c.User)
            .Where(a => a.JobId == jobId)
            .OrderByDescending(a => a.AppliedAt);

        var totalCount = await query.CountAsync();

        var applications = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResultDto<ApplicationDto>
        {
            Items = applications.Select(a => MapToApplicationDto(a, false)).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<PagedResultDto<ApplicationDto>> GetAllEmployerApplicationsAsync(
        Guid employerId, int page, int pageSize)
    {
        var employerProfile = await _context.EmployerProfiles
            .FirstOrDefaultAsync(e => e.UserId == employerId);

        if (employerProfile == null)
        {
            return new PagedResultDto<ApplicationDto>();
        }

        var employerJobIds = await _context.Jobs
            .Where(j => j.EmployerProfileId == employerProfile.Id)
            .Select(j => j.Id)
            .ToListAsync();

        var query = _context.JobApplications
            .Include(a => a.Job)
            .Include(a => a.CandidateProfile)
            .ThenInclude(c => c.User)
            .Where(a => employerJobIds.Contains(a.JobId))
            .OrderByDescending(a => a.AppliedAt);

        var totalCount = await query.CountAsync();

        var applications = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResultDto<ApplicationDto>
        {
            Items = applications.Select(a => MapToApplicationDto(a, false)).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ApplicationDto> UpdateApplicationStatusAsync(
        Guid applicationId, Guid employerId, UpdateApplicationStatusDto dto)
    {
        var application = await _context.JobApplications
            .Include(a => a.Job)
            .ThenInclude(j => j.EmployerProfile)
            .Include(a => a.CandidateProfile)
            .ThenInclude(c => c.User)
            .FirstOrDefaultAsync(a => a.Id == applicationId && 
                                      a.Job.EmployerProfile.UserId == employerId);

        if (application == null)
        {
            throw new InvalidOperationException("Application not found or access denied");
        }

        application.Status = dto.Status;
        application.EmployerNotes = dto.EmployerNotes;
        application.Rating = dto.Rating;
        application.ReviewedAt = DateTime.UtcNow;
        application.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Send notification to candidate about status change
        var statusText = dto.Status switch
        {
            ApplicationStatus.Accepted => "accepted / قبول",
            ApplicationStatus.Rejected => "rejected / رد",
            ApplicationStatus.Shortlisted => "shortlisted / منتخب",
            ApplicationStatus.Interviewed => "scheduled for interview / انٹرویو",
            _ => "updated"
        };

        var notificationTitle = dto.Status == ApplicationStatus.Accepted 
            ? "🎉 Application Accepted! / درخواست منظور!"
            : dto.Status == ApplicationStatus.Rejected 
                ? "Application Update / درخواست کی تازہ کاری"
                : "Application Status Updated / درخواست کی حیثیت";

        await _notificationService.CreateNotificationAsync(
            application.CandidateProfile.UserId,
            notificationTitle,
            $"Your application for '{application.Job.Title}' has been {statusText}.",
            "ApplicationStatusUpdate",
            System.Text.Json.JsonSerializer.Serialize(new { jobId = application.JobId, applicationId = application.Id, status = dto.Status })
        );

        return await GetApplicationByIdAsync(application.Id, employerId) 
            ?? throw new Exception("Failed to update application");
    }

    public async Task<bool> WithdrawApplicationAsync(Guid applicationId, Guid candidateUserId)
    {
        var candidateProfile = await _context.CandidateProfiles
            .FirstOrDefaultAsync(c => c.UserId == candidateUserId);

        if (candidateProfile == null) return false;

        var application = await _context.JobApplications
            .Include(a => a.Job)
            .FirstOrDefaultAsync(a => a.Id == applicationId && 
                                      a.CandidateProfileId == candidateProfile.Id);

        if (application == null) return false;

        application.Status = ApplicationStatus.Withdrawn;
        application.UpdatedAt = DateTime.UtcNow;
        application.Job.ApplicationCount--;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> HasAppliedAsync(Guid candidateUserId, Guid jobId)
    {
        var candidateProfile = await _context.CandidateProfiles
            .FirstOrDefaultAsync(c => c.UserId == candidateUserId);

        if (candidateProfile == null) return false;

        // Exclude withdrawn applications - allow re-applying
        return await _context.JobApplications
            .AnyAsync(a => a.JobId == jobId && 
                          a.CandidateProfileId == candidateProfile.Id && 
                          a.Status != ApplicationStatus.Withdrawn);
    }

    public async Task<ApplicationStatusResponseDto> GetApplicationStatusForJobAsync(Guid candidateUserId, Guid jobId)
    {
        var candidateProfile = await _context.CandidateProfiles
            .FirstOrDefaultAsync(c => c.UserId == candidateUserId);

        if (candidateProfile == null)
        {
            return new ApplicationStatusResponseDto { HasApplied = false };
        }

        var application = await _context.JobApplications
            .Where(a => a.JobId == jobId && 
                       a.CandidateProfileId == candidateProfile.Id &&
                       a.Status != ApplicationStatus.Withdrawn)
            .FirstOrDefaultAsync();

        if (application == null)
        {
            return new ApplicationStatusResponseDto { HasApplied = false };
        }

        return new ApplicationStatusResponseDto
        {
            HasApplied = true,
            Status = application.Status,
            StatusName = application.Status.ToString(),
            AppliedAt = application.AppliedAt
        };
    }

    private static ApplicationDto MapToApplicationDto(JobApplication application, bool isCandidate)
    {
        var dto = new ApplicationDto
        {
            Id = application.Id,
            JobId = application.JobId,
            CandidateProfileId = application.CandidateProfileId,
            Status = application.Status,
            StatusName = application.Status.ToString(),
            CoverLetter = application.CoverLetter,
            ExpectedSalary = application.ExpectedSalary,
            AppliedAt = application.AppliedAt,
            ReviewedAt = application.ReviewedAt
        };

        if (isCandidate && application.Job != null)
        {
            dto.Job = new JobSummaryDto
            {
                Id = application.Job.Id,
                Title = application.Job.Title,
                OrganizationName = application.Job.EmployerProfile?.OrganizationName ?? "",
                City = application.Job.City,
                Status = application.Job.Status
            };
        }
        else if (!isCandidate && application.CandidateProfile != null)
        {
            dto.Candidate = new CandidateSummaryDto
            {
                Id = application.CandidateProfile.Id,
                FirstName = application.CandidateProfile.User?.FirstName ?? "",
                LastName = application.CandidateProfile.User?.LastName ?? "",
                ProfileImageUrl = application.CandidateProfile.User?.ProfileImageUrl,
                PhoneNumber = application.CandidateProfile.User?.PhoneNumber,
                PrimaryDesignation = application.CandidateProfile.PrimaryDesignation,
                PrimaryDesignationName = application.CandidateProfile.PrimaryDesignation.ToString(),
                YearsOfExperience = application.CandidateProfile.YearsOfExperience,
                City = application.CandidateProfile.City
            };
        }

        return dto;
    }
}
