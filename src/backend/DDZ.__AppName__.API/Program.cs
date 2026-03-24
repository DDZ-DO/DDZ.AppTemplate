using System.Text;
using System.Text.Json.Serialization;
using DDZ.EventBus;
using DDZ.Lib.PostgreSQL;
using DDZ.Lib.PostgreSQL.Interfaces;
using DDZ.Log;
using DDZ.__AppName__.API.Data;
using DDZ.__AppName__.API.Services;
using DDZ.Shared;
using DDZ.Shared.Admin;
using DDZ.Shared.Status;
using DDZ.Shared.Tasks;
using DDZ.Shared.Authentication.API.Services;
using DDZ.Shared.Authentication.LocalRoles;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.AddDDZLog();

// JWT Authentication (shared secret with DDZ.Identity)
var jwtSecret = Environment.GetEnvironmentVariable("DDZ_JWT_SECRET")
    ?? throw new InvalidOperationException("DDZ_JWT_SECRET environment variable must be set");
var serviceId = Environment.GetEnvironmentVariable("DDZ_SERVICE_ID") ?? "DDZ.__AppName__";
var jwtSettings = new JwtSettings(jwtSecret, serviceId);
builder.Services.AddSingleton(jwtSettings);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuer = serviceId,
            ValidAudience = serviceId,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
        // Allow JWT token in query string for SignalR
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization();

// Automatic user attribution for DDZ.Lib.PostgreSQL (CreatedBy/ModifiedBy)
builder.Services.AddHttpContextAccessor();
builder.Services.AddSingleton<IDDZCurrentUserProvider, HttpCurrentUserProvider>();

// SignalR for real-time updates (enum as string to match REST API serialization)
builder.Services.AddSignalR()
    .AddJsonProtocol(options =>
    {
        options.PayloadSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// PostgreSQL Database (DDZ.Lib.PostgreSQL)
builder.AddDDZPostgreSqlDb<AppDbContext>("ddz-__appname__", options =>
{
    options.EnsureDatabaseCreated = false;
});

builder.AddDDZEventBus(addHealthService: false);
builder.AddDDZAdmin();
builder.AddDDZTasks();
builder.AddDDZTasksSignalR();
builder.AddDDZUserPreferences();

// Authentication services via NATS (DDZ.Shared.Authentication)
builder.Services.AddSingleton<IDDZLocalRolesProvider, AppLocalRolesProvider>();
builder.Services.AddSingleton<IAuthenticationService, RemoteAuthenticationService>();
builder.Services.AddSingleton<IJwtService, JwtService>();
builder.Services.AddSingleton<IDDZRemoteUserService, DDZRemoteUserService>();
builder.Services.AddHostedService<DDZRemoteUserServiceInitializer>();

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5315", "http://localhost:4173"];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapDDZTasksHub();
app.MapStatusEndpoints();
app.MapDDZAdmin("/admin");
app.MapGet("/api/health", () => Results.Ok(new { status = "healthy" }));
app.MapFallbackToFile("index.html");

app.Run();
