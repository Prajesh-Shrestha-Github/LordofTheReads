// Backend/Services/IBookService.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using LordofTheReads.DTOs;

namespace LordofTheReads.Services
{
    public interface IBookService
    {
        Task<IEnumerable<BookDTO>> GetBooksAsync();
        Task<BookDTO> GetBookByIdAsync(int id);
    }
}