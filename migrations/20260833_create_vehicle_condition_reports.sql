CREATE TABLE IF NOT EXISTS vehicle_condition_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  job_id INT NOT NULL,
  user_id INT,
  description TEXT,
  photo_url VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vcr_job FOREIGN KEY (job_id) REFERENCES jobs(id),
  CONSTRAINT fk_vcr_user FOREIGN KEY (user_id) REFERENCES users(id)
);
