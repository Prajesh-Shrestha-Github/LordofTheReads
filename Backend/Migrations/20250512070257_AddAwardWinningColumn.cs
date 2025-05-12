using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LordofTheReads.Migrations
{
    /// <inheritdoc />
    public partial class AddAwardWinningColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_award_winning",
                schema: "public",
                table: "Books",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_award_winning",
                schema: "public",
                table: "Books");
        }
    }
}
