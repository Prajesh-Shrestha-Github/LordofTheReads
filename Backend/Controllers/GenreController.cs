using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LordofTheReads.Database;
using LordofTheReads.Database.Entities;
using System.Text.Json;
using System.Linq;

namespace LordofTheReads.Controllers
{
    [ApiController]
    [Route("api/genres")]
    public class GenreController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<GenreController> _logger;

        public GenreController(AppDbContext context, ILogger<GenreController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/genres
        [HttpGet]
        public ActionResult GetAllGenres()
        {
            try
            {
                var genres = _context.Genres.Select(g => new { g.Id, g.Name }).ToList();
                return Ok(genres);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting genres: {Message}", ex.Message);
                return StatusCode(500, new { message = "An error occurred while retrieving genres.", error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        // GET: api/genres/5
        [HttpGet("{id}")]
        public ActionResult GetGenre(int id)
        {
            try
            {
                // Return a hardcoded item for testing
                var genre = new { Id = id, Name = "Test Genre" };
                return Ok(genre);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting genre {Id}: {Message}", id, ex.Message);
                return StatusCode(500, new { message = "An error occurred while retrieving the genre.", error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        // POST: api/genres
        [HttpPost]
        public ActionResult CreateGenre([FromBody] JsonElement body)
        {
            try
            {
                // Just return success for testing
                return CreatedAtAction(nameof(GetGenre), new { id = 999 }, new { Id = 999, Name = "New Genre" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating genre: {Message}", ex.Message);
                return StatusCode(500, new { message = "An error occurred while creating the genre.", error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        // PUT: api/genres/5
        [HttpPut("{id}")]
        public ActionResult UpdateGenre(int id, [FromBody] JsonElement body)
        {
            try
            {
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating genre {Id}: {Message}", id, ex.Message);
                return StatusCode(500, new { message = "An error occurred while updating the genre.", error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        // DELETE: api/genres/5
        [HttpDelete("{id}")]
        public ActionResult DeleteGenre(int id)
        {
            try
            {
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting genre {Id}: {Message}", id, ex.Message);
                return StatusCode(500, new { message = "An error occurred while deleting the genre.", error = ex.Message, stackTrace = ex.StackTrace });
            }
        }
    }
}
