using System.ComponentModel.DataAnnotations.Schema;

namespace LordofTheReads.Database.Entities
{
    public class BookAuthor
    {
        [Column("book_id")]
        public int BookId { get; set; }
        public virtual Book Book { get; set; } = null!;

        [Column("author_id")]
        public int AuthorId { get; set; }
        public virtual Author Author { get; set; } = null!;
    }
}
