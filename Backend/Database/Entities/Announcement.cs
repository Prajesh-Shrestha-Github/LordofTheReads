using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LordofTheReads.Database.Entities
{
    public class Announcement
    {
        [Key]
        [Column("announcement_id")]
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public required string Title { get; set; }

        [Required]
        public required string Content { get; set; }

        [Required]
        [Column("start_date")]
        public DateTime StartDate { get; set; } = DateTime.UtcNow;

        [Column("end_date")]
        public DateTime? EndDate { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;
    }
}
