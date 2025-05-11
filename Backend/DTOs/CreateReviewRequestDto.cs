using System.ComponentModel.DataAnnotations;

namespace LordofTheReads.DTOs
{
    public class CreateReviewRequestDto
    {
        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [Required]
        public string Comment { get; set; }
    }
}
