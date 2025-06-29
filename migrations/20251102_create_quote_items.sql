CREATE TABLE IF NOT EXISTS quote_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quote_id INT NOT NULL,
  description TEXT,
  qty INT,
  unit_price DECIMAL(10,2),
  CONSTRAINT fk_quote_items_quote FOREIGN KEY (quote_id) REFERENCES quotes(id)
);
