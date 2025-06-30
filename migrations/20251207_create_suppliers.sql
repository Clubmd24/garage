CREATE TABLE IF NOT EXISTS suppliers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  contact_number VARCHAR(50),
  email_address VARCHAR(255),
  payment_terms VARCHAR(100),
  credit_limit DECIMAL(10,2)
);
