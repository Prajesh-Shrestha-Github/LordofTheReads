using LordofTheReads.Database;
using LordofTheReads.Database.Entities;
using LordofTheReads.DTOs.Order;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace LordofTheReads.Services
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;
        private readonly ICartService _cartService;
        private readonly ILogger<OrderService> _logger;
        private readonly INotificationService _notificationService;

        public OrderService(AppDbContext context, ICartService cartService, ILogger<OrderService> logger, INotificationService notificationService = null)
        {
            _context = context;
            _cartService = cartService;
            _logger = logger;
            _notificationService = notificationService;
        }

        public async Task<Order> CreateOrderFromCartAsync(int userId)
        {
            _logger.LogInformation($"Creating order from cart for user ID: {userId}");
            
            // Check if user exists
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                _logger.LogWarning($"User with ID {userId} not found");
                throw new KeyNotFoundException($"User with ID {userId} not found");
            }
            
            _logger.LogInformation($"User found: {user.Username}");

            // Get user's cart with items
            _logger.LogInformation($"Retrieving cart for user ID: {userId}");
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Book)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                _logger.LogWarning($"Cart not found for user ID: {userId}");
                throw new InvalidOperationException("Your cart is empty or not found");
            }
            
            if (cart.CartItems.Count == 0)
            {
                _logger.LogWarning($"Cart is empty for user ID: {userId}");
                throw new InvalidOperationException("Your cart is empty");
            }
            
            _logger.LogInformation($"Cart found with {cart.CartItems.Count} items");

            // Calculate total amount using the price from CartItem (which includes discounts)
            decimal totalAmount = cart.CartItems.Sum(ci => ci.Price * ci.Quantity);
            
            // Apply discount if 5 or more books
            int totalBooks = cart.CartItems.Sum(ci => ci.Quantity);
            decimal discountAmount = 0;
            
            if (totalBooks >= 5)
            {
                discountAmount += totalAmount * 0.05m; // 5% discount for 5+ books
            }

            // Check if user has earned the 10% discount (after 10 successful orders)
            var successfulOrdersCount = await _context.Orders
                .CountAsync(o => o.UserId == userId && o.Status == OrderStatus.Completed);
            
            var userDiscount = await _context.UserDiscounts
                .FirstOrDefaultAsync(ud => ud.UserId == userId && !ud.IsUsed);
            
            if (userDiscount != null)
            {
                discountAmount += totalAmount * 0.10m; // 10% discount for loyal customers
                userDiscount.IsUsed = true;
                _context.UserDiscounts.Update(userDiscount);
            }
            else if (successfulOrdersCount > 0 && successfulOrdersCount % 10 == 0)
            {
                // Create a new discount for the user's next order
                var newDiscount = new UserDiscount
                {
                    UserId = userId,
                    DiscountPercentage = 10,
                    CreatedAt = DateTime.UtcNow,
                    IsUsed = true // Mark as used since we're applying it now
                };
                _context.UserDiscounts.Add(newDiscount);
                
                // Apply the discount to the current order
                discountAmount += totalAmount * 0.10m;
            }

            // Create claim code
            string claimCode = await GenerateClaimCodeAsync();

            // Create new order
            var order = new Order
            {
                UserId = userId,
                OrderDate = DateTime.UtcNow,
                TotalAmount = totalAmount - discountAmount,
                DiscountAmount = discountAmount,
                Status = OrderStatus.Pending,
                ClaimCode = claimCode,
                OrderItems = new List<OrderItem>()
            };

            // Add order items
            foreach (var cartItem in cart.CartItems)
            {
                var orderItem = new OrderItem
                {
                    BookId = cartItem.BookId,
                    Quantity = cartItem.Quantity,
                    PriceAtPurchase = cartItem.Price // Use the price from CartItem which includes any discounts
                };
                order.OrderItems.Add(orderItem);
            }

            // Save order to database
            _context.Orders.Add(order);
            
            // Clear the cart
            await _cartService.ClearCartAsync(userId);
            
            // Check if user qualifies for a new discount after this order
            if (successfulOrdersCount > 0 && (successfulOrdersCount + 1) % 10 == 0)
            {
                var newDiscount = new UserDiscount
                {
                    UserId = userId,
                    DiscountPercentage = 10,
                    CreatedAt = DateTime.UtcNow,
                    IsUsed = false
                };
                _context.UserDiscounts.Add(newDiscount);
            }
            
            await _context.SaveChangesAsync();
            
            return order;
        }

        public async Task<Order> GetOrderByIdAsync(int orderId, int userId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Book)
                .ThenInclude(b => b.BookAuthors)
                .ThenInclude(ba => ba.Author)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                throw new KeyNotFoundException($"Order with ID {orderId} not found");
            }

            // Only allow users to view their own orders unless they're an admin
            if (order.UserId != userId)
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null || user.Role != UserRole.Admin)
                {
                    throw new UnauthorizedAccessException("You are not authorized to view this order");
                }
            }

            return order;
        }

        public async Task<List<Order>> GetUserOrdersAsync(int userId)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Book)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<bool> CancelOrderAsync(int orderId, int userId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
            {
                throw new KeyNotFoundException($"Order with ID {orderId} not found");
            }

            // Only allow users to cancel their own orders unless they're an admin
            if (order.UserId != userId)
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null || user.Role != UserRole.Admin)
                {
                    throw new UnauthorizedAccessException("You are not authorized to cancel this order");
                }
            }

            // Only allow cancellation of pending orders
            if (order.Status != OrderStatus.Pending)
            {
                throw new InvalidOperationException("Only pending orders can be cancelled");
            }

            order.Status = OrderStatus.Cancelled;
            order.IsCancelled = true;
            order.CancellationDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        // Retrieve all pending orders for staff panel
        public async Task<List<Order>> GetPendingOrdersAsync()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Book)
                .ThenInclude(b => b.BookAuthors)
                .ThenInclude(ba => ba.Author)
                .Include(o => o.User)
                .Where(o => o.Status == OrderStatus.Pending)
                .OrderBy(o => o.OrderDate)
                .ToListAsync();
            return orders;
        }

        // Retrieve all processed (completed) orders for staff panel
        public async Task<List<Order>> GetProcessedOrdersAsync()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Book)
                .ThenInclude(b => b.BookAuthors)
                .ThenInclude(ba => ba.Author)
                .Include(o => o.User)
                .Where(o => o.Status == OrderStatus.Completed)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
            return orders;
        }

        // Process (complete) a pending order
        public async Task<bool> ProcessOrderAsync(int orderId, string claimCode, int userId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Book)
                .ThenInclude(b => b.BookAuthors)
                .ThenInclude(ba => ba.Author)
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == orderId);
                
            if (order == null)
                throw new KeyNotFoundException($"Order with ID {orderId} not found");

            if (order.Status != OrderStatus.Pending)
                throw new InvalidOperationException("Only pending orders can be processed");

            if (order.ClaimCode != claimCode)
                throw new InvalidOperationException("Invalid claim code.");

            order.Status = OrderStatus.Completed;
            await _context.SaveChangesAsync();
            
            // Send notifications if service is available
            if (_notificationService != null)
            {
                // Send notification to the user
                var message = $"Your order #{order.Id} has been processed successfully!";
                await _notificationService.SendOrderProcessedNotification(userId, message);
            }
            
            return true;
        }

        // Cancel an order by staff (mark as cancelled)
        public async Task<bool> CancelOrderByStaffAsync(int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                throw new KeyNotFoundException($"Order with ID {orderId} not found");

            if (order.Status != OrderStatus.Pending)
                throw new InvalidOperationException("Only pending orders can be cancelled");

            order.Status = OrderStatus.Cancelled;
            order.IsCancelled = true;
            order.CancellationDate = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            // Send notification to the user if service is available
            if (_notificationService != null)
            {
                var message = $"Your order #{order.Id} has been cancelled by staff.";
                await _notificationService.SendOrderProcessedNotification(order.UserId, message);
            }
            
            return true;
        }

        public async Task<string> GenerateClaimCodeAsync()
        {
            // Generate a random 8-character alphanumeric claim code
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            var code = new string(Enumerable.Repeat(chars, 8)
                .Select(s => s[random.Next(s.Length)]).ToArray());

            // Check if code already exists
            while (await _context.Orders.AnyAsync(o => o.ClaimCode == code))
            {
                code = new string(Enumerable.Repeat(chars, 8)
                    .Select(s => s[random.Next(s.Length)]).ToArray());
            }

            return code;
        }
    }
}
