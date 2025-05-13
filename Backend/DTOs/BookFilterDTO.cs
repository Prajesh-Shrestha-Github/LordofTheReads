using System.Collections.Generic;

public class BookFilterDTO
{
    // Basic filters
    public string? Category { get; set; } // For genre filtering
    public List<string>? Genres { get; set; } // Multiple genres
    public List<string>? Authors { get; set; } // Multiple authors
    public string? PriceRange { get; set; } // Price range like "10-20"
    public decimal? MinPrice { get; set; } // Minimum price
    public decimal? MaxPrice { get; set; } // Maximum price
    public int? MinRating { get; set; } // Minimum rating
    public int? MaxRating { get; set; } // Maximum rating - for exact star ratings
    
    // Availability filters
    public bool? InStock { get; set; } // Books in stock
    public bool? OnSale { get; set; } // Books on sale/discount
    public bool? PhysicalLibraryAccess { get; set; } // Available in physical library
    
    // Format and language filters
    public string? Language { get; set; } // Book language
    public List<string>? Formats { get; set; } // Book formats (paperback, hardcover, etc.)
    
    // Publisher filter
    public string? Publisher { get; set; }
    
    // Search and category tabs
    public string? SearchQuery { get; set; } // Search by title, ISBN, or description
    public string? CategoryTab { get; set; } // All Books, Bestsellers, Award Winners, etc.
    
    // Date filters for New Releases and New Arrivals
    public bool? IsNewRelease { get; set; } // Published in the last 3 months
    public bool? IsNewArrival { get; set; } // Listed in the last month
    public bool? IsComingSoon { get; set; } // Future publication date
    public bool? IsAwardWinning { get; set; } // Award-winning books
    
    // Sorting
    public string? SortBy { get; set; } // title_asc, title_desc, price_asc, price_desc, date_desc, popularity
    
    // Pagination
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 12;
    
    // Total count (for pagination)
    public int TotalCount { get; set; }
}