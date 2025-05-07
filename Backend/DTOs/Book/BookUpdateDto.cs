using System.ComponentModel.DataAnnotations;
using LordofTheReads.DTOs.Author;
using LordofTheReads.DTOs.Genre;

namespace LordofTheReads.DTOs.Book
{
    public class BookUpdateDto
    {
        [Required]
        [StringLength(255)]
        public required string Title { get; set; }

        [StringLength(20)]
        public string? ISBN { get; set; }

        public string? Description { get; set; }

        [Required]
        [Range(0, 9999.99)]
        public decimal Price { get; set; }

        public DateTime? PublicationDate { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }

        [StringLength(100)]
        public string? Publisher { get; set; }

        [StringLength(255)]
        [Url]
        public string? ImageUrl { get; set; }

        [StringLength(50)]
        public string? Language { get; set; }

        [StringLength(100)]
        public string? Format { get; set; }

        public List<int>? AuthorIds { get; set; }
        
        public List<int>? GenreIds { get; set; }
        
        // New properties for creating authors and genres directly during book update
        public List<AuthorCreateDto>? NewAuthors { get; set; }
        
        public List<GenreCreateDto>? NewGenres { get; set; }
    }
}
