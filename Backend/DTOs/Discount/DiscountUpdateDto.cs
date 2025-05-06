using System.ComponentModel.DataAnnotations;

namespace LordofTheReads.DTOs.Discount
{
    public class DiscountUpdateDto
    {
        [Required]
        [Range(0, 100)]
        public decimal DiscountPercentage { get; set; }
        
        [Required]
        public bool OnSaleFlag { get; set; }
        
        [Required]
        public DateTime StartDate { get; set; }
        
        public DateTime? EndDate { get; set; }
    }
}
