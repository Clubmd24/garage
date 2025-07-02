CREATE TABLE IF NOT EXISTS smtp_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  host VARCHAR(255),
  port INT,
  username VARCHAR(255),
  password VARCHAR(255),
  secure TINYINT(1),
  from_name VARCHAR(255),
  from_email VARCHAR(255)
);
