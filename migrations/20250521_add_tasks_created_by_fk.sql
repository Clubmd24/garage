-- back-fill any stray or NULL created_by values
UPDATE dev_tasks
  SET created_by = 1
WHERE created_by IS NULL
  OR created_by NOT IN (SELECT id FROM users);

-- now add the foreign-key constraint
ALTER TABLE dev_tasks
  ADD CONSTRAINT fk_dev_tasks_created_by
    FOREIGN KEY (created_by) REFERENCES users(id);
