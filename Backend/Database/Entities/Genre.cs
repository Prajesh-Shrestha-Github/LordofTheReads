using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LordofTheReads.Database.Entities
{
    public class Genre
    {
        [Key]
        [Column("genre_id")]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public required string Name { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }

        // Navigation property
        public virtual ICollection<BookGenre> BookGenres { get; set; } = new List<BookGenre>();
    }
}
