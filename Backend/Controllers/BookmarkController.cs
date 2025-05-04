using LordofTheReads.Database;
using LordofTheReads.Database.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LordofTheReads.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookmarkController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<BookmarkController> _logger;

        public BookmarkController(AppDbContext context, ILogger<BookmarkController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Get all bookmarks for the current user
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Bookmark>>> GetBookmarks()
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var bookmarks = await _context.Bookmarks
                .Where(b => b.UserId == userId)
                .Include(b => b.Book)
                .ToListAsync();

            return Ok(bookmarks);
        }

        // Add a bookmark
        [HttpPost("{bookId}")]
        [Authorize]
        public async Task<ActionResult> AddBookmark(int bookId)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var book = await _context.Books.FindAsync(bookId);
            if (book == null) return NotFound("Book not found");

            var existingBookmark = await _context.Bookmarks
                .FirstOrDefaultAsync(b => b.UserId == userId && b.BookId == bookId);

            if (existingBookmark != null)
            {
                return Ok(); // Already bookmarked
            }

            var bookmark = new Bookmark
            {
                UserId = userId,
                BookId = bookId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Bookmarks.Add(bookmark);
            await _context.SaveChangesAsync();

            return Ok();
        }

        // Remove a bookmark
        [HttpDelete("{bookId}")]
        [Authorize]
        public async Task<ActionResult> RemoveBookmark(int bookId)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var bookmark = await _context.Bookmarks
                .FirstOrDefaultAsync(b => b.UserId == userId && b.BookId == bookId);

            if (bookmark == null) return NotFound("Bookmark not found");

            _context.Bookmarks.Remove(bookmark);
            await _context.SaveChangesAsync();

            return Ok();
        }

        // Check if a book is bookmarked
        [HttpGet("check/{bookId}")]
        [Authorize]
        public async Task<ActionResult<bool>> IsBookmarked(int bookId)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var bookmark = await _context.Bookmarks
                .AnyAsync(b => b.UserId == userId && b.BookId == bookId);

            return Ok(bookmark);
        }

        // Clear all bookmarks
        [HttpDelete]
        [Authorize]
        public async Task<ActionResult> ClearBookmarks()
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var bookmarks = await _context.Bookmarks
                .Where(b => b.UserId == userId)
                .ToListAsync();

            _context.Bookmarks.RemoveRange(bookmarks);
            await _context.SaveChangesAsync();

            return Ok();
        }

        // Helper method to get the current user ID
        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }
            return 0;
        }
    }
}