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
            // Send notification to the user-specific group
            var groupName = userId.ToString();
            await _hubContext.Clients.Group(groupName)
                .SendAsync("ReceiveOrderProcessedNotification", message);
        }

        public async Task BroadcastNewBookNotification(string bookTitle, string authorName)
        {
            var message = $"New book available: {bookTitle} by {authorName}!";
            await _hubContext.Clients.All.SendAsync("ReceiveBroadcastNotification", message);
        }
    }
}
