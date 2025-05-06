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
        public string? ImageUrl { get; set; } = "https://placehold.co/300x450?text=No+Cover";
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}