CREATE TABLE IF NOT EXISTS documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  entity_type ENUM('client','vehicle') NOT NULL,
  entity_id INT NOT NULL,
  filename VARCHAR(512) NOT NULL,
  url TEXT NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
