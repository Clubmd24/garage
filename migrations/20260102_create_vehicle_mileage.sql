CREATE TABLE IF NOT EXISTS vehicle_mileage (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id INT NOT NULL,
  mileage INT NOT NULL,
  recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vehicle_mileage_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);
