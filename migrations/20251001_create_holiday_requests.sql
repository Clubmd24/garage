CREATE TABLE IF NOT EXISTS holiday_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50),
  created_ts DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_holiday_requests_employee FOREIGN KEY (employee_id) REFERENCES users(id)
);
