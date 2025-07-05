INSERT INTO job_statuses (name)
SELECT 'unassigned'
WHERE NOT EXISTS (
  SELECT 1 FROM job_statuses WHERE name='unassigned'
);
