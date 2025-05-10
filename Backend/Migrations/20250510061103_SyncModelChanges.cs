using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LordofTheReads.Migrations
{
    /// <inheritdoc />
    public partial class SyncModelChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "public");

            migrationBuilder.RenameTable(
                name: "Users",
                newName: "Users",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "UserDiscounts",
                newName: "UserDiscounts",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "Reviews",
                newName: "Reviews",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "Orders",
                newName: "Orders",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "OrderItems",
                newName: "OrderItems",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "Genres",
                newName: "Genres",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "Discounts",
                newName: "Discounts",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "Carts",
                newName: "Carts",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "CartItems",
                newName: "CartItems",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "Books",
                newName: "Books",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "Bookmarks",
                newName: "Bookmarks",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "BookGenres",
                newName: "BookGenres",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "BookAuthors",
                newName: "BookAuthors",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "Authors",
                newName: "Authors",
                newSchema: "public");

            migrationBuilder.RenameTable(
                name: "Announcements",
                newName: "Announcements",
                newSchema: "public");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "Users",
                schema: "public",
                newName: "Users");

            migrationBuilder.RenameTable(
                name: "UserDiscounts",
                schema: "public",
                newName: "UserDiscounts");

            migrationBuilder.RenameTable(
                name: "Reviews",
                schema: "public",
                newName: "Reviews");

            migrationBuilder.RenameTable(
                name: "Orders",
                schema: "public",
                newName: "Orders");

            migrationBuilder.RenameTable(
                name: "OrderItems",
                schema: "public",
                newName: "OrderItems");

            migrationBuilder.RenameTable(
                name: "Genres",
                schema: "public",
                newName: "Genres");

            migrationBuilder.RenameTable(
                name: "Discounts",
                schema: "public",
                newName: "Discounts");

            migrationBuilder.RenameTable(
                name: "Carts",
                schema: "public",
                newName: "Carts");

            migrationBuilder.RenameTable(
                name: "CartItems",
                schema: "public",
                newName: "CartItems");

            migrationBuilder.RenameTable(
                name: "Books",
                schema: "public",
                newName: "Books");

            migrationBuilder.RenameTable(
                name: "Bookmarks",
                schema: "public",
                newName: "Bookmarks");

            migrationBuilder.RenameTable(
                name: "BookGenres",
                schema: "public",
                newName: "BookGenres");

            migrationBuilder.RenameTable(
                name: "BookAuthors",
                schema: "public",
                newName: "BookAuthors");

            migrationBuilder.RenameTable(
                name: "Authors",
                schema: "public",
                newName: "Authors");

            migrationBuilder.RenameTable(
                name: "Announcements",
                schema: "public",
                newName: "Announcements");
        }
    }
}
