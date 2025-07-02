CREATE TABLE IF NOT EXISTS email_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  subject VARCHAR(255),
  body TEXT,
  type VARCHAR(50)
);
