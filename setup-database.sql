-- Create the LordofTheReads user if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'LordofTheReads') THEN
    CREATE USER "LordofTheReads" WITH PASSWORD 'LordofTheReads@1';
  END IF;
END
$$;

-- Create the LordofTheReads database if it doesn't exist
CREATE DATABASE "LordofTheReads" WITH OWNER "LordofTheReads";

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE "LordofTheReads" TO "LordofTheReads";

-- Connect to the LordofTheReads database to set up schema permissions
\c "LordofTheReads"

-- Grant privileges on schema
GRANT ALL ON SCHEMA public TO "LordofTheReads";
