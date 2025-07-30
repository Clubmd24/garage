import apiHandler from '../../../../lib/apiHandler.js';
import { getTokenFromReq } from '../../../../lib/auth.js';
import pool from '../../../../lib/db.js';

async function handler(req, res) {
  const { id } = req.query;
  const t = getTokenFromReq(req);
  if (!t) return res.status(401).json({ error: 'Unauthorized' });
  
  const [[roleRow]] = await pool.query(
    `SELECT r.name FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
     WHERE ur.user_id = ?`,
    [t.sub]
  );
  if (!roleRow || !['office', 'admin', 'developer'].includes(roleRow.name)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Get job history including:
    // 1. Quote creation
    // 2. Job status changes (from job_work_logs)
    // 3. Engineer assignments (from job_assignments)
    
    const history = [];

    // 1. Get quote creation info
    const [[quote]] = await pool.query(
      `SELECT q.id, q.created_ts, q.created_by, u.username as created_by_name
       FROM quotes q
       LEFT JOIN users u ON q.created_by = u.id
       WHERE q.job_id = ?`,
      [id]
    );
    
    if (quote) {
      history.push({
        type: 'quote_created',
        timestamp: quote.created_ts,
        description: 'Quote created',
        details: {
          quote_id: quote.id,
          created_by: quote.created_by_name || 'Unknown',
          created_date: quote.created_ts
        }
      });
    }

    // 2. Get job status changes from job_work_logs
    const [statusLogs] = await pool.query(
      `SELECT jwl.id, jwl.created_ts, jwl.old_status, jwl.new_status, 
              jwl.notes, u.username as changed_by
       FROM job_work_logs jwl
       LEFT JOIN users u ON jwl.user_id = u.id
       WHERE jwl.job_id = ? AND jwl.old_status IS NOT NULL AND jwl.new_status IS NOT NULL
       ORDER BY jwl.created_ts DESC`,
      [id]
    );

    statusLogs.forEach(log => {
      history.push({
        type: 'status_change',
        timestamp: log.created_ts,
        description: `Status changed from ${log.old_status} to ${log.new_status}`,
        details: {
          old_status: log.old_status,
          new_status: log.new_status,
          changed_by: log.changed_by || 'Unknown',
          notes: log.notes
        }
      });
    });

    // 3. Get engineer assignments
    const [assignments] = await pool.query(
      `SELECT ja.id, ja.assigned_at, ja.scheduled_start, ja.duration,
              u.username as engineer_name, assigned_by.username as assigned_by_name
       FROM job_assignments ja
       JOIN users u ON ja.user_id = u.id
       LEFT JOIN users assigned_by ON ja.assigned_by = assigned_by.id
       WHERE ja.job_id = ?
       ORDER BY ja.assigned_at DESC`,
      [id]
    );

    assignments.forEach(assignment => {
      history.push({
        type: 'engineer_assigned',
        timestamp: assignment.assigned_at,
        description: `Engineer ${assignment.engineer_name} assigned`,
        details: {
          engineer_name: assignment.engineer_name,
          scheduled_start: assignment.scheduled_start,
          duration: assignment.duration,
          assigned_by: assignment.assigned_by_name || 'Unknown',
          assigned_date: assignment.assigned_at
        }
      });
    });

    // 4. Get job creation (if no quote exists)
    if (!quote) {
      const [[job]] = await pool.query(
        `SELECT j.created_ts, j.created_by, u.username as created_by_name
         FROM jobs j
         LEFT JOIN users u ON j.created_by = u.id
         WHERE j.id = ?`,
        [id]
      );
      
      if (job) {
        history.push({
          type: 'job_created',
          timestamp: job.created_ts,
          description: 'Job created',
          details: {
            created_by: job.created_by_name || 'Unknown',
            created_date: job.created_ts
          }
        });
      }
    }

    // Sort all history by timestamp (newest first)
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.status(200).json(history);
  } catch (err) {
    console.error('Job history error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default apiHandler(handler); 