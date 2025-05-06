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

        // Remove Column attribute and make nullable to avoid issues with missing database columns
        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        // Navigation property
        public virtual ICollection<BookAuthor> BookAuthors { get; set; } = new List<BookAuthor>();
    }
}
