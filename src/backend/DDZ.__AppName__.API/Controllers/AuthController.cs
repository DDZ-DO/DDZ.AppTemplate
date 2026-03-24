using DDZ.Shared.Authentication.API.Services;
using DDZ.__AppName__.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace DDZ.__AppName__.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    IAuthenticationService authService,
    IJwtService jwtService,
    JwtSettings jwtSettings) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { error = "E-Mail und Passwort sind erforderlich" });
        }

        var user = await authService.ValidateCredentials(jwtSettings.ServiceId, request.Email, request.Password);

        if (user == null)
        {
            return Unauthorized(new { error = "Ungueltige Anmeldedaten" });
        }

        var result = jwtService.GenerateToken(user);

        return Ok(new
        {
            token = result.Token,
            userId = user.Id,
            email = user.Email,
            firstName = user.Firstname,
            lastName = user.Lastname,
            abbreviation = user.Abbreviation,
            color = user.Color,
            roles = user.Roles,
            expiresAt = result.ExpiresAt.ToString("o")
        });
    }
}
