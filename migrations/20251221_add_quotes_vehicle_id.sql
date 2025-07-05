ALTER TABLE quotes
  ADD COLUMN vehicle_id INT NULL AFTER job_id,
  ADD CONSTRAINT fk_quotes_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id);
