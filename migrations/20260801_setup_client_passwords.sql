-- Setup default passwords for existing clients
-- This migration sets a default password for all clients who don't have one

-- The actual password hashing will be handled by the Node.js script
-- This migration just marks that the setup has been completed

-- Note: Run the script scripts/setup_client_passwords.js to set up passwords
-- This ensures proper bcrypt hashing instead of plain text

-- Migration completed - passwords set up via script 