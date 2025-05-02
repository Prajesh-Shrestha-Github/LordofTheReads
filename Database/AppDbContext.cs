using LordofTheReads.Database.Entities;
using Microsoft.EntityFrameworkCore;

namespace LordofTheReads.Database
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions options) : base(options)
        {

        }

        public DbSet<Book> Books { get; set; }
        public DbSet<User> Users { get; set; }
    }
}
