using LordofTheReads.Database;
using LordofTheReads.Database.Entities;
using LordofTheReads.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace LordofTheReads.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Require authentication for all cart operations
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;
        private readonly ILogger<CartController> _logger;

        public CartController(ICartService cartService, ILogger<CartController> logger)
        {
            _cartService = cartService;
            _logger = logger;
        }

        // Helper method to get the current user's ID from the JWT token
        private int GetUserId()
        {
            try
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting user ID from token");
                throw new UnauthorizedAccessException("Failed to authenticate user: " + ex.Message);
            }
        }

        // Get cart items
        [HttpGet]
        [AllowAnonymous] // Allow even without auth to improve error handling
        public async Task<ActionResult<Cart>> GetCart()
        {
            try
            {
                // Check if user is authenticated first
                if (!User.Identity.IsAuthenticated)
                {
                    _logger.LogWarning("Attempted to access cart without authentication");
                    return Unauthorized("User not authenticated");
                }
                
                var userId = GetUserId();
                var cart = await _cartService.GetCartWithItemsAsync(userId);
                return Ok(cart);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized cart access");
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving cart");
                return StatusCode(500, ex.Message);
            }
        }

        // Add item to cart
        [HttpPost("items")]
        [AllowAnonymous] // Allow even without auth to improve error handling
        public async Task<ActionResult> AddToCart([FromBody] AddToCartRequest request)
        {
            try
            {
                // Check if user is authenticated first
                if (!User.Identity.IsAuthenticated)
                {
                    _logger.LogWarning("Attempted to add to cart without authentication");
                    return Unauthorized("User not authenticated");
                }
                
                var userId = GetUserId();
                await _cartService.AddToCartAsync(userId, request.BookId, request.Quantity);
                return Ok();
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized cart access");
                return Unauthorized(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding item to cart");
                return StatusCode(500, ex.Message);
            }
        }

        // Update cart item quantity
        [HttpPut("items/{bookId}")]
        public async Task<ActionResult> UpdateCartItem(int bookId, [FromBody] UpdateCartItemRequest request)
        {
            try
            {
                var userId = GetUserId();
                await _cartService.UpdateCartItemAsync(userId, bookId, request.Quantity);
                return Ok();
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
                _logger.LogError(ex, "Error updating cart item");
                return StatusCode(500, "An error occurred while updating the cart item");
            }
        }

        // Remove item from cart
        [HttpDelete("items/{bookId}")]
        public async Task<ActionResult> RemoveFromCart(int bookId)
        {
            try
            {
                var userId = GetUserId();
                await _cartService.RemoveFromCartAsync(userId, bookId);
                return Ok();
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
                _logger.LogError(ex, "Error removing item from cart");
                return StatusCode(500, "An error occurred while removing the item from your cart");
            }
        }

        // Clear cart
        [HttpDelete]
        public async Task<ActionResult> ClearCart()
        {
            try
            {
                var userId = GetUserId();
                await _cartService.ClearCartAsync(userId);
                return Ok();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing cart");
                return StatusCode(500, "An error occurred while clearing your cart");
            }
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