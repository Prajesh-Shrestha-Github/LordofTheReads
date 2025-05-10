using System.Threading.Tasks;

namespace LordofTheReads.Services
{
    public interface IEmailService
    {
        Task SendOrderConfirmationAsync(string email, string username, int orderId, string claimCode, decimal totalAmount, string orderDetails);
        Task SendOrderCompletedAsync(string email, string username, int orderId);
    }
}
