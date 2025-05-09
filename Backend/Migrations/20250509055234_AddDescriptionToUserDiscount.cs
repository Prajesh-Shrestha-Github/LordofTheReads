using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LordofTheReads.Migrations
{
    /// <inheritdoc />
    public partial class AddDescriptionToUserDiscount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "description",
                table: "UserDiscounts",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "description",
                table: "UserDiscounts");
        }
    }
}
