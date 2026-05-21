using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MolanaApp.API.Services;
using MolanaApp.Infrastructure.Data;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// Add DbContext - Support both SQL Server and PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? Environment.GetEnvironmentVariable("DATABASE_URL");
var databaseProvider = builder.Configuration["DatabaseProvider"] ?? "SqlServer";

// Convert Render's postgres:// URL to Npgsql format if needed
string? ConvertPostgresUrl(string? url)
{
    if (string.IsNullOrEmpty(url)) return url;
    
    // If it's already in standard format, return as-is
    if (url.Contains("Host=") || url.Contains("Server=")) return url;
    
    // Convert postgres://user:pass@host:port/db to Npgsql format
    if (url.StartsWith("postgres://") || url.StartsWith("postgresql://"))
    {
        var uri = new Uri(url);
        var userInfo = uri.UserInfo.Split(':');
        var host = uri.Host;
        var port = uri.Port > 0 ? uri.Port : 5432;
        var database = uri.AbsolutePath.TrimStart('/');
        
        return $"Host={host};Port={port};Database={database};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true";
    }
    
    return url;
}

builder.Services.AddDbContext<MolanaAppDbContext>(options =>
{
    if (databaseProvider == "PostgreSQL" || connectionString?.Contains("postgresql") == true || connectionString?.Contains("postgres") == true)
    {
        var npgsqlConnectionString = ConvertPostgresUrl(connectionString);
        options.UseNpgsql(npgsqlConnectionString);
    }
    else
    {
        options.UseSqlServer(connectionString);
    }
});

// Add Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJobService, JobService>();
builder.Services.AddScoped<IApplicationService, ApplicationService>();
builder.Services.AddScoped<IMessageService, MessageService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// JWT Configuration with fallbacks
var jwtKey = builder.Configuration["Jwt:Key"] ?? "MolanaApp-Super-Secret-Key-2024-Islamic-Portal-Secure-Key-256bit";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "MolanaApp";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "MolanaAppUsers";

// Add Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();

// Add Controllers
builder.Services.AddControllers();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "MolanaApp API v1");
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowAngular");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

// Auto-create database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<MolanaAppDbContext>();
    db.Database.EnsureCreated();
}

app.Run();
