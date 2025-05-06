using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LordofTheReads.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddTimestampsToBooksAuthorsGenres : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "cover_image_url",
                table: "Books");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Genres",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Genres",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "updated_at",
                table: "Books",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "Books",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Authors",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Authors",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Genres");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Genres");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Authors");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Authors");

            migrationBuilder.AlterColumn<DateTime>(
                name: "updated_at",
                table: "Books",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "Books",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "cover_image_url",
                table: "Books",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }
    }
}
