using System.ComponentModel.DataAnnotations;

namespace LordofTheReads.DTOs
{
    public class ProcessOrderDto
    {
        [Required]
        public string ClaimCode { get; set; } = string.Empty;
    }
}
