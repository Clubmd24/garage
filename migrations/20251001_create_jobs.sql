CREATE TABLE IF NOT EXISTS jobs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT,
  vehicle_id INT,
  scheduled_start DATETIME,
  scheduled_end DATETIME,
  status VARCHAR(50),
  bay VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_jobs_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);
