using LordofTheReads.Database;
using LordofTheReads.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LordofTheReads.Services
{
    public class BookmarkService : IBookmarkService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<BookmarkService> _logger;

        public BookmarkService(AppDbContext context, ILogger<BookmarkService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<Bookmark>> GetBookmarksAsync(int userId)
        {
            return await _context.Bookmarks
                .Where(b => b.UserId == userId)
                .Include(b => b.Book)
                .ThenInclude(b => b.BookAuthors)
                .ThenInclude(ba => ba.Author)
                .ToListAsync();
        }

        public async Task<Bookmark> AddBookmarkAsync(int userId, int bookId)
        {
            var book = await _context.Books.FindAsync(bookId);
            if (book == null) throw new KeyNotFoundException($"Book with ID {bookId} not found");

            var existingBookmark = await _context.Bookmarks
                .FirstOrDefaultAsync(b => b.UserId == userId && b.BookId == bookId);

            if (existingBookmark != null)
            {
                return existingBookmark; // Already bookmarked
            }

            var bookmark = new Bookmark
            {
                UserId = userId,
                BookId = bookId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Bookmarks.Add(bookmark);
            await _context.SaveChangesAsync();

            return bookmark;
        }

        public async Task RemoveBookmarkAsync(int userId, int bookId)
        {
            var bookmark = await _context.Bookmarks
                .FirstOrDefaultAsync(b => b.UserId == userId && b.BookId == bookId);

            if (bookmark == null) throw new KeyNotFoundException("Bookmark not found");

            _context.Bookmarks.Remove(bookmark);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> IsBookmarkedAsync(int userId, int bookId)
        {
            return await _context.Bookmarks
                .AnyAsync(b => b.UserId == userId && b.BookId == bookId);
        }

        public async Task ClearBookmarksAsync(int userId)
        {
            var bookmarks = await _context.Bookmarks
                .Where(b => b.UserId == userId)
                .ToListAsync();

            _context.Bookmarks.RemoveRange(bookmarks);
            await _context.SaveChangesAsync();
        }
    }
}