using LordofTheReads.Database.Entities;
using Microsoft.EntityFrameworkCore;

namespace LordofTheReads.Database
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Book> Books { get; set; }
        public DbSet<Author> Authors { get; set; }
        public DbSet<Genre> Genres { get; set; }
        public DbSet<BookAuthor> BookAuthors { get; set; }
        public DbSet<BookGenre> BookGenres { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Bookmark> Bookmarks { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Discount> Discounts { get; set; }
        public DbSet<UserDiscount> UserDiscounts { get; set; }
        public DbSet<Announcement> Announcements { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure composite primary keys for junction tables
            modelBuilder.Entity<BookAuthor>().HasKey(ba => new { ba.BookId, ba.AuthorId });
            modelBuilder.Entity<BookGenre>().HasKey(bg => new { bg.BookId, bg.GenreId });

            // Configure unique constraints
            modelBuilder.Entity<Book>().HasIndex(b => b.ISBN).IsUnique();
            modelBuilder.Entity<Genre>().HasIndex(g => g.Name).IsUnique();
            modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<Bookmark>().HasIndex(b => new { b.UserId, b.BookId }).IsUnique();
            modelBuilder.Entity<Review>().HasIndex(r => new { r.UserId, r.BookId }).IsUnique();
            modelBuilder.Entity<Order>().HasIndex(o => o.ClaimCode).IsUnique();

            // Configure relationships
            modelBuilder.Entity<BookAuthor>()
                .HasOne(ba => ba.Book)
                .WithMany(b => b.BookAuthors)
                .HasForeignKey(ba => ba.BookId);

            modelBuilder.Entity<BookAuthor>()
                .HasOne(ba => ba.Author)
                .WithMany(a => a.BookAuthors)
                .HasForeignKey(ba => ba.AuthorId);

            modelBuilder.Entity<BookGenre>()
                .HasOne(bg => bg.Book)
                .WithMany(b => b.BookGenres)
                .HasForeignKey(bg => bg.BookId);

            modelBuilder.Entity<BookGenre>()
                .HasOne(bg => bg.Genre)
                .WithMany(g => g.BookGenres)
                .HasForeignKey(bg => bg.GenreId);

            // Configure check constraints
            modelBuilder.Entity<Book>()
                .HasCheckConstraint("CK_Book_Price", "\"Price\" >= 0")
                .HasCheckConstraint("CK_Book_StockQuantity", "\"stock_quantity\" >= 0");

            modelBuilder.Entity<CartItem>()
                .HasCheckConstraint("CK_CartItem_Quantity", "\"Quantity\" > 0");

            modelBuilder.Entity<OrderItem>()
                .HasCheckConstraint("CK_OrderItem_Quantity", "\"Quantity\" > 0")
                .HasCheckConstraint("CK_OrderItem_PriceAtPurchase", "\"price_at_purchase\" >= 0");

            modelBuilder.Entity<Order>()
                .HasCheckConstraint("CK_Order_TotalAmount", "\"total_amount\" >= 0")
                .HasCheckConstraint("CK_Order_DiscountAmount", "\"discount_amount\" >= 0");

            modelBuilder.Entity<Review>()
                .HasCheckConstraint("CK_Review_Rating", "\"Rating\" BETWEEN 1 AND 5");

            modelBuilder.Entity<Discount>()
                .HasCheckConstraint("CK_Discount_Percentage", "\"discount_percentage\" BETWEEN 0 AND 100");

            modelBuilder.Entity<UserDiscount>()
                .HasCheckConstraint("CK_UserDiscount_Percentage", "\"discount_percentage\" BETWEEN 0 AND 100");

            base.OnModelCreating(modelBuilder);
        }
    }
}
