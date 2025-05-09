using LordofTheReads.Database.Entities;
using LordofTheReads.DTOs.Order;
using LordofTheReads.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace LordofTheReads.Controllers
{
    [ApiController]
    [Route("api/order")]
    [Authorize] // Require authentication for all order operations
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ILogger<OrderController> _logger;

        public OrderController(IOrderService orderService, ILogger<OrderController> logger)
        {
            _orderService = orderService;
            _logger = logger;
        }

        // Helper method to get the current user's ID from the JWT token
        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                _logger.LogError("User ID claim not found in token");
                throw new UnauthorizedAccessException("User not authenticated or missing user ID claim");
            }
            
            if (!int.TryParse(userIdClaim, out int userId))
            {
                _logger.LogError($"Invalid user ID format in token: {userIdClaim}");
                throw new UnauthorizedAccessException("Invalid user ID format in token");
            }
            return userId;
        }

        // Create a new order from the user's cart
        [HttpPost]
        public async Task<ActionResult<OrderDto>> CreateOrder()
        {
            try
            {
                _logger.LogInformation("Creating new order from cart");
                var userId = GetUserId();
                _logger.LogInformation($"User ID: {userId}");
                
                var order = await _orderService.CreateOrderFromCartAsync(userId);
                _logger.LogInformation($"Order created successfully with ID: {order.Id}");
                
                // Map order to DTO
                var orderDto = MapOrderToDto(order);
                
                return Ok(orderDto);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt when creating order");
                return Unauthorized(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Resource not found when creating order");
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation when creating order");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error creating order");
                return StatusCode(500, new { message = "An error occurred while creating your order", error = ex.Message });
            }
        }

        // Get a specific order by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDto>> GetOrder(int id)
        {
            try
            {
                var userId = GetUserId();
                var order = await _orderService.GetOrderByIdAsync(id, userId);
                
                // Map order to DTO
                var orderDto = MapOrderToDto(order);
                
                return Ok(orderDto);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving order {id}");
                return StatusCode(500, "An error occurred while retrieving the order");
            }
        }

        // Get all orders for the current user
        [HttpGet]
        public async Task<ActionResult<List<OrderDto>>> GetUserOrders()
        {
            try
            {
                var userId = GetUserId();
                var orders = await _orderService.GetUserOrdersAsync(userId);
                
                // Map orders to DTOs
                var orderDtos = orders.Select(MapOrderToDto).ToList();
                
                return Ok(orderDtos);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user orders");
                return StatusCode(500, "An error occurred while retrieving your orders");
            }
        }

        // Cancel an order
        [HttpPost("{id}/cancel")]
        public async Task<ActionResult> CancelOrder(int id)
        {
            try
            {
                var userId = GetUserId();
                var success = await _orderService.CancelOrderAsync(id, userId);
                
                if (success)
                {
                    return Ok(new { message = "Order cancelled successfully" });
                }
                else
                {
                    return BadRequest("Failed to cancel order");
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error cancelling order {id}");
                return StatusCode(500, "An error occurred while cancelling the order");
            }
        }

        // Helper method to map Order entity to OrderDto
        private OrderDto MapOrderToDto(Order order)
        {
            return new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                UserName = order.User?.Username ?? "Unknown",
                UserEmail = order.User?.Email ?? "Unknown",
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                DiscountAmount = order.DiscountAmount,
                Status = order.Status,
                ClaimCode = order.ClaimCode,
                IsCancelled = order.IsCancelled,
                CancellationDate = order.CancellationDate,
                OrderItems = order.OrderItems.Select(item => new OrderItemDto
                {
                    Id = item.Id,
                    BookId = item.BookId,
                    BookTitle = item.Book?.Title ?? "Unknown Book",
                    BookImageUrl = item.Book?.ImageUrl ?? "/placeholder-book.png",
                    Authors = string.Join(", ", item.Book?.BookAuthors?.Select(ba => ba.Author?.Name) ?? new List<string>()),
                    Quantity = item.Quantity,
                    PriceAtPurchase = item.PriceAtPurchase
                }).ToList()
            };
        }
    }
}
