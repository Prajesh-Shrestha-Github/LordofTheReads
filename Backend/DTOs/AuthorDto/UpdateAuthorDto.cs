using System.ComponentModel.DataAnnotations;

namespace LordofTheReads.DTOs
{
    public class UpdateAuthorDto
    {
        [Required]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = null!;
    }
}
