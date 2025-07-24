DELETE ja1 FROM job_assignments ja1
JOIN job_assignments ja2
  ON ja1.job_id = ja2.job_id AND ja1.id > ja2.id;

ALTER TABLE job_assignments
  ADD CONSTRAINT uq_job_assignments_job UNIQUE (job_id);
