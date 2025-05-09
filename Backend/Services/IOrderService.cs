using LordofTheReads.Database.Entities;
using LordofTheReads.DTOs.Order;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LordofTheReads.Services
{
    public interface IOrderService
    {
        Task<Order> CreateOrderFromCartAsync(int userId);
        Task<Order> GetOrderByIdAsync(int orderId, int userId);
        Task<List<Order>> GetUserOrdersAsync(int userId);
        Task<bool> CancelOrderAsync(int orderId, int userId);
        Task<List<Order>> GetPendingOrdersAsync();
        Task<bool> ProcessOrderAsync(int orderId, string claimCode);
        Task<bool> CancelOrderByStaffAsync(int orderId);
        Task<string> GenerateClaimCodeAsync();
    }
}
