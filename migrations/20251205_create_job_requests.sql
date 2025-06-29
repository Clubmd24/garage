CREATE TABLE IF NOT EXISTS job_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fleet_id INT,
  client_id INT,
  vehicle_id INT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_job_requests_fleet FOREIGN KEY (fleet_id) REFERENCES fleets(id),
  CONSTRAINT fk_job_requests_client FOREIGN KEY (client_id) REFERENCES clients(id),
  CONSTRAINT fk_job_requests_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);
