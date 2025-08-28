-- Supplier Credit Management System
-- This migration adds tables to track supplier credit usage, payments, and balances

-- 1. Create supplier credit transactions table
CREATE TABLE IF NOT EXISTS `supplier_credit_transactions` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `supplier_id` INT NOT NULL,
  `transaction_type` ENUM('credit_used', 'payment_made', 'credit_adjustment') NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `description` TEXT,
  `reference_type` ENUM('quote', 'invoice', 'manual', 'payment') NOT NULL,
  `reference_id` INT,
  `transaction_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_by` INT,
  `notes` TEXT,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_supplier_date` (`supplier_id`, `transaction_date`),
  INDEX `idx_reference` (`reference_type`, `reference_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Create supplier payments table
CREATE TABLE IF NOT EXISTS `supplier_payments` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `supplier_id` INT NOT NULL,
  `payment_amount` DECIMAL(10,2) NOT NULL,
  `payment_date` DATE NOT NULL,
  `payment_method` VARCHAR(50),
  `reference_number` VARCHAR(100),
  `description` TEXT,
  `created_by` INT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_supplier_payment_date` (`supplier_id`, `payment_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Add supplier credit balance view (computed field)
-- This will be calculated dynamically, but we can add a cached balance field
ALTER TABLE `suppliers` 
ADD COLUMN `current_credit_balance` DECIMAL(10,2) DEFAULT 0.00 AFTER `credit_limit`,
ADD COLUMN `last_balance_update` DATETIME DEFAULT CURRENT_TIMESTAMP AFTER `current_credit_balance`;

-- 4. Add indexes for better performance
CREATE INDEX `idx_suppliers_credit` ON `suppliers`(`credit_limit`, `current_credit_balance`);
CREATE INDEX `idx_parts_supplier_cost` ON `parts`(`supplier_id`, `unit_cost`);

-- 5. Insert initial credit balance for existing suppliers
-- This will be calculated based on existing parts sold
UPDATE `suppliers` SET `current_credit_balance` = 0.00 WHERE `current_credit_balance` IS NULL;
