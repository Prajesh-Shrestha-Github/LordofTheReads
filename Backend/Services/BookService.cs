// Backend/Services/BookService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using LordofTheReads.Database;
using LordofTheReads.DTOs.Book;
using LordofTheReads.DTOs;
using Microsoft.Extensions.Logging;
using LordofTheReads.Database.Entities;

namespace LordofTheReads.Services
{
    public class BookService : IBookService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<BookService> _logger;

        public BookService(AppDbContext context, ILogger<BookService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<BookDto>> GetBooksAsync()
        {
            try
            {
                var now = DateTime.UtcNow;
                // Include BookAuthors, BookGenres and their related entities
                var books = await _context.Books
                    .Include(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
                    .Include(b => b.Discounts)
                    .Include(b => b.BookGenres)
                    .ThenInclude(bg => bg.Genre)
                    .Include(b => b.Reviews)
                    .Include(b => b.OrderItems)
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
                        IsAwardWinning = b.IsAwardWinning,
                        // Use the actual image URL if it exists
                        ImageUrl = b.ImageUrl ?? "https://placehold.co/300x450?text=No+Cover",
                        CreatedAt = b.CreatedAt,
                        UpdatedAt = b.UpdatedAt,
                        // Map author names from the navigation property
                        Authors = b.BookAuthors.Select(ba => ba.Author.Name).ToList(),
                        DiscountPercentage = b.Discounts.Where(d => d.OnSaleFlag).Select(d => d.DiscountPercentage).FirstOrDefault(),
                        OnSaleFlag = b.Discounts.Any(d => d.OnSaleFlag),
                        // Map genre names from the navigation property
                        Genres = b.BookGenres.Select(bg => bg.Genre.Name).ToList(),
                        // Number of reviews for the book
                        ReviewCount = b.Reviews.Count(),
                        // Number of times the book has been ordered (for popularity/bestseller sorting)
                        OrderCount = b.OrderItems.Count(),
                    })
                    .ToListAsync();

                _logger.LogInformation($"Successfully retrieved {books.Count()} books");
                return books;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetBooksAsync: {Message}", ex.Message);
                throw;
            }
        }

