ALTER TABLE parts ADD COLUMN supplier_id INT;
ALTER TABLE parts ADD CONSTRAINT fk_parts_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id);
