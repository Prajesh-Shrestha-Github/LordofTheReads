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
using System.Web;

namespace LordofTheReads.Services
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;
        private readonly ICartService _cartService;
        private readonly ILogger<OrderService> _logger;
        private readonly INotificationService _notificationService;
        private readonly IEmailService _emailService;

        public OrderService(AppDbContext context, ICartService cartService, ILogger<OrderService> logger, INotificationService notificationService = null, IEmailService emailService = null)
        {
            _context = context;
            _cartService = cartService;
            _logger = logger;
            _notificationService = notificationService;
            _emailService = emailService;
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
                .ThenInclude(b => b.BookAuthors)
                .ThenInclude(ba => ba.Author)
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
            
            // Initialize orders until next discount variable
            int ordersUntilNextDiscount = 0;
            
            if (totalBooks >= 5)
            {
                discountAmount += totalAmount * 0.05m; // 5% discount for 5+ books
            }

            // Check if user has earned the 10% discount (after 10 successful orders)
            var successfulOrdersCount = await _context.Orders
                .CountAsync(o => o.UserId == userId && o.Status == OrderStatus.Completed);
                
            // Get user's email for sending notifications
            var userEmail = user.Email;
            
            // Calculate the number of orders until next discount
            ordersUntilNextDiscount = 10 - (successfulOrdersCount % 10);
            
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
                // Apply the discount to the current order for milestone (10th, 20th, etc. order)
                discountAmount += totalAmount * 0.10m;
                
                // Create a record that this milestone discount was used
                var milestoneDiscount = new UserDiscount
                {
                    UserId = userId,
                    DiscountPercentage = 10,
                    CreatedAt = DateTime.UtcNow,
                    IsUsed = true,
                    UsedAt = DateTime.UtcNow
                };
                _context.UserDiscounts.Add(milestoneDiscount);
                
                _logger.LogInformation($"Applied 10% loyalty discount for user {userId} on their {successfulOrdersCount}th completed order");
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

            // Create order items and update stock quantity
            foreach (var cartItem in cart.CartItems)
            {
                // Check if there's enough stock for this item
                var book = await _context.Books.FindAsync(cartItem.BookId);
                if (book == null)
                {
                    throw new InvalidOperationException($"Book with ID {cartItem.BookId} not found");
                }
                
                if (book.StockQuantity < cartItem.Quantity)
                {
                    throw new InvalidOperationException($"Not enough stock for '{book.Title}'. Only {book.StockQuantity} available.");
                }
                
                // Decrease stock quantity when order is placed (pending)
                book.StockQuantity -= cartItem.Quantity;
                _context.Books.Update(book);
                
                // Create the order item
                var orderItem = new OrderItem
                {
                    BookId = cartItem.BookId,
                    Quantity = cartItem.Quantity,
                    PriceAtPurchase = cartItem.Price // Use the price from CartItem which includes any discounts
                };
                order.OrderItems.Add(orderItem);
                
                _logger.LogInformation($"Updated stock for book ID {book.Id}. New stock quantity: {book.StockQuantity}");
            }

            // Save order to database
            _context.Orders.Add(order);
            
            // Copy cart items for email before clearing
            var cartItemsForEmail = cart.CartItems.ToList();
            
            // Clear the cart
            await _cartService.ClearCartAsync(userId);
            
            // Check if user will qualify for a new discount after this order completes
            // If they'll have completed 9, 19, 29, etc. orders (one away from milestone)
            if ((successfulOrdersCount + 1) % 10 == 9)
            {
                // Create a discount for their next order after this one
                var newDiscount = new UserDiscount
                {
                    UserId = userId,
                    DiscountPercentage = 10,
                    CreatedAt = DateTime.UtcNow,
                    IsUsed = false
                };
                _context.UserDiscounts.Add(newDiscount);
                _logger.LogInformation($"Created new 10% discount for user ID {userId} to be used on their next order after completing {successfulOrdersCount + 1} orders");
            }
            
            await _context.SaveChangesAsync();
            
            // Prepare order details for email
            var orderDetailsBuilder = new StringBuilder();
            orderDetailsBuilder.AppendLine("<table border='1' cellpadding='5' cellspacing='0' style='border-collapse: collapse;'>");
            orderDetailsBuilder.AppendLine("<tr><th>Book</th><th>Author</th><th>Quantity</th><th>Price</th><th>Subtotal</th></tr>");
            
            _logger.LogInformation($"Preparing order details for {cartItemsForEmail.Count} items");
            foreach (var cartItem in cartItemsForEmail)
            {
                _logger.LogInformation($"Processing item: {cartItem.Book.Title}");
                string authors = "Unknown";
                
                if (cartItem.Book.BookAuthors != null && cartItem.Book.BookAuthors.Any())
                {
                    // Safe way to get author names with null checks
                    var authorNames = cartItem.Book.BookAuthors
                        .Where(ba => ba.Author != null && !string.IsNullOrEmpty(ba.Author.Name))
                        .Select(ba => ba.Author.Name)
                        .ToList();
                        
                    if (authorNames.Any())
                    {
                        authors = string.Join(", ", authorNames);
                        _logger.LogInformation($"Authors for {cartItem.Book.Title}: {authors}");
                    }
                    else
                    {
                        _logger.LogWarning($"No author names found for {cartItem.Book.Title}");
                    }
                }
                else
                {
                    _logger.LogWarning($"No BookAuthors collection for {cartItem.Book.Title}");
                }
                
                orderDetailsBuilder.AppendLine($"<tr>");
                orderDetailsBuilder.AppendLine($"<td>{System.Web.HttpUtility.HtmlEncode(cartItem.Book.Title)}</td>");
                orderDetailsBuilder.AppendLine($"<td>{System.Web.HttpUtility.HtmlEncode(authors)}</td>");
                orderDetailsBuilder.AppendLine($"<td>{cartItem.Quantity}</td>");
                orderDetailsBuilder.AppendLine($"<td>${cartItem.Price:F2}</td>");
                orderDetailsBuilder.AppendLine($"<td>${cartItem.Price * cartItem.Quantity:F2}</td>");
                orderDetailsBuilder.AppendLine($"</tr>");
            }
            
            // Add discount information if applicable
            if (discountAmount > 0)
            {
                orderDetailsBuilder.AppendLine($"<tr><td colspan='4' align='right'><strong>Subtotal:</strong></td><td>${totalAmount + discountAmount:F2}</td></tr>");
                orderDetailsBuilder.AppendLine($"<tr><td colspan='4' align='right'><strong>Discount:</strong></td><td>-${discountAmount:F2}</td></tr>");
            }
            
            orderDetailsBuilder.AppendLine($"<tr><td colspan='4' align='right'><strong>Total:</strong></td><td>${totalAmount - discountAmount:F2}</td></tr>");
            orderDetailsBuilder.AppendLine("</table>");
            
            // Notify the user if the notification service is available
            if (_notificationService != null)
            {
                await _notificationService.SendOrderProcessedNotification(userId, $"Your order has been created successfully! Your claim code is: {order.ClaimCode}");
            }
            
            // Send email notification if email service is available
            if (_emailService != null && !string.IsNullOrEmpty(userEmail))
            {
                try
                {
                    await _emailService.SendOrderConfirmationAsync(
                        userEmail,
                        user.Username,
                        order.Id,
                        order.ClaimCode,
                        order.TotalAmount,
                        orderDetailsBuilder.ToString());
                    
                    _logger.LogInformation($"Order confirmation email sent to {userEmail}");
                }
                catch (Exception ex)
                {
                    // Log the error but don't interrupt the order process
                    _logger.LogError(ex, $"Failed to send order confirmation email: {ex.Message}");
                }
            }
            
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
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == orderId);
                
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
            
            // Return the stock quantities for each book in the order
            foreach (var orderItem in order.OrderItems)
            {
                var book = await _context.Books.FindAsync(orderItem.BookId);
                if (book != null)
                {
                    book.StockQuantity += orderItem.Quantity;
                    _context.Books.Update(book);
                    _logger.LogInformation($"Returned {orderItem.Quantity} units to stock for book ID {book.Id}. New stock quantity: {book.StockQuantity}");
                }
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
            
            // Send email notification if email service is available
            if (_emailService != null && order.User != null && !string.IsNullOrEmpty(order.User.Email))
            {
                try 
                {
                    // Count completed orders for this user (including the one we just processed)
                    var successfulOrdersCount = await _context.Orders
                        .CountAsync(o => o.UserId == order.UserId && o.Status == OrderStatus.Completed);
                    
                    // Calculate orders until next discount
                    int ordersUntilNextDiscount = 10 - (successfulOrdersCount % 10);
                    if (ordersUntilNextDiscount == 10) ordersUntilNextDiscount = 0; // They just earned a discount
                    
                    // If this is a milestone order (10th, 20th, etc.), create a discount for future use if not already done
                    if (successfulOrdersCount % 10 == 0 && ordersUntilNextDiscount == 0)
                    {
                        // Check if a discount has already been created for this milestone
                        var existingDiscount = await _context.UserDiscounts
                            .FirstOrDefaultAsync(ud => ud.UserId == order.UserId && !ud.IsUsed);
                        
                        if (existingDiscount == null)
                        {
                            // Create a new discount for their next purchase
                            var newDiscount = new UserDiscount
                            {
                                UserId = order.UserId,
                                DiscountPercentage = 10,
                                CreatedAt = DateTime.UtcNow,
                                IsUsed = false
                            };
                            _context.UserDiscounts.Add(newDiscount);
                            await _context.SaveChangesAsync();
                            _logger.LogInformation($"Created new 10% loyalty discount for user {order.UserId} after their {successfulOrdersCount}th completed order");
                        }
                    }
                    
                    await _emailService.SendOrderCompletedAsync(
                        order.User.Email,
                        order.User.Username,
                        order.Id,
                        ordersUntilNextDiscount);
                        
                    _logger.LogInformation($"Order completion email sent to {order.User.Email}");
                }
                catch (Exception ex)
                {
                    // Log the error but don't interrupt the order process
                    _logger.LogError(ex, $"Failed to send order completion email: {ex.Message}");
                }
            }
            
            return true;
        }

        // Cancel an order by staff (mark as cancelled)
        public async Task<bool> CancelOrderByStaffAsync(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == orderId);
                
            if (order == null)
                throw new KeyNotFoundException($"Order with ID {orderId} not found");

            if (order.Status != OrderStatus.Pending)
                throw new InvalidOperationException("Only pending orders can be cancelled");
                
            // Return the stock quantities for each book in the order
            foreach (var orderItem in order.OrderItems)
            {
                var book = await _context.Books.FindAsync(orderItem.BookId);
                if (book != null)
                {
                    book.StockQuantity += orderItem.Quantity;
                    _context.Books.Update(book);
                    _logger.LogInformation($"Returned {orderItem.Quantity} units to stock for book ID {book.Id}. New stock quantity: {book.StockQuantity}");
                }
            }

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
