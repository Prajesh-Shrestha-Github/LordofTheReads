namespace LordofTheReads.DTOs.Discount
{
    public class DiscountDto
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public decimal DiscountPercentage { get; set; }
        public bool OnSaleFlag { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsActive { get; set; }
    }
}
