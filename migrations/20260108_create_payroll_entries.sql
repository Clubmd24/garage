CREATE TABLE IF NOT EXISTS payroll_entries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT,
  amount DECIMAL(10,2),
  pay_date DATE,
  CONSTRAINT fk_payroll_employee FOREIGN KEY (employee_id) REFERENCES users(id)
);
