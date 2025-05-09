using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LordofTheReads.DTOs;
using LordofTheReads.Database.Entities;
using LordofTheReads.Database;
using LordofTheReads.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace LordofTheReads.Controllers
{
    [ApiController]
    [Route("api/admin/staff")]
    [Authorize(Roles = "Admin")]
    public class AdminStaffController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PasswordService _passwordService;
        private readonly ILogger<AdminStaffController> _logger;

        public AdminStaffController(AppDbContext context, PasswordService passwordService, ILogger<AdminStaffController> logger)
        {
            _context = context;
            _passwordService = passwordService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AdminUserDto>>> GetStaff()
        {
            var staff = await _context.Users
                .Where(u => u.Role == UserRole.Staff)
                .Select(u => new AdminUserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    PhoneNumber = u.PhoneNumber,
                    Role = u.Role,
                    RegistrationDate = u.RegistrationDate
                })
                .ToListAsync();

            return Ok(staff);
        }

        [HttpPost]
        public async Task<ActionResult<AdminUserDto>> CreateStaff(CreateStaffDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Username.ToLower() == dto.Username.ToLower()))
                return BadRequest(new { message = "Username already taken." });

            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
                return BadRequest(new { message = "Email already registered." });

            var hashedPassword = _passwordService.HashPassword(dto.Password);

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = hashedPassword,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                PhoneNumber = dto.PhoneNumber,
                Role = UserRole.Staff,
                RegistrationDate = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var resultDto = new AdminUserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role,
                RegistrationDate = user.RegistrationDate
            };

            return CreatedAtAction(nameof(GetStaff), new { id = user.Id }, resultDto);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteStaff(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null || user.Role != UserRole.Staff)
                return NotFound(new { message = "Staff not found." });

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
