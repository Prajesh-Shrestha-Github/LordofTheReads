using System.Collections.Generic;

namespace LordofTheReads.DTOs
{
    public class AuthorDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }

        // Optional: include list of books
        public List<string>? BookTitles { get; set; }
    }
}
