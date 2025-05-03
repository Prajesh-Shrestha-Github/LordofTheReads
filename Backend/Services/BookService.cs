// Backend/Services/BookService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using LordofTheReads.Database;
using LordofTheReads.DTOs;

namespace LordofTheReads.Services
{
    public class BookService : IBookService
    {
        private readonly AppDbContext _context;

        public BookService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BookDTO>> GetBooksAsync()
        {
            var books = await _context.Books
                .Include(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
                .Include(b => b.BookGenres)
                    .ThenInclude(bg => bg.Genre)
                .Select(b => new BookDTO
                {
                    Id = b.Id,
                    Title = b.Title,
                    ISBN = b.ISBN,
                    Description = b.Description,
                    Price = b.Price,
                    PublicationDate = b.PublicationDate,
                    StockQuantity = b.StockQuantity,
                    Publisher = b.Publisher,
                    Authors = b.BookAuthors.Select(ba => ba.Author.Name).ToList(),
                    Genres = b.BookGenres.Select(bg => bg.Genre.Name).ToList(),
                    CoverImageUrl = $"https://via.placeholder.com/300x450?text={b.Title}"
                })
                .ToListAsync();

            return books;
        }

        public async Task<BookDTO> GetBookByIdAsync(int id)
        {
            var book = await _context.Books
                .Include(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
                .Include(b => b.BookGenres)
                    .ThenInclude(bg => bg.Genre)
                .Where(b => b.Id == id)
                .Select(b => new BookDTO
                {
                    Id = b.Id,
                    Title = b.Title,
                    ISBN = b.ISBN,
                    Description = b.Description,
                    Price = b.Price,
                    PublicationDate = b.PublicationDate,
                    StockQuantity = b.StockQuantity,
                    Publisher = b.Publisher,
                    Authors = b.BookAuthors.Select(ba => ba.Author.Name).ToList(),
                    Genres = b.BookGenres.Select(bg => bg.Genre.Name).ToList(),
                    CoverImageUrl = $"https://via.placeholder.com/300x450?text={b.Title}"
                })
                .FirstOrDefaultAsync();

            return book;
        }
    }
}