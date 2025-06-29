CREATE TABLE IF NOT EXISTS quotes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT,
  job_id INT,
  total_amount DECIMAL(10,2),
  status VARCHAR(50),
  created_ts DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_quotes_customer FOREIGN KEY (customer_id) REFERENCES clients(id),
  CONSTRAINT fk_quotes_job FOREIGN KEY (job_id) REFERENCES jobs(id)
);
