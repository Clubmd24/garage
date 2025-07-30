-- Set starting point for pipeline numbering system
-- This ensures quote numbers, job numbers, and invoice numbers start from 2500
-- creating a unified pipeline where quote number = job number = invoice number

-- Set quotes auto-increment to start from 2500
ALTER TABLE quotes AUTO_INCREMENT = 2500;

-- Set jobs auto-increment to start from 2500  
ALTER TABLE jobs AUTO_INCREMENT = 2500;

-- Set invoices auto-increment to start from 2500
ALTER TABLE invoices AUTO_INCREMENT = 2500;

-- Update the pipeline workflow to use the same ID across all tables
-- When a quote is approved and becomes a job, use the same ID
-- When a job is completed and becomes an invoice, use the same ID 