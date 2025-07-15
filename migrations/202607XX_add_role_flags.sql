ALTER TABLE roles
  ADD COLUMN developer TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN office TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN engineer TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN apprentice TINYINT(1) NOT NULL DEFAULT 0;
UPDATE roles SET developer=1 WHERE name='developer';
UPDATE roles SET office=1 WHERE name='office';
UPDATE roles SET engineer=1 WHERE name='engineer';
UPDATE roles SET apprentice=1 WHERE name='apprentice';
