using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LordofTheReads.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddLanguageAndFormatToBook : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "format",
                table: "Books",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "language",
                table: "Books",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "format",
                table: "Books");

            migrationBuilder.DropColumn(
                name: "language",
                table: "Books");
        }
    }
}
