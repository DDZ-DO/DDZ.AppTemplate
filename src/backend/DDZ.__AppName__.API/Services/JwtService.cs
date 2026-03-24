using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DDZ.Shared.Authentication.Data;
using Microsoft.IdentityModel.Tokens;

namespace DDZ.__AppName__.API.Services;

public class JwtService(JwtSettings settings) : IJwtService
{
    public JwtResult GenerateToken(IAuthenticationUser user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresAt = DateTime.UtcNow.AddHours(24);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.GivenName, user.Firstname ?? ""),
            new(ClaimTypes.Surname, user.Lastname ?? ""),
            new("abbreviation", user.Abbreviation ?? ""),
            new("service", settings.ServiceId)
        };

        foreach (var role in user.Roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var token = new JwtSecurityToken(
            issuer: settings.ServiceId,
            audience: settings.ServiceId,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        return new JwtResult(new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}
