INSERT INTO roles (name, description)
  SELECT 'engineer', 'engineer'
  WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name='engineer');
