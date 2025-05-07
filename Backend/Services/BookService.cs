// Backend/Services/BookService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using LordofTheReads.Database;
using LordofTheReads.DTOs.Book;
using Microsoft.Extensions.Logging;

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
                // Include BookAuthors, BookGenres and their related entities
                var books = await _context.Books
                    .Include(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
                    .Include(b => b.BookGenres)
                    .ThenInclude(bg => bg.Genre)
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
                        // Use the actual image URL if it exists
                        ImageUrl = b.ImageUrl ?? "https://placehold.co/300x450?text=No+Cover",
                        CreatedAt = b.CreatedAt,
                        UpdatedAt = b.UpdatedAt,
                        // Map author names from the navigation property
                        Authors = b.BookAuthors.Select(ba => ba.Author.Name).ToList(),
                        // Map genre names from the navigation property
                        Genres = b.BookGenres.Select(bg => bg.Genre.Name).ToList()
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
                var book = await _context.Books
                    .Include(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
                    .Include(b => b.BookGenres)
                    .ThenInclude(bg => bg.Genre)
                    .Where(b => b.Id == id)
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
                        // Use the actual image URL if it exists
                        ImageUrl = b.ImageUrl ?? "https://placehold.co/300x450?text=No+Cover",
                        CreatedAt = b.CreatedAt,
                        UpdatedAt = b.UpdatedAt,
                        // Map author names from the navigation property
                        Authors = b.BookAuthors.Select(ba => ba.Author.Name).ToList(),
                        // Map genre names from the navigation property
                        Genres = b.BookGenres.Select(bg => bg.Genre.Name).ToList()
                    })
                    .FirstOrDefaultAsync();

                return book;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetBookByIdAsync: {Message}", ex.Message);
                throw;
            }
        }
    }
}