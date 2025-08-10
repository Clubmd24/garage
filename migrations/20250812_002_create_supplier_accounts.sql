CREATE TABLE IF NOT EXISTS supplier_accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT NOT NULL,
  supplier_id INT NOT NULL,            -- FK to suppliers.id
  encrypted_session MEDIUMTEXT,        -- JSON of cookies/storage (encrypted)
  last_session_at DATETIME,
  consent_automated_fetch TINYINT(1) DEFAULT 0,
  consent_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_tenant_supplier (tenant_id, supplier_id)
); 