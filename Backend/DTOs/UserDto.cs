using LordofTheReads.Database.Entities;

namespace LordofTheReads.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public UserRole Role { get; set; }
        public DateTime RegistrationDate { get; set; }
        public string Token { get; set; } = string.Empty;
    }
}
