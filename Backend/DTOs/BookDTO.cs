// Backend/DTOs/BookDTO.cs
using System;
using System.Collections.Generic;

namespace LordofTheReads.DTOs
{
    public class BookDTO
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? ISBN { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public DateTime? PublicationDate { get; set; }
        public int StockQuantity { get; set; }
        public string? Publisher { get; set; }
        public List<string> Authors { get; set; } = new List<string>();
        public List<string> Genres { get; set; } = new List<string>();
        public string CoverImageUrl { get; set; } = "https://via.placeholder.com/300x450";
    }
}