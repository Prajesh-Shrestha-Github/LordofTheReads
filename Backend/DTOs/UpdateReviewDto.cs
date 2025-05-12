using System.ComponentModel.DataAnnotations;

namespace LordofTheReads.DTOs
{
    public class UpdateReviewDto
    {
        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }
        
        public string? Comment { get; set; }
    }
}
