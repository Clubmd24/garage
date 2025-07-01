CREATE TABLE IF NOT EXISTS job_statuses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE
);

INSERT IGNORE INTO job_statuses (name) VALUES
  ('awaiting collection'),
  ('awaiting assessment'),
  ('awaiting parts'),
  ('in progress'),
  ('awaiting return'),
  ('completed');

ALTER TABLE jobs DROP CONSTRAINT chk_jobs_status;
