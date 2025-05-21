-- 20250521_add_tasks_created_by.sql

ALTER TABLE dev_tasks
  -- who created the task
  ADD COLUMN created_by  INT       NOT NULL,
  -- when it was created
  ADD COLUMN created_at  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- when it was last updated
  ADD COLUMN updated_at  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  -- enforce referential integrity
  ADD CONSTRAINT fk_dev_tasks_created_by
    FOREIGN KEY (created_by) REFERENCES users(id);

-- (Optional) if you also need a status column:
ALTER TABLE dev_tasks
  ADD COLUMN status ENUM('todo','in-progress','done') NOT NULL DEFAULT 'todo';
