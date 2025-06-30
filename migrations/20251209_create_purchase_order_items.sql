CREATE TABLE IF NOT EXISTS purchase_order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  purchase_order_id INT NOT NULL,
  part_id INT NOT NULL,
  qty INT,
  unit_price DECIMAL(10,2),
  CONSTRAINT fk_poi_po FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id),
  CONSTRAINT fk_poi_part FOREIGN KEY (part_id) REFERENCES parts(id)
);
