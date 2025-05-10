using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LordofTheReads.Database.Entities
{
    public class CartItem
    {
        [Key]
        [Column("cart_item_id")]
        public int Id { get; set; }

        [Column("cart_id")]
        public int CartId { get; set; }
        public virtual Cart Cart { get; set; } = null!;

        [Column("book_id")]
        public int BookId { get; set; }
        public virtual Book Book { get; set; } = null!;

        [Required]
        public int Quantity { get; set; } = 1;

        [Column("price", TypeName = "decimal(10, 2)")]
        [Required]
        public decimal Price { get; set; }

        [Column("added_at")]
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }
}
