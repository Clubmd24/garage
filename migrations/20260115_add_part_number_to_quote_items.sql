-- Add part_number field to quote_items table for AD360 and external parts
-- This allows storing part numbers directly when part_id is null (external parts)

ALTER TABLE quote_items 
ADD COLUMN part_number VARCHAR(255) DEFAULT NULL AFTER part_id;

-- Add index for better performance when searching by part number
CREATE INDEX idx_quote_items_part_number ON quote_items(part_number);

-- Update existing quote items to populate part_number from parts table where possible
UPDATE quote_items qi 
JOIN parts p ON qi.part_id = p.id 
SET qi.part_number = p.part_number 
WHERE qi.part_number IS NULL AND qi.part_id IS NOT NULL; 