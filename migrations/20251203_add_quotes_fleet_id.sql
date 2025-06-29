ALTER TABLE quotes
  ADD COLUMN fleet_id INT AFTER customer_id,
  ADD CONSTRAINT fk_quotes_fleet FOREIGN KEY (fleet_id) REFERENCES fleets(id);
