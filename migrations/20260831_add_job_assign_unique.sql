ALTER TABLE job_assignments
  ADD CONSTRAINT uq_job_assignments_job UNIQUE (job_id);
