using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LordofTheReads.Database;
using LordofTheReads.Database.Entities;
using LordofTheReads.Services;
using LordofTheReads.DTOs;
using LordofTheReads.DTOs.Book;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace LordofTheReads.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IBookService _bookService;

        public BooksController(AppDbContext context, IBookService bookService)
        {
            _context = context;
            _bookService = bookService;
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
            try
            {
                var book = await _bookService.GetBookByIdAsync(id);
                if (book == null)
                    return NotFound();

                return Ok(book);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("filtered")]
        public async Task<IActionResult> FilterBooks(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12,
            [FromQuery] string? category = null, 
            [FromQuery] string? priceRange = null,
            [FromQuery] int? minRating = null,
            [FromQuery] bool? inStock = null,
            [FromQuery] bool? onSale = null,
            [FromQuery] bool? physicalLibraryAccess = null,
            [FromQuery] string? language = null,
            [FromQuery] string? publisher = null,
            [FromQuery] string? searchQuery = null,
            [FromQuery] string? categoryTab = null,
            [FromQuery] bool? isNewRelease = null,
            [FromQuery] bool? isNewArrival = null,
            [FromQuery] bool? isComingSoon = null,
            [FromQuery] string? sortBy = null)
        {
            try
            {
                // Log the received parameters for debugging
                Console.WriteLine($"Received filter parameters: page={page}, pageSize={pageSize}, category={category}, priceRange={priceRange}, sortBy={sortBy}");
                
                // Create filter object manually from query parameters
                var filter = new BookFilterDTO
                {
                    Page = page,
                    PageSize = pageSize,
                    Category = category,
                    PriceRange = priceRange,
                    MinRating = minRating,
                    InStock = inStock,
                    OnSale = onSale,
                    PhysicalLibraryAccess = physicalLibraryAccess,
                    Language = language,
                    Publisher = publisher,
                    SearchQuery = searchQuery,
                    CategoryTab = categoryTab,
                    IsNewRelease = isNewRelease,
                    IsNewArrival = isNewArrival,
                    IsComingSoon = isComingSoon,
                    SortBy = sortBy
                };
                
                // Validate pagination parameters
                if (filter.Page < 1) filter.Page = 1;
                if (filter.PageSize < 1) filter.PageSize = 12;
                if (filter.PageSize > 50) filter.PageSize = 50;
                
                var (books, totalCount) = await _bookService.FilterBooksAsync(filter);
                
                return Ok(new {
                    books,
                    totalCount,
                    pageSize = filter.PageSize,
                    currentPage = filter.Page,
                    totalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize)
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in FilterBooks: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpGet("categories")]
        public IActionResult GetCategories()
        {
            try
            {
                var categories = new[]
                {
                    "all-books",
                    "bestsellers",
                    "award-winners",
                    "new-releases",
                    "new-arrivals",
                    "coming-soon",
                    "deals"
                };

                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
        
        [HttpGet("filter/simple")]
        public async Task<IActionResult> SimpleFilterBooks(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12,
            [FromQuery] string? category = null,
            [FromQuery] string? searchQuery = null,
            [FromQuery] string? sortBy = null)
        {
            try
            {
                Console.WriteLine($"Simple filter called with: page={page}, pageSize={pageSize}, category={category}, searchQuery={searchQuery}, sortBy={sortBy}");
                
                var query = _context.Books.AsQueryable();
                
                // Include necessary navigation properties
                query = query
                    .Include(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
                    .Include(b => b.Discounts)
                    .Include(b => b.BookGenres)
                    .ThenInclude(bg => bg.Genre)
                    .Include(b => b.Reviews);
                
                // Apply category filter
                if (!string.IsNullOrEmpty(category) && category.ToLower() != "all")
                {
                    query = query.Where(b => b.BookGenres.Any(bg => bg.Genre.Name.ToLower() == category.ToLower()));
                }
                
                // Apply search query
                if (!string.IsNullOrEmpty(searchQuery))
                {
                    var search = searchQuery.ToLower();
                    query = query.Where(b => 
                        (b.Title != null && b.Title.ToLower().Contains(search)) ||
                        (b.Description != null && b.Description.ToLower().Contains(search)) ||
                        b.BookAuthors.Any(ba => ba.Author.Name.ToLower().Contains(search)));
                }
                
                // Apply sorting
                query = sortBy switch
                {
                    "price_asc" => query.OrderBy(b => b.Price),
                    "price_desc" => query.OrderByDescending(b => b.Price),
                    "date_desc" => query.OrderByDescending(b => b.PublicationDate),
                    "rating" => query.OrderByDescending(b => b.Reviews.Any() ? b.Reviews.Average(r => r.Rating) : 0),
                    "popularity" => query.OrderByDescending(b => b.OrderItems.Count()),
                    _ => query.OrderBy(b => b.Title)
                };
                
                // Get total count before pagination
                var totalCount = await query.CountAsync();
                
                // Apply pagination
                var pagedBooks = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(b => new BookDto
                    {
                        Id = b.Id,
                        Title = b.Title ?? "Unknown Title",
                        ISBN = b.ISBN,
                        Description = b.Description,
                        Price = b.Price,
                        PublicationDate = b.PublicationDate,
                        StockQuantity = b.StockQuantity,
                        Publisher = b.Publisher,
                        Language = b.Language,
                        Format = b.Format,
                        PhysicalLibraryAccess = b.PhysicalLibraryAccess,
                        ImageUrl = b.ImageUrl ?? "https://placehold.co/300x450?text=No+Cover",
                        Authors = b.BookAuthors.Select(ba => ba.Author.Name).ToList(),
                        DiscountPercentage = b.Discounts.Where(d => d.OnSaleFlag).Select(d => d.DiscountPercentage).FirstOrDefault(),
                        OnSaleFlag = b.Discounts.Any(d => d.OnSaleFlag),
                        Genres = b.BookGenres.Select(bg => bg.Genre.Name).ToList(),
                        Rating = b.Reviews.Any() ? (decimal)b.Reviews.Average(r => r.Rating) : 0m,
                        ReviewCount = b.Reviews.Count()
                    })
                    .ToListAsync();
                
                return Ok(new {
                    books = pagedBooks,
                    totalCount,
                    pageSize,
                    currentPage = page,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SimpleFilterBooks: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpGet("formats")]
        public async Task<IActionResult> GetFormats()
        {
            try
            {
                var formats = await _context.Books
                    .Where(b => b.Format != null)
                    .Select(b => b.Format)
                    .Distinct()
                    .ToListAsync();

                return Ok(formats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("languages")]
        public async Task<IActionResult> GetLanguages()
        {
            try
            {
                var languages = await _context.Books
                    .Where(b => b.Language != null)
                    .Select(b => b.Language)
                    .Distinct()
                    .ToListAsync();

                return Ok(languages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("publishers")]
        public async Task<IActionResult> GetPublishers()
        {
            try
            {
                var publishers = await _context.Books
                    .Where(b => b.Publisher != null)
                    .Select(b => b.Publisher)
                    .Distinct()
                    .ToListAsync();

                return Ok(publishers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("can-review/{bookId:int}")]
        [Authorize]
        public async Task<IActionResult> CanReview(int bookId)
        {
            // 1) get the current user ID from the JWT
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            // 2) see if any of their Orders contains that book
            var hasPurchased = await _context.OrderItems
                .Where(oi => oi.BookId == bookId)
                .Join(
                  _context.Orders,
                  oi => oi.OrderId,
                  o => o.Id,
                  (oi, o) => new { oi, o }
                )
                .AnyAsync(x => x.o.UserId == userId);

            // 3) return { canReview: true/false }
            return Ok(new { canReview = hasPurchased });
        }

        [HttpPost("{bookId:int}/reviews")]
        [Authorize]
        public async Task<IActionResult> PostReview(int bookId, [FromBody] CreateReviewRequestDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var hasPurchased = await (
                from oi in _context.OrderItems
                join o in _context.Orders on oi.OrderId equals o.Id
                where oi.BookId == bookId && o.UserId == userId
                select oi
            ).AnyAsync();
            if (!hasPurchased) return Forbid("You can only review books you’ve purchased.");

            var exists = await _context.Reviews.AnyAsync(r => r.UserId == userId && r.BookId == bookId);
            if (exists) return BadRequest("You’ve already reviewed this book.");

            var review = new Review
            {
                UserId = userId,
                BookId = bookId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetReviewById),
                new { id = review.Id },
                review);
        }

        // GET api/books/reviews/{id}
        [HttpGet("reviews/{id:int}")]
        public async Task<IActionResult> GetReviewById(int id)
        {
            var r = await _context.Reviews.FindAsync(id);
            if (r == null) return NotFound();
            return Ok(r);
        }

        [HttpGet("{bookId:int}/reviews")]
        public async Task<IActionResult> GetReviewsForBook(int bookId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.BookId == bookId)
                .Include(r => r.User)   
                .Select(r => new CreateReviewDto
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    UserName = r.User.Username
                })
                .ToListAsync();

            return Ok(reviews);
        }
    }
}
