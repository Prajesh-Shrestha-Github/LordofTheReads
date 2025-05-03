using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LordofTheReads.Database.Entities
{
    public class Cart
    {
        [Key]
        [Column("cart_id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }
        public virtual User User { get; set; } = null!;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    }
}
