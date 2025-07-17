CREATE TABLE IF NOT EXISTS part_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE
);
ALTER TABLE parts ADD COLUMN category_id INT;
ALTER TABLE parts ADD CONSTRAINT fk_parts_category FOREIGN KEY (category_id) REFERENCES part_categories(id);
