CREATE TABLE IF NOT EXISTS job_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  job_id INT NOT NULL,
  user_id INT NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_job_assignments_user FOREIGN KEY (user_id) REFERENCES users(id)
);
