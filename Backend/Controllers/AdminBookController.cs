using LordofTheReads.Database;
using LordofTheReads.Database.Entities;
using LordofTheReads.DTOs.Book;
using LordofTheReads.DTOs.Author;
using LordofTheReads.DTOs.Genre;
using LordofTheReads.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LordofTheReads.Controllers
{
    [ApiController]
    [Route("api/admin/books")]
    [Authorize]
    public class AdminBookController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<AdminBookController> _logger;
        private readonly AdminAuthorizationService _adminAuthService;

        public AdminBookController(
            AppDbContext context, 
            ILogger<AdminBookController> logger,
            AdminAuthorizationService adminAuthService)
        {
            _context = context;
            _logger = logger;
            _adminAuthService = adminAuthService;
        }

        [HttpGet]
        public async Task<IActionResult> GetBooks()
        {
            try 
            {
                // Check if user is admin
                if (!await _adminAuthService.IsAdmin(User))
                {
                    return Forbid();
                }

                var books = await _context.Books
                    .Select(b => new BookDto
                    {
                        Id = b.Id,
                        Title = b.Title,
                        ISBN = b.ISBN,
                        Description = b.Description,
                        Price = b.Price,
                        PublicationDate = b.PublicationDate,
                        StockQuantity = b.StockQuantity,
                        Publisher = b.Publisher,
                        ImageUrl = b.ImageUrl,
                        CreatedAt = b.CreatedAt,
                        UpdatedAt = b.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(books);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetBooks: {Message}", ex.Message);
                return StatusCode(500, new { message = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBook(int id)
        {
            try
            {
                // Check if user is admin
                if (!await _adminAuthService.IsAdmin(User))
                {
                    return Forbid();
                }

                _logger.LogInformation("Fetching book details for ID: {Id}", id);

                var book = await _context.Books
                    .Include(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
                    .Include(b => b.BookGenres)
                    .ThenInclude(bg => bg.Genre)
                    .Include(b => b.Discounts)
                    .FirstOrDefaultAsync(b => b.Id == id);

                if (book == null)
                {
                    _logger.LogWarning("Book with ID {Id} not found", id);
                    return NotFound();
                }

                var bookDetailDto = new BookDetailDto
                {
                    Id = book.Id,
                    Title = book.Title,
                    ISBN = book.ISBN,
                    Description = book.Description,
                    Price = book.Price,
                    PublicationDate = book.PublicationDate,
                    StockQuantity = book.StockQuantity,
                    Publisher = book.Publisher,
                    ImageUrl = book.ImageUrl,
                    CreatedAt = book.CreatedAt,
                    UpdatedAt = book.UpdatedAt,
                    Authors = book.BookAuthors.Select(ba => new AuthorDto
                    {
                        Id = ba.Author.Id,
                        Name = ba.Author.Name
                    }).ToList(),
                    Genres = book.BookGenres.Select(bg => new GenreDto
                    {
                        Id = bg.Genre.Id,
                        Name = bg.Genre.Name
                    }).ToList(),
                    Discounts = book.Discounts.Select(d => new DiscountDto
                    {
                        Id = d.Id,
                        DiscountPercentage = d.DiscountPercentage,
                        OnSaleFlag = d.OnSaleFlag,
                        StartDate = d.StartDate,
                        EndDate = d.EndDate
                    }).ToList()
                };

                return Ok(bookDetailDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetBook for ID {Id}: {Message}", id, ex.Message);
                return StatusCode(500, new { message = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateBook(BookCreateDto bookCreateDto)
        {
            try
            {
                // Check if user is admin
                if (!await _adminAuthService.IsAdmin(User))
                {
                    return Forbid();
                }

                // Log the received data for debugging
                _logger.LogInformation("Received book creation request: {@BookCreateDto}", bookCreateDto);

                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Model state is invalid: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                // Check if ISBN is unique if provided
                if (!string.IsNullOrEmpty(bookCreateDto.ISBN) && 
                    await _context.Books.AnyAsync(b => b.ISBN == bookCreateDto.ISBN))
                {
                    ModelState.AddModelError("ISBN", "ISBN must be unique");
                    return BadRequest(ModelState);
                }

                // Process new authors if provided
                List<int> allAuthorIds = bookCreateDto.AuthorIds ?? new List<int>();
                if (bookCreateDto.NewAuthors != null && bookCreateDto.NewAuthors.Any())
                {
                    foreach (var newAuthor in bookCreateDto.NewAuthors)
                    {
                        // Skip empty author names
                        if (string.IsNullOrWhiteSpace(newAuthor.Name))
                            continue;
                            
                        // Check if an author with the same name already exists
                        var existingAuthor = await _context.Authors
                            .FirstOrDefaultAsync(a => a.Name.ToLower() == newAuthor.Name.ToLower().Trim());
                        
                        if (existingAuthor != null)
                        {
                            // Use existing author
                            if (!allAuthorIds.Contains(existingAuthor.Id))
                            {
                                allAuthorIds.Add(existingAuthor.Id);
                            }
                        }
                        else
                        {
                            // Create new author
                            var author = new Author
                            {
                                Name = newAuthor.Name.Trim(),
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            };
                            
                            _context.Authors.Add(author);
                            await _context.SaveChangesAsync();
                            
                            allAuthorIds.Add(author.Id);
                        }
                    }
                }

                // Process new genres if provided
                List<int> allGenreIds = bookCreateDto.GenreIds ?? new List<int>();
                if (bookCreateDto.NewGenres != null && bookCreateDto.NewGenres.Any())
                {
                    foreach (var newGenre in bookCreateDto.NewGenres)
                    {
                        // Skip empty genre names
                        if (string.IsNullOrWhiteSpace(newGenre.Name))
                            continue;
                            
                        // Check if a genre with the same name already exists
                        var existingGenre = await _context.Genres
                            .FirstOrDefaultAsync(g => g.Name.ToLower() == newGenre.Name.ToLower().Trim());
                        
                        if (existingGenre != null)
                        {
                            // Use existing genre
                            if (!allGenreIds.Contains(existingGenre.Id))
                            {
                                allGenreIds.Add(existingGenre.Id);
                            }
                        }
                        else
                        {
                            // Create new genre
                            var genre = new Genre
                            {
                                Name = newGenre.Name.Trim(),
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            };
                            
                            _context.Genres.Add(genre);
                            await _context.SaveChangesAsync();
                            
                            allGenreIds.Add(genre.Id);
                        }
                    }
                }

                // Validate that the authors exist
                if (allAuthorIds.Any())
                {
                    var existingAuthorIds = await _context.Authors
                        .Where(a => allAuthorIds.Contains(a.Id))
                        .Select(a => a.Id)
                        .ToListAsync();

                    var missingAuthorIds = allAuthorIds
                        .Except(existingAuthorIds)
                        .ToList();

                    if (missingAuthorIds.Any())
                    {
                        ModelState.AddModelError("AuthorIds", $"The following author IDs do not exist: {string.Join(", ", missingAuthorIds)}");
                        return BadRequest(ModelState);
                    }
                }

                // Validate that the genres exist
                if (allGenreIds.Any())
                {
                    var existingGenreIds = await _context.Genres
                        .Where(g => allGenreIds.Contains(g.Id))
                        .Select(g => g.Id)
                        .ToListAsync();

                    var missingGenreIds = allGenreIds
                        .Except(existingGenreIds)
                        .ToList();

                    if (missingGenreIds.Any())
                    {
                        ModelState.AddModelError("GenreIds", $"The following genre IDs do not exist: {string.Join(", ", missingGenreIds)}");
                        return BadRequest(ModelState);
                    }
                }

                // Create the book entity
                var book = new Book
                {
                    Title = bookCreateDto.Title,
                    ISBN = bookCreateDto.ISBN,
                    Description = bookCreateDto.Description,
                    Price = bookCreateDto.Price,
                    PublicationDate = bookCreateDto.PublicationDate.HasValue 
                        ? DateTime.SpecifyKind(bookCreateDto.PublicationDate.Value, DateTimeKind.Utc) 
                        : null,
                    StockQuantity = bookCreateDto.StockQuantity,
                    Publisher = bookCreateDto.Publisher,
                    ImageUrl = bookCreateDto.ImageUrl,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Books.Add(book);
                await _context.SaveChangesAsync();

                // Add authors if provided
                if (allAuthorIds.Any())
                {
                    foreach (var authorId in allAuthorIds)
                    {
                        _context.BookAuthors.Add(new BookAuthor
                        {
                            BookId = book.Id,
                            AuthorId = authorId
                        });
                    }
                    await _context.SaveChangesAsync();
                }

                // Add genres if provided
                if (allGenreIds.Any())
                {
                    foreach (var genreId in allGenreIds)
                    {
                        _context.BookGenres.Add(new BookGenre
                        {
                            BookId = book.Id,
                            GenreId = genreId
                        });
                    }
                    await _context.SaveChangesAsync();
                }

                _logger.LogInformation("Book created: {BookId}", book.Id);

                return CreatedAtAction(nameof(GetBook), new { id = book.Id }, new { id = book.Id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating book: {Message}", ex.Message);
                
                // Get more detailed info for DbUpdateException
                if (ex is DbUpdateException dbEx)
                {
                    _logger.LogError("DbUpdateException details - Inner Exception: {InnerMessage}", 
                        dbEx.InnerException?.Message);
                    
                    return StatusCode(500, new { 
                        message = $"Database error: {dbEx.InnerException?.Message ?? dbEx.Message}", 
                        stackTrace = ex.StackTrace 
                    });
                }
                
                return StatusCode(500, new { message = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBook(int id, BookUpdateDto bookUpdateDto)
        {
            try
            {
                // Check if user is admin
                if (!await _adminAuthService.IsAdmin(User))
                {
                    return Forbid();
                }

                var book = await _context.Books
                    .Include(b => b.BookAuthors)
                    .Include(b => b.BookGenres)
                    .FirstOrDefaultAsync(b => b.Id == id);

                if (book == null)
                {
                    return NotFound();
                }

                // Log the received data for debugging
                _logger.LogInformation("Received book update request: {@BookUpdateDto}", bookUpdateDto);

                // Check if ISBN is unique (if changed)
                if (!string.IsNullOrEmpty(bookUpdateDto.ISBN) && 
                    bookUpdateDto.ISBN != book.ISBN && 
                    await _context.Books.AnyAsync(b => b.ISBN == bookUpdateDto.ISBN))
                {
                    ModelState.AddModelError("ISBN", "ISBN must be unique");
                    return BadRequest(ModelState);
                }

                // Update book properties
                book.Title = bookUpdateDto.Title;
                book.ISBN = bookUpdateDto.ISBN;
                book.Description = bookUpdateDto.Description;
                book.Price = bookUpdateDto.Price;
                book.PublicationDate = bookUpdateDto.PublicationDate;
                book.StockQuantity = bookUpdateDto.StockQuantity;
                book.Publisher = bookUpdateDto.Publisher;
                book.ImageUrl = bookUpdateDto.ImageUrl;
                book.UpdatedAt = DateTime.UtcNow;

                // Process new authors if provided
                List<int> allAuthorIds = bookUpdateDto.AuthorIds ?? new List<int>();
                if (bookUpdateDto.NewAuthors != null && bookUpdateDto.NewAuthors.Any())
                {
                    foreach (var newAuthor in bookUpdateDto.NewAuthors)
                    {
                        // Skip empty author names
                        if (string.IsNullOrWhiteSpace(newAuthor.Name))
                            continue;
                            
                        // Check if an author with the same name already exists
                        var existingAuthor = await _context.Authors
                            .FirstOrDefaultAsync(a => a.Name.ToLower() == newAuthor.Name.ToLower().Trim());
                        
                        if (existingAuthor != null)
                        {
                            // Use existing author
                            if (!allAuthorIds.Contains(existingAuthor.Id))
                            {
                                allAuthorIds.Add(existingAuthor.Id);
                            }
                        }
                        else
                        {
                            // Create new author
                            var author = new Author
                            {
                                Name = newAuthor.Name.Trim(),
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            };
                            
                            _context.Authors.Add(author);
                            await _context.SaveChangesAsync();
                            
                            allAuthorIds.Add(author.Id);
                        }
                    }
                }

                // Process new genres if provided
                List<int> allGenreIds = bookUpdateDto.GenreIds ?? new List<int>();
                if (bookUpdateDto.NewGenres != null && bookUpdateDto.NewGenres.Any())
                {
                    foreach (var newGenre in bookUpdateDto.NewGenres)
                    {
                        // Skip empty genre names
                        if (string.IsNullOrWhiteSpace(newGenre.Name))
                            continue;
                            
                        // Check if a genre with the same name already exists
                        var existingGenre = await _context.Genres
                            .FirstOrDefaultAsync(g => g.Name.ToLower() == newGenre.Name.ToLower().Trim());
                        
                        if (existingGenre != null)
                        {
                            // Use existing genre
                            if (!allGenreIds.Contains(existingGenre.Id))
                            {
                                allGenreIds.Add(existingGenre.Id);
                            }
                        }
                        else
                        {
                            // Create new genre
                            var genre = new Genre
                            {
                                Name = newGenre.Name.Trim(),
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            };
                            
                            _context.Genres.Add(genre);
                            await _context.SaveChangesAsync();
                            
                            allGenreIds.Add(genre.Id);
                        }
                    }
                }

                // Validate that the authors exist
                if (allAuthorIds.Any())
                {
                    var existingAuthorIds = await _context.Authors
                        .Where(a => allAuthorIds.Contains(a.Id))
                        .Select(a => a.Id)
                        .ToListAsync();

                    var missingAuthorIds = allAuthorIds
                        .Except(existingAuthorIds)
                        .ToList();

                    if (missingAuthorIds.Any())
                    {
                        ModelState.AddModelError("AuthorIds", $"The following author IDs do not exist: {string.Join(", ", missingAuthorIds)}");
                        return BadRequest(ModelState);
                    }
                }

                // Validate that the genres exist
                if (allGenreIds.Any())
                {
                    var existingGenreIds = await _context.Genres
                        .Where(g => allGenreIds.Contains(g.Id))
                        .Select(g => g.Id)
                        .ToListAsync();

                    var missingGenreIds = allGenreIds
                        .Except(existingGenreIds)
                        .ToList();

                    if (missingGenreIds.Any())
                    {
                        ModelState.AddModelError("GenreIds", $"The following genre IDs do not exist: {string.Join(", ", missingGenreIds)}");
                        return BadRequest(ModelState);
                    }
                }

                // Update authors if provided
                if (bookUpdateDto.AuthorIds != null || bookUpdateDto.NewAuthors != null)
                {
                    // Remove existing book authors
                    var existingBookAuthors = await _context.BookAuthors
                        .Where(ba => ba.BookId == id)
                        .ToListAsync();
                    
                    _context.BookAuthors.RemoveRange(existingBookAuthors);
                    await _context.SaveChangesAsync();

                    // Add new book authors
                    foreach (var authorId in allAuthorIds)
                    {
                        _context.BookAuthors.Add(new BookAuthor
                        {
                            BookId = book.Id,
                            AuthorId = authorId
                        });
                    }
                }

                // Update genres if provided
                if (bookUpdateDto.GenreIds != null || bookUpdateDto.NewGenres != null)
                {
                    // Remove existing book genres
                    var existingBookGenres = await _context.BookGenres
                        .Where(bg => bg.BookId == id)
                        .ToListAsync();
                    
                    _context.BookGenres.RemoveRange(existingBookGenres);
                    await _context.SaveChangesAsync();

                    // Add new book genres
                    foreach (var genreId in allGenreIds)
                    {
                        _context.BookGenres.Add(new BookGenre
                        {
                            BookId = book.Id,
                            GenreId = genreId
                        });
                    }
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("Book updated: {BookId}", book.Id);

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating book: {Message}", ex.Message);
                
                // Get more detailed info for DbUpdateException
                if (ex is DbUpdateException dbEx)
                {
                    _logger.LogError("DbUpdateException details - Inner Exception: {InnerMessage}", 
                        dbEx.InnerException?.Message);
                    
                    return StatusCode(500, new { 
                        message = $"Database error: {dbEx.InnerException?.Message ?? dbEx.Message}", 
                        stackTrace = ex.StackTrace 
                    });
                }
                
                return StatusCode(500, new { message = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            // Check if user is admin
            if (!await _adminAuthService.IsAdmin(User))
            {
                return Forbid();
            }

            var book = await _context.Books.FindAsync(id);
            if (book == null)
            {
                return NotFound();
            }

            // Check if book is referenced in any cart items
            var hasCartItems = await _context.CartItems.AnyAsync(ci => ci.BookId == id);
            if (hasCartItems)
            {
                return BadRequest("Cannot delete book that is in customer carts");
            }

            // Check if book is referenced in any order items
            var hasOrderItems = await _context.OrderItems.AnyAsync(oi => oi.BookId == id);
            if (hasOrderItems)
            {
                return BadRequest("Cannot delete book that has been ordered");
            }

            // Remove book authors
            var bookAuthors = await _context.BookAuthors.Where(ba => ba.BookId == id).ToListAsync();
            _context.BookAuthors.RemoveRange(bookAuthors);

            // Remove book genres
            var bookGenres = await _context.BookGenres.Where(bg => bg.BookId == id).ToListAsync();
            _context.BookGenres.RemoveRange(bookGenres);

            // Remove book bookmarks
            var bookmarks = await _context.Bookmarks.Where(b => b.BookId == id).ToListAsync();
            _context.Bookmarks.RemoveRange(bookmarks);

            // Remove book reviews
            var reviews = await _context.Reviews.Where(r => r.BookId == id).ToListAsync();
            _context.Reviews.RemoveRange(reviews);

            // Remove book discounts
            var discounts = await _context.Discounts.Where(d => d.BookId == id).ToListAsync();
            _context.Discounts.RemoveRange(discounts);

            // Remove the book
            _context.Books.Remove(book);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Book deleted: {BookId}", id);

            return NoContent();
        }
    }
}
