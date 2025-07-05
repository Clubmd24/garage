ALTER TABLE quotes
  ADD COLUMN customer_reference VARCHAR(255) NULL AFTER vehicle_id,
  ADD COLUMN po_number VARCHAR(255) NULL AFTER customer_reference;
