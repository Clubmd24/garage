CREATE TABLE IF NOT EXISTS clients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  mobile VARCHAR(50),
  landline VARCHAR(50),
  nie_number VARCHAR(100),
  street_address VARCHAR(255),
  town VARCHAR(100),
  province VARCHAR(100),
  post_code VARCHAR(20)
);
