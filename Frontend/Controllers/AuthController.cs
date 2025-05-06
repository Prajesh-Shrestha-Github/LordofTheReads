using LordofTheReads.Database;
using LordofTheReads.Database.Entities;
using LordofTheReads.DTOs;
using LordofTheReads.Services;
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

        public AuthController(AppDbContext context, ILogger<AuthController> logger, TokenService tokenService)
        {
            _context = context;
            _logger = logger;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            if (await UserExists(registerDto.Username, registerDto.Email))
                return BadRequest("Username or email already exists");

            // Store password as plain text for simplicity (NOT FOR PRODUCTION USE!)
            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                PasswordHash = registerDto.Password, // NOT secure, just for demo
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Generate real JWT token
            var token = _tokenService.CreateToken(user);
            
            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Token = token
            };
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            // Look for user by username or email
            var user = await _context.Users
                .SingleOrDefaultAsync(u => 
                    u.Username == loginDto.UsernameOrEmail ||
                    u.Email == loginDto.UsernameOrEmail);

            if (user == null) return Unauthorized("Invalid username or password");

            // Simple password check (NOT FOR PRODUCTION USE!)
            if (user.PasswordHash != loginDto.Password)
            {
                return Unauthorized("Invalid username or password");
            }

            // Generate real JWT token
            var token = _tokenService.CreateToken(user);
            
            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Token = token
            };
        }

        private async Task<bool> UserExists(string username, string email)
        {
            return await _context.Users.AnyAsync(u => 
                u.Username.ToLower() == username.ToLower() || 
                u.Email.ToLower() == email.ToLower());
        }
    }
}
    