CREATE TABLE IF NOT EXISTS company_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  logo_url VARCHAR(255),
  company_name VARCHAR(255),
  address TEXT,
  phone VARCHAR(50),
  website VARCHAR(255),
  social_links JSON,
  terms TEXT
);
