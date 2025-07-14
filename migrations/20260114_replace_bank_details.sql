ALTER TABLE company_settings
  DROP COLUMN bank_details,
  ADD COLUMN bank_name VARCHAR(255) NULL,
  ADD COLUMN bank_sort_code VARCHAR(20) NULL,
  ADD COLUMN bank_account_number VARCHAR(34) NULL,
  ADD COLUMN bank_iban VARCHAR(34) NULL;
