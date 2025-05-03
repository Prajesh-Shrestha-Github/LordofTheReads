using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LordofTheReads.Database.Entities
{
    public class UserDiscount
    {
        [Key]
        [Column("user_discount_id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }
        public virtual User User { get; set; } = null!;

        [Required]
        [Column("discount_percentage", TypeName = "decimal(5, 2)")]
        [Range(0, 100)]
        public decimal DiscountPercentage { get; set; } = 10.00m;

        [Column("is_used")]
        public bool IsUsed { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("used_at")]
        public DateTime? UsedAt { get; set; }
    }
}
