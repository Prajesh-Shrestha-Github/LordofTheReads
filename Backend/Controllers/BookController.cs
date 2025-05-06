// Backend/Controllers/BookController.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using LordofTheReads.Services;
using LordofTheReads.DTOs;
using Microsoft.Extensions.Logging;

namespace LordofTheReads.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookController : ControllerBase
    {
        private readonly IBookService _bookService;
        private readonly ILogger<BookController> _logger;

        public BookController(IBookService bookService, ILogger<BookController> logger)
        {
            _bookService = bookService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookDTO>>> GetBooks()
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
        public async Task<ActionResult<BookDTO>> GetBook(int id)
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
    }
}