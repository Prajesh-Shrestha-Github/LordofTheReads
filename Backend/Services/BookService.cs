// Backend/Services/BookService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using LordofTheReads.Database;
using LordofTheReads.DTOs;
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

        public async Task<IEnumerable<BookDTO>> GetBooksAsync()
        {
            try
            {
                // Start with a simple query to diagnose the issue
                var books = await _context.Books
                    .Select(b => new BookDTO
                    {
                        Id = b.Id,
                        Title = b.Title ?? "Unknown Title",
                        ISBN = b.ISBN,
                        Description = b.Description,
                        Price = b.Price,
                        PublicationDate = b.PublicationDate,
                        StockQuantity = b.StockQuantity,
                        Publisher = b.Publisher,
                        Authors = new List<string>(),
                        Genres = new List<string>(),
                        ImageUrl = b.ImageUrl ?? "https://via.placeholder.com/300x450?text=No+Cover"
                    })
                    .ToListAsync();

                _logger.LogInformation($"Successfully retrieved {books.Count()} books");
                return books;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetBooksAsync: {Message}", ex.Message);
                throw; // Rethrow for proper error handling in controller
            }
        }

        public async Task<BookDTO> GetBookByIdAsync(int id)
        {
            try
            {
                var book = await _context.Books
                    .Where(b => b.Id == id)
                    .Select(b => new BookDTO
                    {
                        Id = b.Id,
                        Title = b.Title ?? "Unknown Title",
                        ISBN = b.ISBN,
                        Description = b.Description,
                        Price = b.Price,
                        PublicationDate = b.PublicationDate,
                        StockQuantity = b.StockQuantity,
                        Publisher = b.Publisher,
                        Authors = new List<string>(),
                        Genres = new List<string>(),
                        ImageUrl = b.ImageUrl ?? "https://via.placeholder.com/300x450?text=No+Cover"
                    })
                    .FirstOrDefaultAsync();

                return book;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetBookByIdAsync for book {Id}: {Message}", id, ex.Message);
                throw; // Rethrow for proper error handling in controller
            }
        }
    }
}