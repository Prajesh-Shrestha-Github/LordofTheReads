using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LordofTheReads.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddPhysicalLibraryAccessToBook : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "physical_library_access",
                table: "Books",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "physical_library_access",
                table: "Books");
        }
    }
}
