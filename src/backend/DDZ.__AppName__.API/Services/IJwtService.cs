using DDZ.Shared.Authentication.Data;

namespace DDZ.__AppName__.API.Services;

public interface IJwtService
{
    JwtResult GenerateToken(IAuthenticationUser user);
}
