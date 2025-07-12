CREATE TABLE IF NOT EXISTS standards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  pdf_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS apprentices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  start_date DATE,
  end_date DATE,
  standard_id INT,
  CONSTRAINT fk_apprentices_standard FOREIGN KEY (standard_id) REFERENCES standards(id)
);

-- Add columns to quiz_questions if they don't already exist
SET @col_count := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'quiz_questions'
     AND COLUMN_NAME = 'standard_id'
);
SET @sql := IF(
  @col_count = 0,
  'ALTER TABLE quiz_questions ADD COLUMN standard_id INT',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_count := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'quiz_questions'
     AND COLUMN_NAME = 'question_no'
);
SET @sql := IF(
  @col_count = 0,
  'ALTER TABLE quiz_questions ADD COLUMN question_no INT',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk_count := (
  SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'quiz_questions'
     AND CONSTRAINT_NAME = 'fk_quiz_question_standard'
);
SET @sql := IF(
  @fk_count = 0,
  'ALTER TABLE quiz_questions ADD CONSTRAINT fk_quiz_question_standard FOREIGN KEY (standard_id) REFERENCES standards(id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
