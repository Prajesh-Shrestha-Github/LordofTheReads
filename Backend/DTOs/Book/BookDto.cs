using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LordofTheReads.DTOs.Book
{
    public class BookDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? ISBN { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public DateTime? PublicationDate { get; set; }
        public int StockQuantity { get; set; }
        public string? Publisher { get; set; }
        public string? ImageUrl { get; set; }
        public string? Language { get; set; }
        public string? Format { get; set; }
        public bool PhysicalLibraryAccess { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<string> Authors { get; set; } = new List<string>();
    }
}
