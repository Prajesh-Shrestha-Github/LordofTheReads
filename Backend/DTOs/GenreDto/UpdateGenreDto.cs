using System.ComponentModel.DataAnnotations;

namespace LordofTheReads.DTOs
{
    public class UpdateGenreDto
    {
        [Required]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; } = null!;
    }
}
