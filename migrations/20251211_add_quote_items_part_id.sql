ALTER TABLE quote_items ADD COLUMN part_id INT;
ALTER TABLE quote_items ADD CONSTRAINT fk_quote_item_part FOREIGN KEY (part_id) REFERENCES parts(id);
