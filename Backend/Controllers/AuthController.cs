using LordofTheReads.Database;
using LordofTheReads.Database.Entities;
using LordofTheReads.DTOs;
using LordofTheReads.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LordofTheReads.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<AuthController> _logger;
        private readonly TokenService _tokenService;
        private readonly PasswordService _passwordService;

        public AuthController(AppDbContext context, ILogger<AuthController> logger, TokenService tokenService, PasswordService passwordService)
        {
            _context = context;
            _logger = logger;
            _tokenService = tokenService;
            _passwordService = passwordService;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            try
            {
                // Check if username already exists
                if (await UsernameExists(registerDto.Username))
                    return BadRequest("Username already taken. Please choose a different username.");
                
                // Check if email already exists
                if (await EmailExists(registerDto.Email))
                    return BadRequest("Email already registered. Please use a different email address.");

                // Hash the password before storing
                var hashedPassword = _passwordService.HashPassword(registerDto.Password);
                
                var user = new User
                {
                    Username = registerDto.Username,
                    Email = registerDto.Email,
                    PasswordHash = hashedPassword,
                    FirstName = registerDto.FirstName,
                    LastName = registerDto.LastName,
                    PhoneNumber = registerDto.PhoneNumber,
                    Role = registerDto.Role,
                    RegistrationDate = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Generate JWT token
                var token = _tokenService.CreateToken(user);
                
                return new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    PhoneNumber = user.PhoneNumber,
                    Role = user.Role,
                    RegistrationDate = user.RegistrationDate,
                    Token = token
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration");
                return StatusCode(500, "An error occurred during registration. Please try again later.");
            }
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            try
            {
                // Look for user by username or email
                var user = await _context.Users
                    .SingleOrDefaultAsync(u => 
                        u.Username == loginDto.UsernameOrEmail ||
                        u.Email == loginDto.UsernameOrEmail);

                if (user == null) return Unauthorized("Invalid username or password");

                // Verify password using the password service
                if (!_passwordService.VerifyPassword(loginDto.Password, user.PasswordHash))
                {
                    return Unauthorized("Invalid username or password");
                }

                // Generate JWT token
                var token = _tokenService.CreateToken(user);
                
                return new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    PhoneNumber = user.PhoneNumber,
                    Role = user.Role,
                    RegistrationDate = user.RegistrationDate,
                    Token = token
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user login");
                return StatusCode(500, "An error occurred during login. Please try again later.");
            }
        }

        private async Task<bool> UsernameExists(string username)
        {
            return await _context.Users.AnyAsync(u => u.Username.ToLower() == username.ToLower());
        }

        private async Task<bool> EmailExists(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email.ToLower() == email.ToLower());
        }

        private async Task<bool> UserExists(string username, string email)
        {
            return await _context.Users.AnyAsync(u => 
                u.Username.ToLower() == username.ToLower() || 
                u.Email.ToLower() == email.ToLower());
        }
    }
}
