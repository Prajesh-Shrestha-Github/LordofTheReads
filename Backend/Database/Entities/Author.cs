using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LordofTheReads.Database.Entities
{
    public class Author
    {
        [Key]
        [Column("author_id")]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public required string Name { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }

        // Navigation property
        public virtual ICollection<BookAuthor> BookAuthors { get; set; } = new List<BookAuthor>();
    }
}
