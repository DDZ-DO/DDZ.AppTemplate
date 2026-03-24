using DDZ.Lib.PostgreSQL;
using DDZ.Lib.PostgreSQL.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DDZ.__AppName__.API.Data;

public class AppDbContext(
    DbContextOptions<AppDbContext> options,
    IDDZCurrentUserProvider? currentUserProvider = null)
    : DDZPostgreSQLDbContext(options, enableChangeLogging: true, currentUserProvider: currentUserProvider)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}
