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

        [HttpGet("getallbooks")]
        public async Task<IActionResult> GetBooks()
        {
            try
            {
                var books = await _context.Books
                    .Include(b => b.BookAuthors)
                        .ThenInclude(ba => ba.Author)
                    .Include(b => b.BookGenres)
                        .ThenInclude(bg => bg.Genre)
                    .Select(b => new
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
                        CreatedAt = b.CreatedAt,
                        UpdatedAt = b.UpdatedAt,
                        Authors = b.BookAuthors.Select(ba => ba.Author.Name).ToList(),
                        Genres = b.BookGenres.Select(bg => bg.Genre.Name).ToList(),
                        // Average Rating from reviews (if available)
                        Rating = b.Reviews.Any() ? Math.Round(b.Reviews.Average(r => r.Rating), 1) : 0.0
                    })
                    .ToListAsync();

                return Ok(books);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching books", error = ex.Message });
            }
        }


        [HttpGet("search")]
        public async Task<IActionResult> SearchBooks(
             string? query,
             string? sort = "title_asc",
             int page = 1,
             int pageSize = 12,
             string? author = null,
             string? genre = null,
             string? language = null,
             string? format = null,
             string? publisher = null,
             string? availability = null, // "stockOnly", "physicalOnly"
             decimal? minPrice = null,
             decimal? maxPrice = null,
             double? minRating = null
 )
            {
                try
                {
                    if (page < 1 || pageSize < 1)
                        return BadRequest(new { message = "Invalid pagination parameters." });

                    var booksQuery = _context.Books
                        .Include(b => b.BookAuthors)
                            .ThenInclude(ba => ba.Author)
                        .Include(b => b.BookGenres)
                            .ThenInclude(bg => bg.Genre)
                        .Include(b => b.Reviews)
                        .AsQueryable();

                    // ?? Search by title, ISBN, or description
                    if (!string.IsNullOrWhiteSpace(query))
                    {
                        var loweredQuery = query.ToLower();
                        booksQuery = booksQuery.Where(b =>
                            (!string.IsNullOrEmpty(b.Title) && b.Title.ToLower().Contains(loweredQuery)) ||
                            (!string.IsNullOrEmpty(b.ISBN) && b.ISBN.ToLower().Contains(loweredQuery)) ||
                            (!string.IsNullOrEmpty(b.Description) && b.Description.ToLower().Contains(loweredQuery))
                        );
                    }
                // ?? Filters

                if (!string.IsNullOrEmpty(author))
                {
                    // Parse to int first
                    if (int.TryParse(author, out int authorId))
                    {
                        booksQuery = booksQuery.Where(b =>
                            b.BookAuthors.Any(a => a.Author.Id == authorId));
                    }
                }

                if (!string.IsNullOrEmpty(genre))
                {
                    if (int.TryParse(genre, out int genreId))
                    {
                        booksQuery = booksQuery.Where(b =>
                            b.BookGenres.Any(g => g.Genre.Id == genreId));
                    }
                }

                if (!string.IsNullOrEmpty(language))
                {
                    booksQuery = booksQuery.Where(b =>
                        b.Language != null && b.Language.ToLower() == language.ToLower());
                }

                if (!string.IsNullOrEmpty(format))
                {
                    booksQuery = booksQuery.Where(b =>
                        b.Format != null && b.Format.ToLower().Contains(format.ToLower()));
                }

                if (!string.IsNullOrEmpty(publisher))
                {
                    if (int.TryParse(publisher, out int publisherId))
                    {
                        booksQuery = booksQuery.Where(b =>
                            b.Publisher != null && b.Publisher.ToLower().Contains(publisherId.ToString()));
                        // Ideally, you should match `PublisherId`, not name string.
                        // But your Book entity uses `Publisher` as string — update if needed.
                    }
                }

                if (availability == "stockOnly")
                {
                    booksQuery = booksQuery.Where(b => b.StockQuantity > 0);
                }

                if (availability == "physicalOnly")
                {
                    booksQuery = booksQuery.Where(b => b.PhysicalLibraryAccess == true);
                }

                if (minPrice.HasValue)
                {
                    booksQuery = booksQuery.Where(b => b.Price >= minPrice.Value);
                }

                if (maxPrice.HasValue)
                {
                    booksQuery = booksQuery.Where(b => b.Price <= maxPrice.Value);
                }

                if (minRating.HasValue)
                {
                    booksQuery = booksQuery.Where(b =>
                        b.Reviews.Any() && b.Reviews.Average(r => r.Rating) >= minRating.Value);
                }


                // ?? Sorting
                booksQuery = sort?.ToLower() switch
                    {
                        "title_desc" => booksQuery.OrderByDescending(b => b.Title),
                        "date_asc" => booksQuery.OrderBy(b => b.PublicationDate),
                        "date_desc" => booksQuery.OrderByDescending(b => b.PublicationDate),
                        "price_asc" => booksQuery.OrderBy(b => b.Price),
                        "price_desc" => booksQuery.OrderByDescending(b => b.Price),
                        "popularity" => booksQuery.OrderByDescending(b => b.Reviews.Count),
                        _ => booksQuery.OrderBy(b => b.Title),
                    };

                    // ?? Pagination
                    var totalCount = await booksQuery.CountAsync();
                    var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                    var books = await booksQuery
                        .Skip((page - 1) * pageSize)
                        .Take(pageSize)
                        .Select(b => new
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
                            CreatedAt = b.CreatedAt,
                            UpdatedAt = b.UpdatedAt,
                            Authors = b.BookAuthors.Select(ba => ba.Author.Name).ToList(),
                            Genres = b.BookGenres.Select(bg => bg.Genre.Name).ToList(),
                            Rating = b.Reviews.Any() ? Math.Round(b.Reviews.Average(r => r.Rating), 1) : 0.0
                        })
                        .ToListAsync();

                    return Ok(new
                    {
                        page,
                        pageSize,
                        totalCount,
                        totalPages,
                        books
                    });
                }
                catch (Exception ex)
                {
                    return StatusCode(500, new { message = "An error occurred while retrieving books.", error = ex.Message });
                }
            }




    }
}
