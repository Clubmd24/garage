-- Add missing roles that are expected by the system
INSERT INTO roles (name, description, developer, office, engineer, apprentice) VALUES
('admin', 'Administrator with full system access', 1, 1, 1, 1),
('office', 'Office staff with administrative access', 0, 1, 0, 0)
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  developer = VALUES(developer),
  office = VALUES(office),
  engineer = VALUES(engineer),
  apprentice = VALUES(apprentice); 