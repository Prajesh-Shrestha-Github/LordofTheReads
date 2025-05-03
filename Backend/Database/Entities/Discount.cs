using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LordofTheReads.Database.Entities
{
    public class Discount
    {
        [Key]
        [Column("discount_id")]
        public int Id { get; set; }

        [Column("book_id")]
        public int BookId { get; set; }
        public virtual Book Book { get; set; } = null!;

        [Required]
        [Column("discount_percentage", TypeName = "decimal(5, 2)")]
        [Range(0, 100)]
        public decimal DiscountPercentage { get; set; }

        [Column("on_sale_flag")]
        public bool OnSaleFlag { get; set; } = false;

        [Required]
        [Column("start_date")]
        public DateTime StartDate { get; set; } = DateTime.UtcNow;

        [Column("end_date")]
        public DateTime? EndDate { get; set; }
    }
}
