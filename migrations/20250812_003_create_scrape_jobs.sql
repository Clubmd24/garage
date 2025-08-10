CREATE TABLE IF NOT EXISTS scrape_jobs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT NOT NULL,
  supplier_id INT NOT NULL,
  vehicle_id INT,
  vin VARCHAR(64),
  reg VARCHAR(32),
  status ENUM('queued','running','done','error') DEFAULT 'queued',
  error_text TEXT,
  started_at DATETIME,
  finished_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
); 