CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;
CREATE UNIQUE INDEX "IX_Users_Email" ON "Users" ("Email");

CREATE UNIQUE INDEX "IX_Users_Username" ON "Users" ("Username");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250503213842_UniqueUsernameConstraint', '9.0.4');

ALTER TABLE "Books" ADD cover_image_url character varying(500);

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250504065039_AddCoverImageUrlToBooks', '9.0.4');

ALTER TABLE "Books" DROP COLUMN cover_image_url;

ALTER TABLE "Genres" ADD "CreatedAt" timestamp with time zone;

ALTER TABLE "Genres" ADD "UpdatedAt" timestamp with time zone;

ALTER TABLE "Books" ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE "Books" ALTER COLUMN created_at DROP NOT NULL;

ALTER TABLE "Authors" ADD "CreatedAt" timestamp with time zone;

ALTER TABLE "Authors" ADD "UpdatedAt" timestamp with time zone;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250506164245_AddTimestampsToBooksAuthorsGenres', '9.0.4');

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250506172508_AddImageUrlToBooks', '9.0.4');

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250506173325_ActuallyAddImageUrlToBooks', '9.0.4');

ALTER TABLE "Books" ADD format character varying(100);

ALTER TABLE "Books" ADD language character varying(50);

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250507132655_AddLanguageAndFormatToBook', '9.0.4');

ALTER TABLE "Books" ADD physical_library_access boolean NOT NULL DEFAULT FALSE;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250507140717_AddPhysicalLibraryAccessToBook', '9.0.4');

COMMIT;

