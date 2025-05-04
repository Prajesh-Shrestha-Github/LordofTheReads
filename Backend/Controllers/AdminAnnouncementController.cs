using LordofTheReads.Database;
using LordofTheReads.Database.Entities;
using LordofTheReads.DTOs.Announcement;
using LordofTheReads.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LordofTheReads.Controllers
{
    [ApiController]
    [Route("api/admin/announcements")]
    [Authorize]
    public class AdminAnnouncementController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<AdminAnnouncementController> _logger;
        private readonly AdminAuthorizationService _adminAuthService;

        public AdminAnnouncementController(
            AppDbContext context, 
            ILogger<AdminAnnouncementController> logger,
            AdminAuthorizationService adminAuthService)
        {
            _context = context;
            _logger = logger;
            _adminAuthService = adminAuthService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAnnouncements()
        {
            // Check if user is admin
            if (!await _adminAuthService.IsAdmin(User))
            {
                return Forbid();
            }

            var announcements = await _context.Announcements
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

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAnnouncement(int id)
        {
            // Check if user is admin
            if (!await _adminAuthService.IsAdmin(User))
            {
                return Forbid();
            }

            var announcement = await _context.Announcements
                .Where(a => a.Id == id)
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

        [HttpPost]
        public async Task<IActionResult> CreateAnnouncement(AnnouncementCreateDto announcementCreateDto)
        {
            // Check if user is admin
            if (!await _adminAuthService.IsAdmin(User))
            {
                return Forbid();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validate dates
            if (announcementCreateDto.StartDate > announcementCreateDto.EndDate && announcementCreateDto.EndDate.HasValue)
            {
                ModelState.AddModelError("EndDate", "End date must be after start date");
                return BadRequest(ModelState);
            }

            // Calculate if announcement is active based on start and end dates
            var now = DateTime.UtcNow;
            bool isActive = announcementCreateDto.StartDate <= now && 
                           (!announcementCreateDto.EndDate.HasValue || announcementCreateDto.EndDate.Value > now);

            // Create announcement entity
            var announcement = new Announcement
            {
                Title = announcementCreateDto.Title,
                Content = announcementCreateDto.Content,
                StartDate = announcementCreateDto.StartDate,
                EndDate = announcementCreateDto.EndDate,
                IsActive = isActive
            };

            _context.Announcements.Add(announcement);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Announcement created: {AnnouncementId}", announcement.Id);

            return CreatedAtAction(nameof(GetAnnouncement), new { id = announcement.Id }, new { id = announcement.Id });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAnnouncement(int id, AnnouncementUpdateDto announcementUpdateDto)
        {
            // Check if user is admin
            if (!await _adminAuthService.IsAdmin(User))
            {
                return Forbid();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement == null)
            {
                return NotFound();
            }

            // Validate dates
            if (announcementUpdateDto.StartDate > announcementUpdateDto.EndDate && announcementUpdateDto.EndDate.HasValue)
            {
                ModelState.AddModelError("EndDate", "End date must be after start date");
                return BadRequest(ModelState);
            }

            // Calculate if announcement is active based on start and end dates
            var now = DateTime.UtcNow;
            bool isActive = announcementUpdateDto.StartDate <= now && 
                           (!announcementUpdateDto.EndDate.HasValue || announcementUpdateDto.EndDate.Value > now);

            // Update announcement properties
            announcement.Title = announcementUpdateDto.Title;
            announcement.Content = announcementUpdateDto.Content;
            announcement.StartDate = announcementUpdateDto.StartDate;
            announcement.EndDate = announcementUpdateDto.EndDate;
            announcement.IsActive = isActive;

            _context.Announcements.Update(announcement);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Announcement updated: {AnnouncementId}", announcement.Id);

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAnnouncement(int id)
        {
            // Check if user is admin
            if (!await _adminAuthService.IsAdmin(User))
            {
                return Forbid();
            }

            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement == null)
            {
                return NotFound();
            }

            _context.Announcements.Remove(announcement);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Announcement deleted: {AnnouncementId}", id);

            return NoContent();
        }
    }
}