        public async Task<BookDto> GetBookByIdAsync(int id)
        {
            try
            {
                var now = DateTime.UtcNow;
                // First, get the book with all its related data
                var bookEntity = await _context.Books
                    .Include(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
                    .Include(b => b.Discounts)
                    .Include(b => b.BookGenres)
                    .ThenInclude(bg => bg.Genre)
                    .Include(b => b.Reviews)
                    .FirstOrDefaultAsync(b => b.Id == id);
                
                if (bookEntity == null)
                {
                    _logger.LogWarning($"Book with ID {id} not found");
                    return new BookDto();
                }
                
                // Log discount information
                _logger.LogInformation($"Book ID {id} has {bookEntity.Discounts.Count} discounts");
                foreach (var discount in bookEntity.Discounts)
                {
                    _logger.LogInformation($"Discount ID: {discount.Id}, OnSaleFlag: {discount.OnSaleFlag}, Percentage: {discount.DiscountPercentage}%");
                }
                
                // Map to DTO
                var book = new BookDto
                {
                    Id = bookEntity.Id,
                    Title = bookEntity.Title ?? "Unknown Title",
                    ISBN = bookEntity.ISBN,
                    Description = bookEntity.Description,
                    Price = bookEntity.Price,
                    PublicationDate = bookEntity.PublicationDate,
                    StockQuantity = bookEntity.StockQuantity,
                    Publisher = bookEntity.Publisher,
                    Language = bookEntity.Language,
                    Format = bookEntity.Format,
                    PhysicalLibraryAccess = bookEntity.PhysicalLibraryAccess,
                    IsAwardWinning = bookEntity.IsAwardWinning,
                    // Use the actual image URL if it exists
                    ImageUrl = bookEntity.ImageUrl ?? "https://placehold.co/300x450?text=No+Cover",
                    CreatedAt = bookEntity.CreatedAt,
                    UpdatedAt = bookEntity.UpdatedAt,
                    // Map author names from the navigation property
                    Authors = bookEntity.BookAuthors.Select(ba => ba.Author.Name).ToList(),
                    DiscountPercentage = bookEntity.Discounts.Where(d => d.OnSaleFlag).Select(d => d.DiscountPercentage).FirstOrDefault(),
                    OnSaleFlag = bookEntity.Discounts.Any(d => d.OnSaleFlag),
                    // Map genre names from the navigation property
                    Genres = bookEntity.BookGenres.Select(bg => bg.Genre.Name).ToList(),
                    // Number of reviews for the book
                    ReviewCount = bookEntity.Reviews.Count(),
                };

                return book ?? new BookDto();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetBookByIdAsync: {Message}", ex.Message);
                throw;
            }
        }

        public async Task<(IEnumerable<BookDto> Books, int TotalCount)> FilterBooksAsync(BookFilterDTO filter)
        {
            try
            {
                // Log filter parameters for debugging
                _logger.LogInformation($"Filtering books with parameters: Page={filter.Page}, PageSize={filter.PageSize}, Category={filter.Category}, PriceRange={filter.PriceRange}, SortBy={filter.SortBy}");
                
                var query = _context.Books.AsQueryable();

                // Include necessary navigation properties
                query = query
                    .Include(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
                    .Include(b => b.Discounts)
                    .Include(b => b.BookGenres)
                    .ThenInclude(bg => bg.Genre)
                    .Include(b => b.Reviews);

                // Apply filters
                // 1. Category/Genre filter
                if (!string.IsNullOrEmpty(filter.Category) && filter.Category.ToLower() != "all")
                {
                    query = query.Where(b => b.BookGenres.Any(bg => bg.Genre.Name.ToLower() == filter.Category.ToLower()));
                }

                // 2. Multiple genres filter
                if (filter.Genres != null && filter.Genres.Any())
                {
                    var genreNames = filter.Genres.Select(g => g.ToLower()).ToList();
                    query = query.Where(b => b.BookGenres.Any(bg => genreNames.Contains(bg.Genre.Name.ToLower())));
                }

                // 3. Author filter
                if (filter.Authors != null && filter.Authors.Any())
                {
                    var authorNames = filter.Authors.Select(a => a.ToLower()).ToList();
                    query = query.Where(b => b.BookAuthors.Any(ba => authorNames.Contains(ba.Author.Name.ToLower())));
                }

                // 4. Price range filter
                if (!string.IsNullOrEmpty(filter.PriceRange))
                {
                    var parts = filter.PriceRange.Split('-');
                    if (parts.Length == 2 && decimal.TryParse(parts[0], out decimal minPrice) && decimal.TryParse(parts[1], out decimal maxPrice))
                    {
                        query = query.Where(b => b.Price >= minPrice && b.Price <= maxPrice);
                    }
                }
                else if (filter.MinPrice.HasValue)
                {
                    query = query.Where(b => b.Price >= filter.MinPrice.Value);
                }
                else if (filter.MaxPrice.HasValue)
                {
                    query = query.Where(b => b.Price <= filter.MaxPrice.Value);
                }

                // 5. Rating filter
                if (filter.MinRating.HasValue)
                {
                    // If both min and max rating are set AND they're equal, it's an exact star rating (like "4 stars exactly")
                    if (filter.MaxRating.HasValue && filter.MinRating.Value == filter.MaxRating.Value)
                    {
                        // Handle exact star rating (e.g., 4 stars means 4.0 to 4.99...)
                        int exactRating = filter.MinRating.Value;
                        query = query.Where(b => b.Reviews.Any() && 
                            b.Reviews.Average(r => r.Rating) >= exactRating && 
                            b.Reviews.Average(r => r.Rating) < exactRating + 1);
                    }
                    // If min and max are different, it's a custom range
                    else if (filter.MaxRating.HasValue)
                    {
                        query = query.Where(b => b.Reviews.Any() && 
                            b.Reviews.Average(r => r.Rating) >= filter.MinRating.Value && 
                            b.Reviews.Average(r => r.Rating) <= filter.MaxRating.Value);
                    }
                    // Otherwise it's a minimum rating filter (like "3 stars & up")
                    else
                    {
                        query = query.Where(b => b.Reviews.Any() && b.Reviews.Average(r => r.Rating) >= filter.MinRating.Value);
                    }
                }

                // 6. Stock filter
                if (filter.InStock.HasValue && filter.InStock.Value)
                {
                    query = query.Where(b => b.StockQuantity > 0);
                }

                // 7. Sale filter
                if (filter.OnSale.HasValue && filter.OnSale.Value)
                {
                    query = query.Where(b => b.Discounts.Any(d => d.OnSaleFlag));
                }

                // 8. Physical library access filter
                if (filter.PhysicalLibraryAccess.HasValue)
                {
                    query = query.Where(b => b.PhysicalLibraryAccess == filter.PhysicalLibraryAccess.Value);
                }

                // 9. Language filter
                if (!string.IsNullOrEmpty(filter.Language))
                {
                    query = query.Where(b => b.Language != null && b.Language.ToLower() == filter.Language.ToLower());
                }

                // 10. Format filter
                if (filter.Formats != null && filter.Formats.Any())
                {
                    var formats = filter.Formats.Select(f => f.ToLower()).ToList();
                    // Added debug logging
                    _logger.LogInformation($"Filtering by formats: {string.Join(", ", formats)}");
                    
                    // Use partial matching for formats (e.g., 'paperback' will match 'Trade Paperback')
                    query = query.Where(b => b.Format != null && formats.Any(f => b.Format.ToLower().Contains(f)));
                    
                    // Debug: Log all formats in the database
                    var allFormats = _context.Books.Where(b => b.Format != null).Select(b => b.Format).Distinct().ToList();
                    _logger.LogInformation($"Available formats in database: {string.Join(", ", allFormats)}");
                }

                // 11. Publisher filter
                if (!string.IsNullOrEmpty(filter.Publisher))
                {
                    query = query.Where(b => b.Publisher != null && b.Publisher.ToLower() == filter.Publisher.ToLower());
                }

                // 12. Search query filter (title, ISBN, description, and author names)
                if (!string.IsNullOrEmpty(filter.SearchQuery))
                {
                    var searchQuery = filter.SearchQuery.ToLower();
                    _logger.LogInformation($"Searching with query: {searchQuery}");
                    
                    query = query.Where(b => 
                        (b.Title != null && b.Title.ToLower().Contains(searchQuery)) ||
                        (b.ISBN != null && b.ISBN.ToLower().Contains(searchQuery)) ||
                        (b.Description != null && b.Description.ToLower().Contains(searchQuery)) ||
                        // Include search by author name
                        b.BookAuthors.Any(ba => ba.Author.Name.ToLower().Contains(searchQuery)));
                }

                // 13. Category tab filter
                if (!string.IsNullOrEmpty(filter.CategoryTab))
                {
                    switch (filter.CategoryTab.ToLower())
                    {
                        case "bestsellers":
                            // Assuming bestsellers have the most orders
                            query = query.OrderByDescending(b => b.OrderItems.Count()).Take(50);
                            break;
                        case "award-winners":
                            // Use the IsAwardWinning property to filter award-winning books
                            query = query.Where(b => b.IsAwardWinning);
                            break;
                        case "new-releases":
                            // Books published in the last 3 months, excluding upcoming books
                            var threeMonthsAgo = DateTime.UtcNow.AddMonths(-3);
                            var currentDate = DateTime.UtcNow;
                            query = query.Where(b => b.PublicationDate >= threeMonthsAgo && b.PublicationDate <= currentDate);
                            break;
                        case "new-arrivals":
                            // Books added to the catalog in the last month
                            var oneMonthAgo = DateTime.UtcNow.AddMonths(-1);
                            query = query.Where(b => b.CreatedAt >= oneMonthAgo);
                            break;
                        case "coming-soon":
                            // Books with future publication dates
                            var now = DateTime.UtcNow;
                            query = query.Where(b => b.PublicationDate > now);
                            break;
                        case "deals":
                            // Books on sale
                            query = query.Where(b => b.Discounts.Any(d => d.OnSaleFlag));
                            break;
                    }
                }

                // 14. New release filter
                if (filter.IsNewRelease.HasValue && filter.IsNewRelease.Value)
                {
                    var threeMonthsAgo = DateTime.UtcNow.AddMonths(-3);
                    var currentDate = DateTime.UtcNow;
                    query = query.Where(b => b.PublicationDate >= threeMonthsAgo && b.PublicationDate <= currentDate);
                }

                // 15. New arrival filter
                if (filter.IsNewArrival.HasValue && filter.IsNewArrival.Value)
                {
                    var oneMonthAgo = DateTime.UtcNow.AddMonths(-1);
                    query = query.Where(b => b.CreatedAt >= oneMonthAgo);
                }

                // 16. Coming soon filter
                if (filter.IsComingSoon.HasValue && filter.IsComingSoon.Value)
                {
                    var now = DateTime.UtcNow;
                    query = query.Where(b => b.PublicationDate > now);
                }
                
                // 17. Award-winning filter
                if (filter.IsAwardWinning.HasValue && filter.IsAwardWinning.Value)
                {
                    query = query.Where(b => b.IsAwardWinning);
                }

                // Apply sorting
                if (!string.IsNullOrEmpty(filter.SortBy))
                {
                    switch (filter.SortBy.ToLower())
                    {
                        case "title_asc":
                            query = query.OrderBy(b => b.Title);
                            break;
                        case "title_desc":
                            query = query.OrderByDescending(b => b.Title);
                            break;
                        case "price_asc":
                            query = query.OrderBy(b => b.Price);
                            break;
                        case "price_desc":
                            query = query.OrderByDescending(b => b.Price);
                            break;
                        case "date_desc":
                            query = query.OrderByDescending(b => b.PublicationDate);
                            break;
                        case "popularity":
                            // Assuming popularity is based on the number of orders
                            query = query.OrderByDescending(b => b.OrderItems.Count());
                            break;
                        case "rating":
                            // Order by average rating
                            query = query.OrderByDescending(b => b.Reviews.Any() ? b.Reviews.Average(r => r.Rating) : 0);
                            break;
                        default:
                            query = query.OrderBy(b => b.Title);
                            break;
                    }
                }
                else
                {
                    // Default sorting by title
                    query = query.OrderBy(b => b.Title);
                }

                // Get total count before pagination
                var totalCount = await query.CountAsync();

                // Apply pagination
                var pagedQuery = query
                    .Skip((filter.Page - 1) * filter.PageSize)
                    .Take(filter.PageSize);

                // Execute query and map to DTOs
                var books = await pagedQuery
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
                        IsAwardWinning = b.IsAwardWinning,
                        ImageUrl = b.ImageUrl ?? "https://placehold.co/300x450?text=No+Cover",
                        CreatedAt = b.CreatedAt,
                        UpdatedAt = b.UpdatedAt,
                        Authors = b.BookAuthors.Select(ba => ba.Author.Name).ToList(),
                        DiscountPercentage = b.Discounts.Where(d => d.OnSaleFlag).Select(d => d.DiscountPercentage).FirstOrDefault(),
                        OnSaleFlag = b.Discounts.Any(d => d.OnSaleFlag),
                        Genres = b.BookGenres.Select(bg => bg.Genre.Name).ToList(),
                        ReviewCount = b.Reviews.Count(),
                    })
                    .ToListAsync();

                _logger.LogInformation($"Successfully filtered books. Found {totalCount} total books, returning page {filter.Page} with {books.Count} books.");
                return (books, totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in FilterBooksAsync: {Message}", ex.Message);
                _logger.LogError("Filter parameters: Page={Page}, PageSize={PageSize}, Category={Category}, PriceRange={PriceRange}", 
                    filter.Page, filter.PageSize, filter.Category, filter.PriceRange);
                _logger.LogError("Stack trace: {StackTrace}", ex.StackTrace);
                
                // Return empty result instead of throwing to avoid 500 errors
                return (new List<BookDto>(), 0);
            }
        }
    }
}