using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LordofTheReads.DTOs.Order;
using LordofTheReads.Database.Entities;
using LordofTheReads.Services;
using LordofTheReads.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace LordofTheReads.Controllers
{
    [ApiController]
    [Route("api/staff/orders")]
    [Authorize(Roles = "Staff,Admin")]
    public class StaffOrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ILogger<StaffOrderController> _logger;

        public StaffOrderController(IOrderService orderService, ILogger<StaffOrderController> logger)
        {
            _orderService = orderService;
            _logger = logger;
        }

        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetPendingOrders()
        {
            try
            {
                var orders = await _orderService.GetPendingOrdersAsync();
                var dtos = orders.Select(MapOrderToDto);
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching pending orders");
                return StatusCode(500, new { message = "An error occurred while retrieving pending orders.", error = ex.Message });
            }
        }

        [HttpPost("{id}/process")]
        public async Task<ActionResult> ProcessOrder(int id, [FromBody] ProcessOrderDto dto)
        {
            try
            {
                var success = await _orderService.ProcessOrderAsync(id, dto.ClaimCode);
                if (success)
                    return Ok(new { message = "Order processed successfully." });
                return BadRequest(new { message = "Failed to process order." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error processing order {id}");
                return StatusCode(500, new { message = "An error occurred while processing the order.", error = ex.Message });
            }
        }

        [HttpPost("{id}/cancel")]
        public async Task<ActionResult> CancelOrder(int id)
        {
            try
            {
                var success = await _orderService.CancelOrderByStaffAsync(id);
                if (success)
                    return Ok(new { message = "Order cancelled successfully." });
                return BadRequest(new { message = "Failed to cancel order." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error cancelling order {id}");
                return StatusCode(500, new { message = "An error occurred while cancelling the order.", error = ex.Message });
            }
        }

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
