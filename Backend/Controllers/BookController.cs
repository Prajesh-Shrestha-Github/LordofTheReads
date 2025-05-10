// Backend/Controllers/BookController.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LordofTheReads.Services;
using LordofTheReads.DTOs.Book;
using LordofTheReads.Database;
using LordofTheReads.Database.Entities; // Added for OrderStatus enum
using Microsoft.Extensions.Logging;

namespace LordofTheReads.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookController : ControllerBase
    {
        private readonly IBookService _bookService;
        private readonly ILogger<BookController> _logger;
        private readonly AppDbContext _context;

        public BookController(IBookService bookService, ILogger<BookController> logger, AppDbContext context)
        {
            _bookService = bookService;
            _logger = logger;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetBooks()
        {
            try
            {
                var books = await _bookService.GetBooksAsync();
                return Ok(books);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching books: {Message}", ex.Message);
                return StatusCode(500, new { message = "An error occurred while retrieving books.", error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BookDto>> GetBook(int id)
        {
            try
            {
                var book = await _bookService.GetBookByIdAsync(id);
                
                if (book == null)
                {
                    return NotFound();
                }

                return Ok(book);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching book {Id}: {Message}", id, ex.Message);
                return StatusCode(500, new { message = "An error occurred while retrieving the book.", error = ex.Message, stackTrace = ex.StackTrace });
            }
        }
        
        // GET: api/book/bestsellers
        [HttpGet("bestsellers")]
        public async Task<ActionResult> GetBestsellers([FromQuery] int count = 5)
        {
            try
            {
                // Get books ordered by the total quantity sold in completed orders
                var bestsellers = await _context.OrderItems
                    .Where(oi => oi.Order.Status == OrderStatus.Completed) // Using enum instead of string
                    .GroupBy(oi => oi.BookId)
                    .Select(group => new
                    {
                        BookId = group.Key,
                        TotalSold = group.Sum(oi => oi.Quantity)
                    })
                    .OrderByDescending(x => x.TotalSold) // Sort by most sold first
                    .Take(count)
                    .Join(
                        _context.Books,
                        sold => sold.BookId,
                        book => book.Id,
                        (sold, book) => new { Book = book, TotalSold = sold.TotalSold }
                    )
                    // Select the Book.Id property instead
                    .Select(result => result.Book.Id)
                    .ToListAsync();
                
                // Get the full book details for each bestseller
                var bestsellerBooks = new List<BookDto>();
                foreach (var bookId in bestsellers)
                {
                    var book = await _bookService.GetBookByIdAsync(bookId);
                    if (book != null)
                    {
                        bestsellerBooks.Add(book);
                    }
                }
                
                _logger.LogInformation("Retrieved {0} bestsellers", bestsellerBooks.Count);
                return Ok(bestsellerBooks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching bestsellers: {0}", ex.Message);
                return StatusCode(500, new { message = "An error occurred while retrieving bestsellers.", error = ex.Message, stackTrace = ex.StackTrace });
            }
        }
    }
}