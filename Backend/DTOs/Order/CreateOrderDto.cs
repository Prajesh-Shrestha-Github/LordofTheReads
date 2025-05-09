using System.ComponentModel.DataAnnotations;

namespace LordofTheReads.DTOs.Order
{
    public class CreateOrderDto
    {
        [Required]
        public int UserId { get; set; }
        
        // Optional note for the order
        public string? Note { get; set; }
    }
}
