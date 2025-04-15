namespace LordofTheReads.Database.Entities
{
    public class Book
    {
        public int Id { get; set; }

        public required string Name { get; set; }

        public required string ISBN { get; set; }

        public required float Price { get; set; }
    }
}
