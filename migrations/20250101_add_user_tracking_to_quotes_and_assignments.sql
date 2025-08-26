-- Add user tracking columns to quotes and job_assignments tables
-- This will allow the history API to show who created quotes and who assigned engineers

-- Add created_by to quotes table
ALTER TABLE quotes ADD COLUMN created_by INT;
ALTER TABLE quotes ADD CONSTRAINT fk_quotes_created_by FOREIGN KEY (created_by) REFERENCES users(id);

-- Add assigned_by to job_assignments table  
ALTER TABLE job_assignments ADD COLUMN assigned_by INT;
ALTER TABLE job_assignments ADD CONSTRAINT fk_job_assignments_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id);
