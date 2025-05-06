using LordofTheReads.Database.Entities;
using LordofTheReads.DTOs;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace LordofTheReads.Services
{
    public interface ICartService
    {
        Task<Cart> GetCartAsync(int userId);
        Task<Cart> GetCartWithItemsAsync(int userId);
        Task<CartItem> AddToCartAsync(int userId, int bookId, int quantity);
        Task<CartItem> UpdateCartItemAsync(int userId, int bookId, int quantity);
        Task RemoveFromCartAsync(int userId, int bookId);
        Task ClearCartAsync(int userId);
    }
}