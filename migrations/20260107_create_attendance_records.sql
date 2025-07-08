CREATE TABLE IF NOT EXISTS attendance_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT,
  clock_in DATETIME,
  clock_out DATETIME,
  CONSTRAINT fk_attendance_employee FOREIGN KEY (employee_id) REFERENCES users(id)
);
