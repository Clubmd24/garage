CREATE TABLE IF NOT EXISTS audit_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT NOT NULL,
  user_id INT,
  event_type VARCHAR(64),              -- 'ad360.link','ad360.fetch','ad360.relink'
  event_payload JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
); 