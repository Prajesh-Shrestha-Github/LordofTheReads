using System.ComponentModel.DataAnnotations;

namespace LordofTheReads.DTOs.Genre
{
    public class GenreCreateDto
    {
        [Required]
        [StringLength(50)]
        public required string Name { get; set; }
    }
}
