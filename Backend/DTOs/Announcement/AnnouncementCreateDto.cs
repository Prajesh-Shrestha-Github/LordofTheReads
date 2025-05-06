using System.ComponentModel.DataAnnotations;

namespace LordofTheReads.DTOs.Announcement
{
    public class AnnouncementCreateDto
    {
        [Required]
        [StringLength(255)]
        public required string Title { get; set; }
        
        [Required]
        public required string Content { get; set; }
        
        [Required]
        public DateTime StartDate { get; set; }
        
        public DateTime? EndDate { get; set; }
    }
}
