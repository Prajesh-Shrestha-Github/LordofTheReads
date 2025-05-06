using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LordofTheReads.Database.Entities
{
    public class Book
    {
        [Key]
        [Column("book_id")]
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public required string Title { get; set; }

        [StringLength(20)]
        public string? ISBN { get; set; }

        public string? Description { get; set; }

        [Required]
        [Column(TypeName = "decimal(10, 2)")]
        public decimal Price { get; set; }

        [Column("publication_date")]
        public DateTime? PublicationDate { get; set; }

        [Required]
        [Column("stock_quantity")]
        public int StockQuantity { get; set; } = 0;

        [StringLength(100)]
        public string? Publisher { get; set; }
        
        [StringLength(255)]
        [Column("image_url")]
        public string? ImageUrl { get; set; }

        // Temporarily comment out this property until we add the column to the database
        // [StringLength(500)]
        // [Column("cover_image_url")]
        // public string? CoverImageUrl { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<BookAuthor> BookAuthors { get; set; } = new List<BookAuthor>();
        public virtual ICollection<BookGenre> BookGenres { get; set; } = new List<BookGenre>();
        public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
        public virtual ICollection<Bookmark> Bookmarks { get; set; } = new List<Bookmark>();
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
        public virtual ICollection<Discount> Discounts { get; set; } = new List<Discount>();
    }
}