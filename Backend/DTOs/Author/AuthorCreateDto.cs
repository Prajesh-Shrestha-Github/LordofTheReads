using System.ComponentModel.DataAnnotations;

namespace LordofTheReads.DTOs.Author
{
    public class AuthorCreateDto
    {
        [Required]
        [StringLength(100)]
        public required string Name { get; set; }
    }
}
