using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MolanaApp.API.DTOs.Auth;
using MolanaApp.Domain.Entities;
using MolanaApp.Domain.Enums;
using MolanaApp.Infrastructure.Data;

namespace MolanaApp.API.Services;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
    Task<UserDto?> GetCurrentUserAsync(Guid userId);
}

public class AuthService : IAuthService
{
    private readonly MolanaAppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(MolanaAppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
        {
            throw new InvalidOperationException("Email already registered");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = dto.Email,
            PasswordHash = HashPassword(dto.Password),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            PhoneNumber = dto.PhoneNumber,
            Role = dto.Role,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);

        // Create profile based on role
        if (dto.Role == UserRole.Candidate)
        {
            var candidateProfile = new CandidateProfile
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                CreatedAt = DateTime.UtcNow
            };
            _context.CandidateProfiles.Add(candidateProfile);
        }
        else if (dto.Role == UserRole.Employer)
        {
            var employerProfile = new EmployerProfile
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                CreatedAt = DateTime.UtcNow
            };
            _context.EmployerProfiles.Add(employerProfile);
        }

        await _context.SaveChangesAsync();

        return GenerateAuthResponse(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        
        if (user == null || !VerifyPassword(dto.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return GenerateAuthResponse(user);
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        // In production, store refresh tokens in database and validate
        throw new NotImplementedException("Implement refresh token storage");
    }

    public async Task<UserDto?> GetCurrentUserAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return null;

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            ProfileImageUrl = user.ProfileImageUrl,
            Role = user.Role,
            IsVerified = user.IsVerified
        };
    }

    private AuthResponseDto GenerateAuthResponse(User user)
    {
        var token = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken();

        return new AuthResponseDto
        {
            Token = token,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                ProfileImageUrl = user.ProfileImageUrl,
                Role = user.Role,
                IsVerified = user.IsVerified
            }
        };
    }

    private string GenerateJwtToken(User user)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? "MolanaApp-Super-Secret-Key-2024-Islamic-Portal-Default";
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? "MolanaApp";
        var jwtAudience = _configuration["Jwt:Audience"] ?? "MolanaAppUsers";
        
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("firstName", user.FirstName),
            new Claim("lastName", user.LastName)
        };

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    private static string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    private static bool VerifyPassword(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }
}
