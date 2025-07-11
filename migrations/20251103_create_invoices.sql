CREATE TABLE IF NOT EXISTS invoices (
  id INT PRIMARY KEY,
  job_id INT,
  customer_id INT,
  amount DECIMAL(10,2),
  due_date DATE,
  status VARCHAR(50),
  created_ts DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoices_job FOREIGN KEY (job_id) REFERENCES jobs(id),
  CONSTRAINT fk_invoices_customer FOREIGN KEY (customer_id) REFERENCES clients(id)
);
