using LordofTheReads.Database;
using LordofTheReads.Database.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LordofTheReads.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<CartController> _logger;

        public CartController(AppDbContext context, ILogger<CartController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // For demo purposes, we'll use a fixed user ID
        private const int DemoUserId = 1;

        // Get cart items
        [HttpGet]
        public async Task<ActionResult<Cart>> GetCart()
        {
            var cart = await GetOrCreateCart(DemoUserId);

            // Include book details in cart items
            var cartWithItems = await _context.Carts
                .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Book)
                .FirstOrDefaultAsync(c => c.Id == cart.Id);

            return Ok(cartWithItems);
        }

        // Add item to cart
        [HttpPost("items")]
        public async Task<ActionResult> AddToCart([FromBody] AddToCartRequest request)
        {
            var book = await _context.Books.FindAsync(request.BookId);
            if (book == null) return NotFound("Book not found");

            var cart = await GetOrCreateCart(DemoUserId);

            var existingItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.BookId == request.BookId);

            if (existingItem != null)
            {
                existingItem.Quantity += request.Quantity;
            }
            else
            {
                var cartItem = new CartItem
                {
                    CartId = cart.Id,
                    BookId = request.BookId,
                    Quantity = request.Quantity
                };
                _context.CartItems.Add(cartItem);
            }

            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok();
        }

        // Update cart item quantity
        [HttpPut("items/{bookId}")]
        public async Task<ActionResult> UpdateCartItem(int bookId, [FromBody] UpdateCartItemRequest request)
        {
            var cart = await GetOrCreateCart(DemoUserId);

            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.BookId == bookId);

            if (cartItem == null) return NotFound("Item not in cart");

            if (request.Quantity <= 0)
            {
                _context.CartItems.Remove(cartItem);
            }
            else
            {
                cartItem.Quantity = request.Quantity;
            }

            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok();
        }

        // Remove item from cart
        [HttpDelete("items/{bookId}")]
        public async Task<ActionResult> RemoveFromCart(int bookId)
        {
            var cart = await GetOrCreateCart(DemoUserId);

            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.BookId == bookId);

            if (cartItem == null) return NotFound("Item not in cart");

            _context.CartItems.Remove(cartItem);
            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok();
        }

        // Clear cart
        [HttpDelete]
        public async Task<ActionResult> ClearCart()
        {
            var cart = await GetOrCreateCart(DemoUserId);

            var cartItems = await _context.CartItems
                .Where(ci => ci.CartId == cart.Id)
                .ToListAsync();

            _context.CartItems.RemoveRange(cartItems);
            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok();
        }

        // Helper method to get or create a cart for a user
        private async Task<Cart> GetOrCreateCart(int userId)
        {
            var cart = await _context.Carts
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            return cart;
        }
    }

    public class AddToCartRequest
    {
        public int BookId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public class UpdateCartItemRequest
    {
        public int Quantity { get; set; }
    }
}