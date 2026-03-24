using System.Security.Claims;
using DDZ.Lib.PostgreSQL.Interfaces;

namespace DDZ.__AppName__.API.Services;

public class HttpCurrentUserProvider(IHttpContextAccessor accessor) : IDDZCurrentUserProvider
{
    public Guid? GetCurrentUserId()
    {
        var claim = accessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? accessor.HttpContext?.User?.FindFirst("sub")?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
