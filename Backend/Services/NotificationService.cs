using System.Threading.Tasks;
using LordofTheReads.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace LordofTheReads.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendOrderProcessedNotification(int userId, string message)
        {
            string connectionId = NotificationHub.GetConnectionIdForUser(userId.ToString());
            if (!string.IsNullOrEmpty(connectionId))
            {
                await _hubContext.Clients.Client(connectionId)
                    .SendAsync("ReceiveOrderProcessedNotification", message);
            }
            else
            {
                // Fallback to broadcast if user connection not found
                await _hubContext.Clients.All
                    .SendAsync("ReceiveBroadcastNotification", $"Order notification: {message}");
            }
        }

        public async Task BroadcastNewBookNotification(string bookTitle, string authorName)
        {
            var message = $"New book available: {bookTitle} by {authorName}!";
            await _hubContext.Clients.All.SendAsync("ReceiveBroadcastNotification", message);
        }
    }
}
