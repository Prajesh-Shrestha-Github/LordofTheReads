using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LordofTheReads.Database.Entities
{
    public class Review
    {
        [Key]
        [Column("review_id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }
        public virtual User User { get; set; } = null!;

        [Column("book_id")]
        public int BookId { get; set; }
        public virtual Book Book { get; set; } = null!;

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        public string? Comment { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
