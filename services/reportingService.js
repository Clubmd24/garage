import pool from '../lib/db.js';

export async function getFinanceReport(start, end) {
  const [[row]] = await pool.query(
    `SELECT COUNT(*) AS invoice_count,
            COALESCE(SUM(amount),0) AS total_amount,
            COALESCE(SUM(CASE WHEN status='paid' THEN amount END),0) AS total_paid,
            COALESCE(SUM(CASE WHEN status='unpaid' THEN amount END),0) AS total_unpaid
       FROM invoices
      WHERE created_ts >= ? AND created_ts < ?`,
    [start, end]
  );
  return row || { invoice_count: 0, total_amount: 0, total_paid: 0, total_unpaid: 0 };
}

export async function getEngineerPerformanceReport(start, end) {
  const [rows] = await pool.query(
    `SELECT u.username,
            ROUND(SUM(TIME_TO_SEC(te.duration))/3600, 2) AS hours
       FROM time_entries te
       JOIN users u ON te.user_id = u.id
      WHERE te.start_ts >= ? AND te.start_ts < ?
   GROUP BY te.user_id
   ORDER BY hours DESC`,
    [start, end]
  );
  return rows;
}

export async function getBusinessPerformanceReport(start, end) {
  const [[row]] = await pool.query(
    `SELECT COUNT(*) AS jobs_created,
            SUM(status='completed') AS jobs_completed
       FROM jobs
      WHERE created_at >= ? AND created_at < ?`,
    [start, end]
  );
  return row || { jobs_created: 0, jobs_completed: 0 };
}
