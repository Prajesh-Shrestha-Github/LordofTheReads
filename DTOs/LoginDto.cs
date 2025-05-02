using System.ComponentModel.DataAnnotations;

namespace LordofTheReads.DTOs
{
    public class LoginDto
    {
        [Required]
        public required string UsernameOrEmail { get; set; }

        [Required]
        public required string Password { get; set; }
    }
}
