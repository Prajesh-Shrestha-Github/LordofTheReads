using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace LordofTheReads.Hubs
{
    public class NotificationHub : Hub
    {
        // Store user connections
        private static readonly ConcurrentDictionary<string, string> UserConnections = new ConcurrentDictionary<string, string>();

        // Register connection when a user connects
        public async Task RegisterConnection(string userId)
        {
            UserConnections[userId] = Context.ConnectionId;
            await Task.CompletedTask;
        }

        // Override OnConnectedAsync to handle connection
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        // Override OnDisconnectedAsync to handle disconnection
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            // Remove the connection ID when user disconnects
            foreach (var pair in UserConnections.Where(p => p.Value == Context.ConnectionId).ToList())
            {
                UserConnections.TryRemove(pair.Key, out _);
            }
            
            await base.OnDisconnectedAsync(exception);
        }

        // Get connection ID for a user
        public static string GetConnectionIdForUser(string userId)
        {
            UserConnections.TryGetValue(userId, out var connectionId);
            return connectionId;
        }

        // Send notification to a specific user
        public async Task SendOrderProcessedNotification(string userId, string message)
        {
            string connectionId = GetConnectionIdForUser(userId);
            if (!string.IsNullOrEmpty(connectionId))
            {
                await Clients.Client(connectionId).SendAsync("ReceiveOrderProcessedNotification", message);
            }
        }

        // Broadcast notification to all users
        public async Task SendBroadcastNotification(string message)
        {
            await Clients.All.SendAsync("ReceiveBroadcastNotification", message);
        }
    }
}
