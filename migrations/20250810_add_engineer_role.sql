INSERT INTO roles (name)
  SELECT 'engineer'
  WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name='engineer');
