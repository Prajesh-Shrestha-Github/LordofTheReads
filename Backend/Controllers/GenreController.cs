using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LordofTheReads.Database;
using LordofTheReads.Database.Entities;
using LordofTheReads.DTOs;

namespace LordofTheReads.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GenreController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GenreController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/genre
        [HttpGet]
        public async Task<IActionResult> GetAllGenres()
        {
            var genres = await _context.Genres
                .Include(g => g.BookGenres)
                    .ThenInclude(bg => bg.Book)
                .ToListAsync();

            var genreDtos = genres.Select(g => new GenreDto
            {
                Id = g.Id,
                Name = g.Name,
                BookTitles = g.BookGenres.Select(bg => bg.Book.Title).ToList()
            });

            return Ok(genreDtos);
        }

        // GET: api/genre/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetGenre(int id)
        {
            var genre = await _context.Genres
                .Include(g => g.BookGenres)
                    .ThenInclude(bg => bg.Book)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (genre == null)
                return NotFound();

            var dto = new GenreDto
            {
                Id = genre.Id,
                Name = genre.Name,
                BookTitles = genre.BookGenres.Select(bg => bg.Book.Title).ToList()
            };

            return Ok(dto);
        }

        // POST: api/genre
        [HttpPost]
        public async Task<IActionResult> CreateGenre([FromBody] CreateGenreDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var genre = new Genre
            {
                Name = dto.Name
            };

            _context.Genres.Add(genre);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGenre), new { id = genre.Id }, new GenreDto
            {
                Id = genre.Id,
                Name = genre.Name
            });
        }

        // PUT: api/genre/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGenre(int id, [FromBody] UpdateGenreDto dto)
        {
            if (id != dto.Id)
                return BadRequest("Genre ID mismatch");

            var genre = await _context.Genres.FindAsync(id);
            if (genre == null)
                return NotFound();

            genre.Name = dto.Name;
            _context.Genres.Update(genre);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/genre/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGenre(int id)
        {
            var genre = await _context.Genres.FindAsync(id);
            if (genre == null)
                return NotFound();

            _context.Genres.Remove(genre);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
