using System.Security.Cryptography;
using System.Text;

namespace LordofTheReads.Services
{
    public class PasswordService
    {
        public string HashPassword(string password)
        {
            // Use SHA-512 for hashing (matches the JWT HMAC-SHA512 algorithm)
            using var sha512 = SHA512.Create();
            var passwordBytes = Encoding.UTF8.GetBytes(password);
            var hashBytes = sha512.ComputeHash(passwordBytes);
            
            // Convert byte array to a string
            return Convert.ToBase64String(hashBytes);
        }

        public bool VerifyPassword(string providedPassword, string storedHash)
        {
            // Hash the provided password
            var hashedProvidedPassword = HashPassword(providedPassword);
            
            // Compare the hashed provided password with the stored hash
            return hashedProvidedPassword == storedHash;
        }
    }
}
