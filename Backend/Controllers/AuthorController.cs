using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LordofTheReads.Database;
using LordofTheReads.Database.Entities;
using LordofTheReads.DTOs;

namespace LordofTheReads.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthorController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthorController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/author
        [HttpGet]
        public async Task<IActionResult> GetAllAuthors()
        {
            var authors = await _context.Authors
                .Include(a => a.BookAuthors)
                    .ThenInclude(ba => ba.Book)
                .ToListAsync();

            var authorDtos = authors.Select(a => new AuthorDto
            {
                Id = a.Id,
                Name = a.Name,
                BookTitles = a.BookAuthors.Select(ba => ba.Book.Title).ToList()
            });

            return Ok(authorDtos);
        }

        // GET: api/author/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAuthor(int id)
        {
            var author = await _context.Authors
                .Include(a => a.BookAuthors)
                    .ThenInclude(ba => ba.Book)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (author == null)
                return NotFound();

            var dto = new AuthorDto
            {
                Id = author.Id,
                Name = author.Name,
                BookTitles = author.BookAuthors.Select(ba => ba.Book.Title).ToList()
            };

            return Ok(dto);
        }

        // POST: api/author
        [HttpPost]
        public async Task<IActionResult> CreateAuthor([FromBody] CreateAuthorDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var author = new Author { Name = dto.Name };

            _context.Authors.Add(author);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAuthor), new { id = author.Id }, new AuthorDto
            {
                Id = author.Id,
                Name = author.Name
            });
        }

        // PUT: api/author/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAuthor(int id, [FromBody] UpdateAuthorDto dto)
        {
            if (id != dto.Id)
                return BadRequest("ID mismatch");

            var author = await _context.Authors.FindAsync(id);
            if (author == null)
                return NotFound();

            author.Name = dto.Name;

            _context.Authors.Update(author);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/author/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAuthor(int id)
        {
            var author = await _context.Authors.FindAsync(id);
            if (author == null)
                return NotFound();

            _context.Authors.Remove(author);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
