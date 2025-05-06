using LordofTheReads.Database;
using LordofTheReads.Database.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LordofTheReads.Controllers
{
    [ApiController]
    [Route("api/authors")]
    public class AuthorController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<AuthorController> _logger;

        public AuthorController(AppDbContext context, ILogger<AuthorController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAuthors()
        {
            try
            {
                var authors = await _context.Authors
                    .Select(a => new
                    {
                        id = a.Id,
                        name = a.Name
                    })
                    .OrderBy(a => a.name)
                    .ToListAsync();

                return Ok(authors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting authors: {Message}", ex.Message);
                return StatusCode(500, new { message = "An error occurred while retrieving authors." });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAuthor(int id)
        {
            try
            {
                var author = await _context.Authors
                    .Where(a => a.Id == id)
                    .Select(a => new
                    {
                        id = a.Id,
                        name = a.Name
                    })
                    .FirstOrDefaultAsync();

                if (author == null)
                {
                    return NotFound();
                }

                return Ok(author);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting author {Id}: {Message}", id, ex.Message);
                return StatusCode(500, new { message = "An error occurred while retrieving the author." });
            }
        }
    }
}
