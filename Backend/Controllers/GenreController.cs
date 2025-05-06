using LordofTheReads.Database;
using LordofTheReads.Database.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        [HttpGet]
        public async Task<IActionResult> GetGenres()
        {
            try
            {
                var genres = await _context.Genres
                    .Select(g => new
                    {
                        id = g.Id,
                        name = g.Name
                    })
                    .OrderBy(g => g.name)
                    .ToListAsync();

                return Ok(genres);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting genres: {Message}", ex.Message);
                return StatusCode(500, new { message = "An error occurred while retrieving genres." });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetGenre(int id)
        {
            try
            {
                var genre = await _context.Genres
                    .Where(g => g.Id == id)
                    .Select(g => new
                    {
                        id = g.Id,
                        name = g.Name
                    })
                    .FirstOrDefaultAsync();

                if (genre == null)
                {
                    return NotFound();
                }

                return Ok(genre);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting genre {Id}: {Message}", id, ex.Message);
                return StatusCode(500, new { message = "An error occurred while retrieving the genre." });
            }
        }
    }
}
