INSERT INTO job_statuses (name)
SELECT 'awaiting supplier information'
WHERE NOT EXISTS (
  SELECT 1 FROM job_statuses WHERE name='awaiting supplier information'
);
