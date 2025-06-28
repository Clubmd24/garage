CREATE TABLE IF NOT EXISTS time_entries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  job_id INT NOT NULL,
  user_id INT NOT NULL,
  start_ts DATETIME,
  end_ts DATETIME,
  duration TIME,
  CONSTRAINT fk_time_entries_user FOREIGN KEY (user_id) REFERENCES users(id)
);
