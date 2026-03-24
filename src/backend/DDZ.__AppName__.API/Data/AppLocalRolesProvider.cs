using DDZ.Shared.Authentication.LocalRoles;

namespace DDZ.__AppName__.API.Data;

public class AppLocalRolesProvider : IDDZLocalRolesProvider
{
    public List<LocalRoleModel> LocalRoles => [];

    public Task<List<string>> GetUserLocalRoleAsync(Guid userId)
    {
        return Task.FromResult(new List<string>());
    }

    public Task SaveUserAssignedRolesAsync(Guid userId, List<LocalRoleModel> roles)
    {
        return Task.CompletedTask;
    }
}
