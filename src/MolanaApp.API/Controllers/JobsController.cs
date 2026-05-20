using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MolanaApp.API.DTOs.Jobs;
using MolanaApp.API.Services;

namespace MolanaApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase
{
    private readonly IJobService _jobService;

    public JobsController(IJobService jobService)
    {
        _jobService = jobService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<JobDto>>> SearchJobs([FromQuery] JobSearchDto searchDto)
    {
        var result = await _jobService.SearchJobsAsync(searchDto);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<JobDto>> GetJob(Guid id)
    {
        var job = await _jobService.GetJobByIdAsync(id);
        
        if (job == null)
        {
            return NotFound();
        }

        // Increment view count
        await _jobService.IncrementViewCountAsync(id);

        return Ok(job);
    }

    [HttpPost]
    [Authorize(Roles = "Employer")]
    public async Task<ActionResult<JobDto>> CreateJob([FromBody] CreateJobDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var job = await _jobService.CreateJobAsync(userId, dto);
            return CreatedAtAction(nameof(GetJob), new { id = job.Id }, job);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Employer")]
    public async Task<ActionResult<JobDto>> UpdateJob(Guid id, [FromBody] CreateJobDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var job = await _jobService.UpdateJobAsync(id, userId, dto);
            return Ok(job);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Employer")]
    public async Task<ActionResult> DeleteJob(Guid id)
    {
        var userId = GetCurrentUserId();
        var result = await _jobService.DeleteJobAsync(id, userId);
        
        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpGet("my-jobs")]
    [Authorize(Roles = "Employer")]
    public async Task<ActionResult<List<JobDto>>> GetMyJobs()
    {
        var userId = GetCurrentUserId();
        var jobs = await _jobService.GetEmployerJobsAsync(userId);
        return Ok(jobs);
    }

    private Guid GetCurrentUserId()
    {
        return Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
    }
}
