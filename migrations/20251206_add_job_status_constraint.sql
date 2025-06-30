ALTER TABLE jobs
  ADD CONSTRAINT chk_jobs_status
    CHECK (status IS NULL OR status IN (
      'awaiting collection',
      'awaiting assessment',
      'awaiting parts',
      'in progress',
      'awaiting return',
      'completed'
    ));
