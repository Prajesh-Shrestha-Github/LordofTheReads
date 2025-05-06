using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LordofTheReads.Database;
using LordofTheReads.Database.Entities;
using System.Text.Json;
using System.Linq;

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

        // GET: api/authors
        [HttpGet]
        public ActionResult GetAllAuthors()
        {
            try
            {
                var authors = _context.Authors.Select(a => new { a.Id, a.Name }).ToList();
                return Ok(authors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting authors: {Message}", ex.Message);
                return StatusCode(500, new { message = "An error occurred while retrieving authors.", error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        // GET: api/authors/5
        [HttpGet("{id}")]
        public ActionResult GetAuthor(int id)
        {
            try
            {
                // Return a hardcoded item for testing
                var author = new { Id = id, Name = "Test Author" };
                return Ok(author);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting author {Id}: {Message}", id, ex.Message);
                return StatusCode(500, new { message = "An error occurred while retrieving the author.", error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        // POST: api/authors
        [HttpPost]
        public ActionResult CreateAuthor([FromBody] JsonElement body)
        {
            try
            {
                // Just return success for testing
                return CreatedAtAction(nameof(GetAuthor), new { id = 999 }, new { Id = 999, Name = "New Author" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating author: {Message}", ex.Message);
                return StatusCode(500, new { message = "An error occurred while creating the author.", error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        // PUT: api/authors/5
        [HttpPut("{id}")]
        public ActionResult UpdateAuthor(int id, [FromBody] JsonElement body)
        {
            try
            {
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating author {Id}: {Message}", id, ex.Message);
                return StatusCode(500, new { message = "An error occurred while updating the author.", error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        // DELETE: api/authors/5
        [HttpDelete("{id}")]
        public ActionResult DeleteAuthor(int id)
        {
            try
            {
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting author {Id}: {Message}", id, ex.Message);
                return StatusCode(500, new { message = "An error occurred while deleting the author.", error = ex.Message, stackTrace = ex.StackTrace });
            }
        }
    }
}
