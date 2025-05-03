using System.ComponentModel.DataAnnotations.Schema;

namespace LordofTheReads.Database.Entities
{
    public class BookGenre
    {
        [Column("book_id")]
        public int BookId { get; set; }
        public virtual Book Book { get; set; } = null!;

        [Column("genre_id")]
        public int GenreId { get; set; }
        public virtual Genre Genre { get; set; } = null!;
    }
}
