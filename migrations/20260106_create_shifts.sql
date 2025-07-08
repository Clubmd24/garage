CREATE TABLE IF NOT EXISTS shifts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT,
  start_time DATETIME,
  end_time DATETIME,
  CONSTRAINT fk_shifts_employee FOREIGN KEY (employee_id) REFERENCES users(id)
);
