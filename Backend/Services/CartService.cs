using LordofTheReads.Database;
using LordofTheReads.Database.Entities;
using LordofTheReads.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LordofTheReads.Services
{
    public class CartService : ICartService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<CartService> _logger;

        public CartService(AppDbContext context, ILogger<CartService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Cart> GetCartAsync(int userId)
        {
            return await GetOrCreateCartAsync(userId);
        }

        public async Task<Cart> GetCartWithItemsAsync(int userId)
        {
            var cart = await GetOrCreateCartAsync(userId);

            // Include book details in cart items
            var cartWithItems = await _context.Carts
                .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Book)
                .ThenInclude(b => b.BookAuthors)
                .ThenInclude(ba => ba.Author)
                .FirstOrDefaultAsync(c => c.Id == cart.Id);
                
            if (cartWithItems != null && cartWithItems.CartItems.Any())
            {
                // Calculate subtotal before applying any discounts
                decimal subtotal = cartWithItems.CartItems.Sum(ci => ci.Price * ci.Quantity);
                
                // Check if user has a loyalty discount available
                var userDiscount = await _context.UserDiscounts
                    .FirstOrDefaultAsync(ud => ud.UserId == userId && !ud.IsUsed);
                    
                if (userDiscount != null)
                {
                    // Calculate the loyalty discount amount (10%)
                    decimal discountAmount = subtotal * 0.10m;
                    
                    // Add discount information to the cart
                    cartWithItems.DiscountAmount = discountAmount;
                    cartWithItems.DiscountType = "Loyalty Discount";
                    cartWithItems.DiscountPercentage = 10;
                    
                    // Store original prices for display purposes
                    foreach (var item in cartWithItems.CartItems)
                    {
                        item.OriginalPrice = item.Price;
                    }
                }
            }

            return cartWithItems;
        }

        public async Task<CartItem> AddToCartAsync(int userId, int bookId, int quantity)
        {
            // Get the book with discount information
            var book = await _context.Books
                .Include(b => b.Discounts)
                .FirstOrDefaultAsync(b => b.Id == bookId);
                
            if (book == null) throw new KeyNotFoundException($"Book with ID {bookId} not found");
            
            // Check if there's enough stock
            if (book.StockQuantity < quantity)
            {
                throw new InvalidOperationException($"Not enough stock available. Only {book.StockQuantity} copies of '{book.Title}' are available.");
            }

            var cart = await GetOrCreateCartAsync(userId);

            // Calculate the actual price (including any discount)
            decimal actualPrice = book.Price;
            var activeDiscount = book.Discounts.FirstOrDefault(d => d.OnSaleFlag);
            if (activeDiscount != null)
            {
                decimal discountMultiplier = 1 - (activeDiscount.DiscountPercentage / 100m);
                actualPrice = Math.Round(book.Price * discountMultiplier, 2);
                _logger.LogInformation($"Applied discount of {activeDiscount.DiscountPercentage}% to book {bookId}. Original price: {book.Price}, Discounted price: {actualPrice}");
            }

            var existingItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.BookId == bookId);

            if (existingItem != null)
            {
                existingItem.Quantity += quantity;
                // Update the price in case the discount has changed
                existingItem.Price = actualPrice;
                _context.CartItems.Update(existingItem);
            }
            else
            {
                existingItem = new CartItem
                {
                    CartId = cart.Id,
                    BookId = bookId,
                    Quantity = quantity,
                    Price = actualPrice,
                    AddedAt = DateTime.UtcNow
                };
                _context.CartItems.Add(existingItem);
            }

            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return existingItem;
        }

        public async Task<CartItem> UpdateCartItemAsync(int userId, int bookId, int quantity)
        {
            var cart = await GetOrCreateCartAsync(userId);

            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.BookId == bookId);

            if (cartItem == null) throw new KeyNotFoundException("Item not found in cart");

            if (quantity <= 0)
            {
                await RemoveFromCartAsync(userId, bookId);
                return null;
            }
            else
            {
                // Get the book with discount information to ensure price is up-to-date
                var book = await _context.Books
                    .Include(b => b.Discounts)
                    .FirstOrDefaultAsync(b => b.Id == bookId);
                
                if (book == null) throw new KeyNotFoundException($"Book with ID {bookId} not found");
                
                // Check if there's enough stock
                if (book.StockQuantity < quantity)
                {
                    throw new InvalidOperationException($"Not enough stock available. Only {book.StockQuantity} copies of '{book.Title}' are available.");
                }
                
                if (book != null)
                {
                    // Recalculate the price in case discounts have changed
                    decimal actualPrice = book.Price;
                    var activeDiscount = book.Discounts.FirstOrDefault(d => d.OnSaleFlag);
                    if (activeDiscount != null)
                    {
                        decimal discountMultiplier = 1 - (activeDiscount.DiscountPercentage / 100m);
                        actualPrice = Math.Round(book.Price * discountMultiplier, 2);
                        _logger.LogInformation($"Applied discount of {activeDiscount.DiscountPercentage}% to book {bookId}. Original price: {book.Price}, Discounted price: {actualPrice}");
                    }
                    
                    // Update the price
                    cartItem.Price = actualPrice;
                }
                
                cartItem.Quantity = quantity;
                cart.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return cartItem;
            }
        }

        public async Task RemoveFromCartAsync(int userId, int bookId)
        {
            var cart = await GetOrCreateCartAsync(userId);

            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.BookId == bookId);

            if (cartItem == null) throw new KeyNotFoundException("Item not found in cart");

            _context.CartItems.Remove(cartItem);
            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        public async Task ClearCartAsync(int userId)
        {
            var cart = await GetOrCreateCartAsync(userId);

            var cartItems = await _context.CartItems
                .Where(ci => ci.CartId == cart.Id)
                .ToListAsync();

            _context.CartItems.RemoveRange(cartItems);
            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        private async Task<Cart> GetOrCreateCartAsync(int userId)
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
}