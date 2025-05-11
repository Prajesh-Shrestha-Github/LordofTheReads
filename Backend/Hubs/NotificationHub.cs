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
            Console.WriteLine($"[NotificationHub] RegisterConnection: user {userId}, conn {Context.ConnectionId}");
            UserConnections[userId] = Context.ConnectionId;
            Console.WriteLine($"[NotificationHub] Adding connection {Context.ConnectionId} to group {userId}");
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
            Console.WriteLine($"[NotificationHub] Added connection {Context.ConnectionId} to group {userId}");
        }

        // Override OnConnectedAsync to handle connection
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        // Override OnDisconnectedAsync to handle disconnection
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            Console.WriteLine($"[NotificationHub] OnDisconnected: connection {Context.ConnectionId}");
            // Remove the connection ID when user disconnects
            foreach (var pair in UserConnections.Where(p => p.Value == Context.ConnectionId).ToList())
            {
                UserConnections.TryRemove(pair.Key, out _);
                Console.WriteLine($"[NotificationHub] Removing connection {Context.ConnectionId} from group {pair.Key}");
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, pair.Key);
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
            Console.WriteLine($"[NotificationHub] Sending to group {userId}: {message}");
            await Clients.Group(userId)
                .SendAsync("ReceiveOrderProcessedNotification", message);
        }

        // Broadcast notification to all users
        public async Task SendBroadcastNotification(string message)
        {
            await Clients.All.SendAsync("ReceiveBroadcastNotification", message);
        }
    }
}
