using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LordofTheReads.Database;
using LordofTheReads.Database.Entities;

namespace LordofTheReads.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BooksController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchBooks(string? query, string? sort = "title_asc")
        {
            var books = _context.Books.AsQueryable();

            if (!string.IsNullOrEmpty(query))
                books = books.Where(b => (b.Title != null && b.Title.Contains(query)) || 
                                         (b.Description != null && b.Description.Contains(query)));

            books = sort switch
            {
                "title_desc" => books.OrderByDescending(b => b.Title),
                "price_asc" => books.OrderBy(b => b.Price),
                "price_desc" => books.OrderByDescending(b => b.Price),
                _ => books.OrderBy(b => b.Title),
            };

            return Ok(await books.ToListAsync());
        }

        [HttpGet]
        public async Task<IActionResult> GetBooks(int page = 1, int pageSize = 10)
        {
            var books = await _context.Books
                .OrderBy(b => b.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(books);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetBook(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
                return NotFound();

            return Ok(book);
        }
    }
}
