using System.Security.Claims;
using LordofTheReads.Database;
using LordofTheReads.Database.Entities;
using LordofTheReads.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LordofTheReads.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReviewsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Reviews/user
        [HttpGet("user")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<object>>> GetUserReviews()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var reviews = await _context.Reviews
                .Where(r => r.UserId == userId)
                .Include(r => r.Book)
                    .ThenInclude(b => b.BookAuthors)
                        .ThenInclude(ba => ba.Author)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    r.Rating,
                    r.Comment,
                    r.CreatedAt,
                    Book = new
                    {
                        r.Book.Id,
                        r.Book.Title,
                        r.Book.ImageUrl,
                        r.Book.Price,
                        Authors = r.Book.BookAuthors.Select(ba => new
                        {
                            ba.Author.Id,
                            Name = ba.Author.Name
                        }).ToList()
                    }
                })
                .ToListAsync();

            return Ok(reviews);
        }
        
        // PUT: api/Reviews/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] UpdateReviewDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
                
            if (review == null)
            {
                return NotFound("Review not found or you don't have permission to edit it.");
            }
            
            // Update properties
            review.Rating = dto.Rating;
            review.Comment = dto.Comment;
            
            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while updating the review: {ex.Message}");
            }
        }

        // DELETE: api/Reviews/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
                
            if (review == null)
            {
                return NotFound("Review not found or you don't have permission to delete it.");
            }
            
            _context.Reviews.Remove(review);
            
            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while deleting the review: {ex.Message}");
            }
        }
    }
}
