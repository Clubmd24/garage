CREATE TABLE IF NOT EXISTS invoice_statuses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE
);

INSERT IGNORE INTO invoice_statuses (name) VALUES
  ('issued'),
  ('paid'),
  ('unpaid');
