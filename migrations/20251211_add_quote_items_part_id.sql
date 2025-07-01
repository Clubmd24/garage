-- Only add the column and foreign key if it doesn't already exist
SET @col_count := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'quote_items'
    AND COLUMN_NAME = 'part_id'
);

SET @sql := IF(
  @col_count = 0,
  'ALTER TABLE quote_items ADD COLUMN part_id INT',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  @col_count = 0,
  'ALTER TABLE quote_items ADD CONSTRAINT fk_quote_item_part FOREIGN KEY (part_id) REFERENCES parts(id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

