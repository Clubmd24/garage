INSERT INTO job_statuses (name)
SELECT 'engineer completed'
WHERE NOT EXISTS (
  SELECT 1 FROM job_statuses WHERE name='engineer completed'
);

INSERT INTO job_statuses (name)
SELECT 'notified client for collection'
WHERE NOT EXISTS (
  SELECT 1 FROM job_statuses WHERE name='notified client for collection'
);
