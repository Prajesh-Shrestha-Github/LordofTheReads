using LordofTheReads.Database;
using LordofTheReads.Database.Entities;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.Extensions.Logging;

namespace LordofTheReads.Services
{
    public class AdminAuthorizationService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<AdminAuthorizationService> _logger;

        public AdminAuthorizationService(AppDbContext context, ILogger<AdminAuthorizationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<bool> IsAdmin(ClaimsPrincipal user)
        {
            try
            {
                if (user == null)
                {
                    _logger.LogWarning("IsAdmin check failed: User is null");
                    return false;
                }

                if (user.Identity == null || !user.Identity.IsAuthenticated)
                {
                    _logger.LogWarning("IsAdmin check failed: User identity is null or not authenticated");
                    return false;
                }

                var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    _logger.LogWarning("IsAdmin check failed: NameIdentifier claim is missing");
                    return false;
                }

                if (!int.TryParse(userId, out var id))
                {
                    _logger.LogWarning("IsAdmin check failed: Unable to parse user ID '{UserId}' to integer", userId);
                    return false;
                }

                // Log all claims for debugging purposes
                _logger.LogInformation("User claims: {Claims}", string.Join(", ", user.Claims.Select(c => $"{c.Type}={c.Value}")));

                var userEntity = await _context.Users.FindAsync(id);
                if (userEntity == null)
                {
                    _logger.LogWarning("IsAdmin check failed: User with ID {UserId} not found", id);
                    return false;
                }

                var isAdmin = userEntity.Role == UserRole.Admin;
                _logger.LogInformation("User {UserId} role check: {Role}, isAdmin: {IsAdmin}", id, userEntity.Role, isAdmin);
                return isAdmin;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in IsAdmin check: {Message}", ex.Message);
                return false;
            }
        }
    }
}
