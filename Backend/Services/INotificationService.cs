using System.Threading.Tasks;

namespace LordofTheReads.Services
{
    public interface INotificationService
    {
        Task SendOrderProcessedNotification(int userId, string message);
        Task BroadcastNewBookNotification(string bookTitle, string authorName);
    }
}
