using LordofTheReads.Database;
using LordofTheReads.Database.Entities;
using LordofTheReads.DTOs.Discount;
using LordofTheReads.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LordofTheReads.Controllers
{
    [ApiController]
    [Route("api/admin/discounts")]
    [Authorize]
    public class AdminDiscountController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<AdminDiscountController> _logger;
        private readonly AdminAuthorizationService _adminAuthService;

        public AdminDiscountController(
            AppDbContext context, 
            ILogger<AdminDiscountController> logger,
            AdminAuthorizationService adminAuthService)
        {
            _context = context;
            _logger = logger;
            _adminAuthService = adminAuthService;
        }

        [HttpGet]
        public async Task<IActionResult> GetDiscounts()
        {
            // Check if user is admin
            if (!await _adminAuthService.IsAdmin(User))
            {
                return Forbid();
            }

            var now = DateTime.UtcNow;
            var discounts = await _context.Discounts
                .Include(d => d.Book)
                .Select(d => new DiscountDto
                {
                    Id = d.Id,
                    BookId = d.BookId,
                    BookTitle = d.Book.Title,
                    DiscountPercentage = d.DiscountPercentage,
                    OnSaleFlag = d.OnSaleFlag,
                    StartDate = d.StartDate,
                    EndDate = d.EndDate,
                    IsActive = d.StartDate <= now && (!d.EndDate.HasValue || d.EndDate.Value > now)
                })
                .ToListAsync();

            return Ok(discounts);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDiscount(int id)
        {
            // Check if user is admin
            if (!await _adminAuthService.IsAdmin(User))
            {
                return Forbid();
            }

            var now = DateTime.UtcNow;
            var discount = await _context.Discounts
                .Include(d => d.Book)
                .Where(d => d.Id == id)
                .Select(d => new DiscountDto
                {
                    Id = d.Id,
                    BookId = d.BookId,
                    BookTitle = d.Book.Title,
                    DiscountPercentage = d.DiscountPercentage,
                    OnSaleFlag = d.OnSaleFlag,
                    StartDate = d.StartDate,
                    EndDate = d.EndDate,
                    IsActive = d.StartDate <= now && (!d.EndDate.HasValue || d.EndDate.Value > now)
                })
                .FirstOrDefaultAsync();

            if (discount == null)
            {
                return NotFound();
            }

            return Ok(discount);
        }

        [HttpPost]
        public async Task<IActionResult> CreateDiscount(DiscountCreateDto discountCreateDto)
        {
            // Check if user is admin
            if (!await _adminAuthService.IsAdmin(User))
            {
                return Forbid();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if book exists
            var book = await _context.Books.FindAsync(discountCreateDto.BookId);
            if (book == null)
            {
                ModelState.AddModelError("BookId", "Book does not exist");
                return BadRequest(ModelState);
            }

            // Validate dates
            if (discountCreateDto.StartDate > discountCreateDto.EndDate && discountCreateDto.EndDate.HasValue)
            {
                ModelState.AddModelError("EndDate", "End date must be after start date");
                return BadRequest(ModelState);
            }

            // Create discount entity
            var discount = new Discount
            {
                BookId = discountCreateDto.BookId,
                DiscountPercentage = discountCreateDto.DiscountPercentage,
                OnSaleFlag = discountCreateDto.OnSaleFlag,
                StartDate = DateTime.SpecifyKind(discountCreateDto.StartDate, DateTimeKind.Utc),
                EndDate = discountCreateDto.EndDate.HasValue 
                    ? DateTime.SpecifyKind(discountCreateDto.EndDate.Value, DateTimeKind.Utc) 
                    : null
            };

            _context.Discounts.Add(discount);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Discount created: {DiscountId} for Book: {BookId}", discount.Id, discount.BookId);

            return CreatedAtAction(nameof(GetDiscount), new { id = discount.Id }, new { id = discount.Id });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDiscount(int id, DiscountUpdateDto discountUpdateDto)
        {
            // Check if user is admin
            if (!await _adminAuthService.IsAdmin(User))
            {
                return Forbid();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var discount = await _context.Discounts.FindAsync(id);
            if (discount == null)
            {
                return NotFound();
            }

            // Validate dates
            if (discountUpdateDto.StartDate > discountUpdateDto.EndDate && discountUpdateDto.EndDate.HasValue)
            {
                ModelState.AddModelError("EndDate", "End date must be after start date");
                return BadRequest(ModelState);
            }

            // Update discount properties
            discount.DiscountPercentage = discountUpdateDto.DiscountPercentage;
            discount.OnSaleFlag = discountUpdateDto.OnSaleFlag;
            discount.StartDate = DateTime.SpecifyKind(discountUpdateDto.StartDate, DateTimeKind.Utc);
            discount.EndDate = discountUpdateDto.EndDate.HasValue 
                ? DateTime.SpecifyKind(discountUpdateDto.EndDate.Value, DateTimeKind.Utc) 
                : null;

            _context.Discounts.Update(discount);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Discount updated: {DiscountId}", discount.Id);

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDiscount(int id)
        {
            // Check if user is admin
            if (!await _adminAuthService.IsAdmin(User))
            {
                return Forbid();
            }

            var discount = await _context.Discounts.FindAsync(id);
            if (discount == null)
            {
                return NotFound();
            }

            _context.Discounts.Remove(discount);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Discount deleted: {DiscountId}", id);

            return NoContent();
        }
    }
}
