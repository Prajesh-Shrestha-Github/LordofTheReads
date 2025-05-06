using System;
using System.Linq;
using System.Threading.Tasks;
using LordofTheReads.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace LordofTheReads.Database
{
    public static class SeedData
    {
        public static async Task Initialize(IServiceProvider serviceProvider, ILogger logger)
        {
            using var context = new AppDbContext(
                serviceProvider.GetRequiredService<DbContextOptions<AppDbContext>>());

            // Seed Authors
            if (!context.Authors.Any())
            {
                logger.LogInformation("Seeding authors...");
                
                var authors = new[]
                {
                    // Existing authors
                    new Author { Name = "J.K. Rowling", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Author { Name = "George R.R. Martin", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Author { Name = "J.R.R. Tolkien", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    
                    // Additional well-known authors
                    new Author { Name = "Stephen King", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Author { Name = "Agatha Christie", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Author { Name = "Jane Austen", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Author { Name = "Ernest Hemingway", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Author { Name = "Mark Twain", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Author { Name = "Charles Dickens", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Author { Name = "Leo Tolstoy", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Author { Name = "Fyodor Dostoevsky", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Author { Name = "Virginia Woolf", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Author { Name = "Franz Kafka", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Author { Name = "Gabriel García Márquez", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Author { Name = "Haruki Murakami", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Author { Name = "Neil Gaiman", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Author { Name = "Margaret Atwood", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Author { Name = "Toni Morrison", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Author { Name = "Dan Brown", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Author { Name = "John Grisham", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Author { Name = "Khaled Hosseini", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Author { Name = "Paulo Coelho", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Author { Name = "Suzanne Collins", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Author { Name = "Brandon Sanderson", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                };
                
                context.Authors.AddRange(authors);
                await context.SaveChangesAsync();
                logger.LogInformation($"Added {authors.Length} authors");
            }

            // Seed Genres
            if (!context.Genres.Any())
            {
                logger.LogInformation("Seeding genres...");
                
                var genres = new[]
                {
                    // Existing genres
                    new Genre { Name = "Fiction", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Genre { Name = "Non-Fiction", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Genre { Name = "Science Fiction", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    
                    // Additional genres
                    new Genre { Name = "Fantasy", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Genre { Name = "Mystery", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Genre { Name = "Thriller", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Genre { Name = "Romance", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Genre { Name = "Horror", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Genre { Name = "Historical Fiction", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Genre { Name = "Biography", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Genre { Name = "Autobiography", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Genre { Name = "Self-Help", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Genre { Name = "Business", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Genre { Name = "Philosophy", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Genre { Name = "Poetry", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Genre { Name = "Drama", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Genre { Name = "Young Adult", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Genre { Name = "Children's", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Genre { Name = "Dystopian", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Genre { Name = "Memoir", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Genre { Name = "Travel", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Genre { Name = "Cookbook", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Genre { Name = "Art", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Genre { Name = "Science", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                    new Genre { Name = "History", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                };
                
                context.Genres.AddRange(genres);
                await context.SaveChangesAsync();
                logger.LogInformation($"Added {genres.Length} genres");
            }
        }
    }
}
