using LordofTheReads.Database.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LordofTheReads.Services
{
    public interface IBookmarkService
    {
        Task<IEnumerable<Bookmark>> GetBookmarksAsync(int userId);
        Task<Bookmark> AddBookmarkAsync(int userId, int bookId);
        Task RemoveBookmarkAsync(int userId, int bookId);
        Task<bool> IsBookmarkedAsync(int userId, int bookId);
        Task ClearBookmarksAsync(int userId);
    }
}