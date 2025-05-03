using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LordofTheReads.Database.Entities
{
    public class OrderItem
    {
        [Key]
        [Column("order_item_id")]
        public int Id { get; set; }

        [Column("order_id")]
        public int OrderId { get; set; }
        public virtual Order Order { get; set; } = null!;

        [Column("book_id")]
        public int BookId { get; set; }
        public virtual Book Book { get; set; } = null!;

        [Required]
        public int Quantity { get; set; }

        [Required]
        [Column("price_at_purchase", TypeName = "decimal(10, 2)")]
        public decimal PriceAtPurchase { get; set; }
    }
}
