using LordofTheReads.Database;
using LordofTheReads.Database.Entities;
using LordofTheReads.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace LordofTheReads.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BookmarkController : ControllerBase
    {
        private readonly IBookmarkService _bookmarkService;

        public BookmarkController(IBookmarkService bookmarkService)
        {
            _bookmarkService = bookmarkService;
        }

        // GET: api/Bookmark
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Bookmark>>> GetBookmarks()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized("User ID claim not found in token");
                }

                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return BadRequest("Invalid user ID format in token");
                }

                var bookmarks = await _bookmarkService.GetBookmarksAsync(userId);
                return Ok(bookmarks);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"BookmarkController.GetBookmarks error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/Bookmark/{bookId}
        [HttpPost("{bookId}")]
        public async Task<ActionResult<Bookmark>> AddBookmark(int bookId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized("User ID claim not found in token");
                }

                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return BadRequest("Invalid user ID format in token");
                }

                var bookmark = await _bookmarkService.AddBookmarkAsync(userId, bookId);
                return CreatedAtAction(nameof(GetBookmarks), new { id = bookmark.Id }, bookmark);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"BookmarkController.AddBookmark error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/Bookmark/{bookId}
        [HttpDelete("{bookId}")]
        public async Task<IActionResult> RemoveBookmark(int bookId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized("User ID claim not found in token");
                }

                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return BadRequest("Invalid user ID format in token");
                }

                await _bookmarkService.RemoveBookmarkAsync(userId, bookId);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"BookmarkController.RemoveBookmark error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/Bookmark/check/{bookId}
        [HttpGet("check/{bookId}")]
        public async Task<ActionResult<bool>> IsBookmarked(int bookId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized("User ID claim not found in token");
                }

                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return BadRequest("Invalid user ID format in token");
                }

                var isBookmarked = await _bookmarkService.IsBookmarkedAsync(userId, bookId);
                return Ok(isBookmarked);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"BookmarkController.IsBookmarked error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/Bookmark
        [HttpDelete]
        public async Task<IActionResult> ClearBookmarks()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized("User ID claim not found in token");
                }

                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return BadRequest("Invalid user ID format in token");
                }

                await _bookmarkService.ClearBookmarksAsync(userId);
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"BookmarkController.ClearBookmarks error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}