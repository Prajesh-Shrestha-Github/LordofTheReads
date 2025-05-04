using System.ComponentModel.DataAnnotations;

namespace LordofTheReads.DTOs
{
    public class CreateGenreDto
    {
        [Required]
        [StringLength(50)]
        public string Name { get; set; } = null!;
    }
}
