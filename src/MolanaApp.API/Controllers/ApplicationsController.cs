using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MolanaApp.API.DTOs.Applications;
using MolanaApp.API.DTOs.Jobs;
using MolanaApp.API.Services;

namespace MolanaApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ApplicationsController : ControllerBase
{
    private readonly IApplicationService _applicationService;

    public ApplicationsController(IApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    [HttpPost]
    [Authorize(Roles = "Candidate")]
    public async Task<ActionResult<ApplicationDto>> Apply([FromBody] CreateApplicationDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var application = await _applicationService.ApplyForJobAsync(userId, dto);
            return CreatedAtAction(nameof(GetApplication), new { id = application.Id }, application);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApplicationDto>> GetApplication(Guid id)
    {
        var userId = GetCurrentUserId();
        var application = await _applicationService.GetApplicationByIdAsync(id, userId);
        
        if (application == null)
        {
            return NotFound();
        }

        return Ok(application);
    }

    [HttpGet("my-applications")]
    [Authorize(Roles = "Candidate")]
    public async Task<ActionResult<PagedResultDto<ApplicationDto>>> GetMyApplications(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userId = GetCurrentUserId();
        var result = await _applicationService.GetCandidateApplicationsAsync(userId, page, pageSize);
        return Ok(result);
    }

    [HttpGet("employer")]
    [Authorize(Roles = "Employer")]
    public async Task<ActionResult<PagedResultDto<ApplicationDto>>> GetEmployerApplications(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var userId = GetCurrentUserId();
        var result = await _applicationService.GetAllEmployerApplicationsAsync(userId, page, pageSize);
        return Ok(result);
    }

    [HttpGet("job/{jobId}")]
    [Authorize(Roles = "Employer")]
    public async Task<ActionResult<PagedResultDto<ApplicationDto>>> GetJobApplications(
        Guid jobId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userId = GetCurrentUserId();
        var result = await _applicationService.GetJobApplicationsAsync(jobId, userId, page, pageSize);
        return Ok(result);
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Employer")]
    public async Task<ActionResult<ApplicationDto>> UpdateStatus(
        Guid id, [FromBody] UpdateApplicationStatusDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var application = await _applicationService.UpdateApplicationStatusAsync(id, userId, dto);
            return Ok(application);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/withdraw")]
    [Authorize(Roles = "Candidate")]
    public async Task<ActionResult> Withdraw(Guid id)
    {
        var userId = GetCurrentUserId();
        var result = await _applicationService.WithdrawApplicationAsync(id, userId);
        
        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpGet("check/{jobId}")]
    [Authorize(Roles = "Candidate")]
    public async Task<ActionResult<bool>> HasApplied(Guid jobId)
    {
        var userId = GetCurrentUserId();
        var hasApplied = await _applicationService.HasAppliedAsync(userId, jobId);
        return Ok(hasApplied);
    }

    [HttpGet("status/{jobId}")]
    [Authorize(Roles = "Candidate")]
    public async Task<ActionResult<ApplicationStatusResponseDto>> GetApplicationStatus(Guid jobId)
    {
        var userId = GetCurrentUserId();
        var result = await _applicationService.GetApplicationStatusForJobAsync(userId, jobId);
        return Ok(result);
    }

    private Guid GetCurrentUserId()
    {
        return Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
    }
}
