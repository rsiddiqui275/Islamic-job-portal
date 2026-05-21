using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MolanaApp.API.DTOs.Auth;
using MolanaApp.API.Services;

namespace MolanaApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
    {
        try
        {
            _logger.LogInformation("Registration attempt for email: {Email}", dto.Email);
            var result = await _authService.RegisterAsync(dto);
            _logger.LogInformation("Registration successful for email: {Email}", dto.Email);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Registration failed: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Registration error for email: {Email}", dto.Email);
            return StatusCode(500, new { message = "Registration failed: " + ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        try
        {
            _logger.LogInformation("Login attempt for email: {Email}", dto.Email);
            var result = await _authService.LoginAsync(dto);
            _logger.LogInformation("Login successful for email: {Email}", dto.Email);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Login failed: {Message}", ex.Message);
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login error for email: {Email}", dto.Email);
            return StatusCode(500, new { message = "Login failed: " + ex.Message });
        }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var user = await _authService.GetCurrentUserAsync(userId);
        
        if (user == null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponseDto>> RefreshToken([FromBody] string refreshToken)
    {
        try
        {
            var result = await _authService.RefreshTokenAsync(refreshToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }
}
