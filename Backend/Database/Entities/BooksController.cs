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

        [HttpGet]
        public async Task<IActionResult> GetBooks(
            string? search = null,
            string? category = "all",
            string? priceRange = "all",
            string? rating = "all",
            string? sortBy = "popularity",
            int page = 1,
            int pageSize = 12)
        {
            // Start with all books
            var query = _context.Books.AsQueryable();

            // 1. Search by title or description
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(b =>
                    b.Title.Contains(search) ||
                    b.Description.Contains(search));
            }

            // 2. Filter by category
            if (!string.Equals(category, "all", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(b => b.Category == category);
            }

            // 3. Filter by price range
            switch (priceRange)
            {
                case "under-10":
                    query = query.Where(b => b.Price < 10);
                    break;
                case "10-20":
                    query = query.Where(b => b.Price >= 10 && b.Price < 20);
                    break;
                case "20-30":
                    query = query.Where(b => b.Price >= 20 && b.Price < 30);
                    break;
                case "over-30":
                    query = query.Where(b => b.Price >= 30);
                    break;
            }

            // 4. Filter by rating
            if (!string.Equals(rating, "all", StringComparison.OrdinalIgnoreCase))
            {
                if (int.TryParse(rating.Split('-')[0], out int minRating))
                {
                    query = query.Where(b => b.Rating >= minRating);
                }
            }

            // 5. Sorting
            query = sortBy switch
            {
                "price-low" => query.OrderBy(b => b.Price),
                "price-high" => query.OrderByDescending(b => b.Price),
                "newest" => query.OrderByDescending(b => b.PublicationDate),
                "rating" => query.OrderByDescending(b => b.Rating),
                _ => query.OrderBy(b => b.Title), // Default sort (popularity)
            };

            // 6. Get total count before pagination
            var totalCount = await query.CountAsync();

            // 7. Apply pagination
            var books = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // 8. Return paged result with total count
            return Ok(new
            {
                Items = books,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }

        // GET api/books/5
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
