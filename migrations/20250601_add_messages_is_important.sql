ALTER TABLE messages
  ADD COLUMN is_important BOOLEAN DEFAULT FALSE;

UPDATE messages
  SET is_important = (body LIKE '%@dashboard%');
