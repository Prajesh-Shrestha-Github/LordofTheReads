namespace LordofTheReads.DTOs.Book
{
    public class BookDetailDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? ISBN { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public DateTime? PublicationDate { get; set; }
        public int StockQuantity { get; set; }
        public string? Publisher { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        public List<AuthorDto> Authors { get; set; } = new List<AuthorDto>();
        public List<GenreDto> Genres { get; set; } = new List<GenreDto>();
        public List<DiscountDto>? Discounts { get; set; }
    }

    public class AuthorDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class GenreDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class DiscountDto
    {
        public int Id { get; set; }
        public decimal DiscountPercentage { get; set; }
        public bool OnSaleFlag { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
