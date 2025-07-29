-- Add "ready for completion" status and remove "completed" from job statuses
-- This creates a cleaner separation between jobs and invoices

-- First, add the new status
INSERT INTO job_statuses (name) VALUES ('ready for completion');

-- Update any existing jobs with "completed" status to "ready for completion"
UPDATE jobs SET status = 'ready for completion' WHERE status = 'completed';

-- Remove "completed" status from job_statuses (it's not a job status, it's a transition)
DELETE FROM job_statuses WHERE name = 'completed'; 