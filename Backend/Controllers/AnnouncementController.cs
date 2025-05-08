using LordofTheReads.Database;
using LordofTheReads.Database.Entities;
using LordofTheReads.DTOs.Announcement;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LordofTheReads.Controllers
{
    [ApiController]
    [Route("api/announcements")]
    public class AnnouncementController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<AnnouncementController> _logger;

        public AnnouncementController(
            AppDbContext context, 
            ILogger<AnnouncementController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/announcements
        [HttpGet]
        public async Task<IActionResult> GetActiveAnnouncements()
        {
            var now = DateTime.UtcNow;
            
            var announcements = await _context.Announcements
                .Where(a => a.IsActive && a.StartDate <= now && (!a.EndDate.HasValue || a.EndDate > now))
                .OrderByDescending(a => a.StartDate)
                .Select(a => new AnnouncementDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Content = a.Content,
                    StartDate = a.StartDate,
                    EndDate = a.EndDate,
                    IsActive = a.IsActive
                })
                .ToListAsync();

            return Ok(announcements);
        }

        // GET: api/announcements/latest
        [HttpGet("latest")]
        public async Task<IActionResult> GetLatestAnnouncement()
        {
            var now = DateTime.UtcNow;
            
            var announcement = await _context.Announcements
                .Where(a => a.IsActive && a.StartDate <= now && (!a.EndDate.HasValue || a.EndDate > now))
                .OrderByDescending(a => a.StartDate)
                .Select(a => new AnnouncementDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Content = a.Content,
                    StartDate = a.StartDate,
                    EndDate = a.EndDate,
                    IsActive = a.IsActive
                })
                .FirstOrDefaultAsync();

            if (announcement == null)
            {
                return NotFound();
            }

            return Ok(announcement);
        }
    }
}
