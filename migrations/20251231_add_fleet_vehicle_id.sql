ALTER TABLE quotes ADD COLUMN fleet_vehicle_id VARCHAR(255) AFTER vehicle_id;
UPDATE quotes q
  JOIN vehicles v ON q.vehicle_id = v.id
     SET q.fleet_vehicle_id = v.company_vehicle_id;
