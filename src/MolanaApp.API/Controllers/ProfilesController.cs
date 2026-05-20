using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MolanaApp.API.DTOs.Profiles;
using MolanaApp.Domain.Enums;
using MolanaApp.Infrastructure.Data;

namespace MolanaApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfilesController : ControllerBase
{
    private readonly MolanaAppDbContext _context;

    public ProfilesController(MolanaAppDbContext context)
    {
        _context = context;
    }

    [HttpGet("candidate")]
    [Authorize(Roles = "Candidate")]
    public async Task<ActionResult<CandidateProfileDto>> GetCandidateProfile()
    {
        var userId = GetCurrentUserId();
        var profile = await _context.CandidateProfiles
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (profile == null)
        {
            return NotFound();
        }

        return Ok(MapToCandidateDto(profile));
    }

    [HttpPut("candidate")]
    [Authorize(Roles = "Candidate")]
    public async Task<ActionResult<CandidateProfileDto>> UpdateCandidateProfile(
        [FromBody] UpdateCandidateProfileDto dto)
    {
        var userId = GetCurrentUserId();
        var profile = await _context.CandidateProfiles
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (profile == null)
        {
            return NotFound();
        }

        profile.PrimaryDesignation = dto.PrimaryDesignation;
        profile.AdditionalDesignations = dto.AdditionalDesignations;
        profile.MadrasaName = dto.MadrasaName;
        profile.YearsOfExperience = dto.YearsOfExperience;
        profile.Biography = dto.Biography;
        profile.City = dto.City;
        profile.State = dto.State;
        profile.Country = dto.Country;
        profile.Address = dto.Address;
        profile.ExpectedSalaryMin = dto.ExpectedSalaryMin;
        profile.ExpectedSalaryMax = dto.ExpectedSalaryMax;
        profile.SalaryCurrency = dto.SalaryCurrency;
        profile.Languages = dto.Languages;
        profile.Skills = dto.Skills;
        profile.IsAvailableForWork = dto.IsAvailableForWork;
        profile.PreferredJobType = dto.PreferredJobType;
        profile.WillingToRelocate = dto.WillingToRelocate;
        profile.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(MapToCandidateDto(profile));
    }

    [HttpGet("employer")]
    [Authorize(Roles = "Employer")]
    public async Task<ActionResult<EmployerProfileDto>> GetEmployerProfile()
    {
        var userId = GetCurrentUserId();
        var profile = await _context.EmployerProfiles
            .Include(e => e.User)
            .Include(e => e.Jobs)
            .FirstOrDefaultAsync(e => e.UserId == userId);

        if (profile == null)
        {
            return NotFound();
        }

        return Ok(MapToEmployerDto(profile));
    }

    [HttpPut("employer")]
    [Authorize(Roles = "Employer")]
    public async Task<ActionResult<EmployerProfileDto>> UpdateEmployerProfile(
        [FromBody] UpdateEmployerProfileDto dto)
    {
        var userId = GetCurrentUserId();
        var profile = await _context.EmployerProfiles
            .Include(e => e.User)
            .Include(e => e.Jobs)
            .FirstOrDefaultAsync(e => e.UserId == userId);

        if (profile == null)
        {
            return NotFound();
        }

        profile.OrganizationName = dto.OrganizationName;
        profile.OrganizationType = dto.OrganizationType;
        profile.Description = dto.Description;
        profile.Website = dto.Website;
        profile.City = dto.City;
        profile.State = dto.State;
        profile.Country = dto.Country;
        profile.Address = dto.Address;
        profile.ContactPersonName = dto.ContactPersonName;
        profile.ContactEmail = dto.ContactEmail;
        profile.ContactPhone = dto.ContactPhone;
        profile.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(MapToEmployerDto(profile));
    }

    [HttpGet("candidate/{id}")]
    public async Task<ActionResult<CandidateProfileDto>> GetCandidateProfileById(Guid id)
    {
        var profile = await _context.CandidateProfiles
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (profile == null)
        {
            return NotFound();
        }

        return Ok(MapToCandidateDto(profile));
    }

    [HttpGet("employer/{id}")]
    public async Task<ActionResult<EmployerProfileDto>> GetEmployerProfileById(Guid id)
    {
        var profile = await _context.EmployerProfiles
            .Include(e => e.User)
            .Include(e => e.Jobs)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (profile == null)
        {
            return NotFound();
        }

        return Ok(MapToEmployerDto(profile));
    }

    [HttpGet("candidates/search")]
    [Authorize(Roles = "Employer")]
    public async Task<ActionResult<List<CandidateProfileDto>>> SearchCandidates(
        [FromQuery] IslamicDesignation? designation,
        [FromQuery] string? city,
        [FromQuery] int? minExperience,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.CandidateProfiles
            .Include(c => c.User)
            .Where(c => c.IsAvailableForWork);

        if (designation.HasValue)
        {
            query = query.Where(c => c.PrimaryDesignation == designation.Value ||
                                     c.AdditionalDesignations.Contains(designation.Value));
        }

        if (!string.IsNullOrEmpty(city))
        {
            query = query.Where(c => c.City.Contains(city));
        }

        if (minExperience.HasValue)
        {
            query = query.Where(c => c.YearsOfExperience >= minExperience.Value);
        }

        var profiles = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(profiles.Select(MapToCandidateDto).ToList());
    }

    private Guid GetCurrentUserId()
    {
        return Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
    }

    private static CandidateProfileDto MapToCandidateDto(Domain.Entities.CandidateProfile profile)
    {
        return new CandidateProfileDto
        {
            Id = profile.Id,
            UserId = profile.UserId,
            FirstName = profile.User?.FirstName ?? "",
            LastName = profile.User?.LastName ?? "",
            ProfileImageUrl = profile.User?.ProfileImageUrl,
            PrimaryDesignation = profile.PrimaryDesignation,
            PrimaryDesignationName = profile.PrimaryDesignation.ToString(),
            AdditionalDesignations = profile.AdditionalDesignations,
            MadrasaName = profile.MadrasaName,
            YearsOfExperience = profile.YearsOfExperience,
            Biography = profile.Biography,
            City = profile.City,
            State = profile.State,
            Country = profile.Country,
            ExpectedSalaryMin = profile.ExpectedSalaryMin,
            ExpectedSalaryMax = profile.ExpectedSalaryMax,
            SalaryCurrency = profile.SalaryCurrency,
            Languages = profile.Languages,
            Skills = profile.Skills,
            IsAvailableForWork = profile.IsAvailableForWork,
            PreferredJobType = profile.PreferredJobType,
            WillingToRelocate = profile.WillingToRelocate
        };
    }

    private static EmployerProfileDto MapToEmployerDto(Domain.Entities.EmployerProfile profile)
    {
        return new EmployerProfileDto
        {
            Id = profile.Id,
            UserId = profile.UserId,
            OrganizationName = profile.OrganizationName,
            OrganizationType = profile.OrganizationType,
            Description = profile.Description,
            Website = profile.Website,
            LogoUrl = profile.LogoUrl,
            City = profile.City,
            State = profile.State,
            Country = profile.Country,
            Address = profile.Address,
            ContactPersonName = profile.ContactPersonName,
            ContactEmail = profile.ContactEmail,
            ContactPhone = profile.ContactPhone,
            IsVerified = profile.IsVerified,
            TotalJobs = profile.Jobs?.Count ?? 0
        };
    }
}
