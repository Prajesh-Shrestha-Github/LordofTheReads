// Backend/Services/IBookService.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using LordofTheReads.DTOs.Book;

namespace LordofTheReads.Services
{
    public interface IBookService
    {
        Task<IEnumerable<BookDto>> GetBooksAsync();
        Task<BookDto> GetBookByIdAsync(int id);
        Task<(IEnumerable<BookDto> Books, int TotalCount)> FilterBooksAsync(BookFilterDTO filter);
    }
}