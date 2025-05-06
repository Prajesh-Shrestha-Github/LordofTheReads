using System.ComponentModel.DataAnnotations;

namespace LordofTheReads.DTOs
{
    public class CreateAuthorDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = null!;
    }
}
