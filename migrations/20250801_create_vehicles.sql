CREATE TABLE IF NOT EXISTS vehicles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  licence_plate VARCHAR(20) NOT NULL,
  make VARCHAR(50),
  model VARCHAR(50),
  color VARCHAR(30),
  customer_id INT,
  fleet_id INT,
  CONSTRAINT fk_vehicles_customer_id FOREIGN KEY (customer_id) REFERENCES clients(id)
);
