using LordofTheReads.Database;
using LordofTheReads.Database.Entities;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LordofTheReads.Services
{
    public class AdminAuthorizationService
    {
        private readonly AppDbContext _context;

        public AdminAuthorizationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> IsAdmin(ClaimsPrincipal user)
        {
            if (user == null || user.Identity == null || !user.Identity.IsAuthenticated)
            {
                return false;
            }

            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out var id))
            {
                return false;
            }

            var userEntity = await _context.Users.FindAsync(id);
            return userEntity != null && userEntity.Role == UserRole.Admin;
        }
    }
}
