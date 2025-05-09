using System.ComponentModel.DataAnnotations;

namespace LordofTheReads.DTOs
{
    public class CreateStaffDto
    {
        [Required]
        [StringLength(50, MinimumLength = 3)]
        public required string Username { get; set; }

        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public required string Password { get; set; }

        [Required]
        [StringLength(50)]
        public required string FirstName { get; set; }

        [Required]
        [StringLength(50)]
        public required string LastName { get; set; }

        [StringLength(20)]
        public string? PhoneNumber { get; set; }
    }
}
