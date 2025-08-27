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
  if (!roleRow) {
    return res.status(403).json({ error: 'User has no role assigned' });
  }
  if (!['office', 'admin', 'developer'].includes(roleRow.name)) {
    return res.status(403).json({ error: `Insufficient permissions. Required: office/admin/developer, User has: ${roleRow.name}` });
  }

  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Check if job exists
    const [[jobExists]] = await pool.query(
      'SELECT id FROM jobs WHERE id = ?',
      [id]
    );
    
    if (!jobExists) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get job history including:
    // 1. Quote creation
    // 2. Job status changes (from job_work_logs)
    // 3. Engineer assignments (from job_assignments)
    
    const history = [];

    try {
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
    } catch (quoteErr) {
      console.log('Quote query failed (table might not exist):', quoteErr.message);
      // Continue without quote data
    }

    try {
      // 2. Get job status changes from job_work_logs
      const [statusLogs] = await pool.query(
        `SELECT jwl.id, jwl.ts, jwl.action
         FROM job_work_logs jwl
         WHERE jwl.job_id = ?
         ORDER BY jwl.ts DESC`,
        [id]
      );

      statusLogs.forEach(log => {
        history.push({
          type: 'status_change',
          timestamp: log.ts,
          description: `Status changed: ${log.action}`,
          details: {
            action: log.action,
            changed_date: log.ts
          }
        });
      });
    } catch (statusErr) {
      console.log('Status logs query failed (table might not exist):', statusErr.message);
      // Continue without status logs
    }

    try {
      // 3. Get engineer assignments
      const [assignments] = await pool.query(
        `SELECT ja.id, ja.assigned_at, ja.assigned_by, 
                u.username as engineer_name, assigned_by_user.username as assigned_by_name
         FROM job_assignments ja
         JOIN users u ON ja.user_id = u.id
         LEFT JOIN users assigned_by_user ON ja.assigned_by = assigned_by_user.id
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
            assigned_by: assignment.assigned_by_name || 'Unknown',
            assigned_date: assignment.assigned_at
          }
        });
      });
    } catch (assignmentErr) {
      console.log('Assignments query failed (table might not exist):', assignmentErr.message);
      // Continue without assignment data
    }

    // 4. Get job creation (if no quote exists)
    if (!quote) {
      try {
        const [[job]] = await pool.query(
          `SELECT j.created_at
           FROM jobs j
           WHERE j.id = ?`,
          [id]
        );
        
        if (job) {
          history.push({
            type: 'job_created',
            timestamp: job.created_at,
            description: 'Job created',
            details: {
              created_date: job.created_at
            }
          });
        }
      } catch (jobErr) {
        console.log('Job creation query failed:', jobErr.message);
        // Continue without job creation data
      }
    }

    // If no history was found, add a basic entry
    if (history.length === 0) {
      history.push({
        type: 'no_history',
        timestamp: new Date().toISOString(),
        description: 'No history available for this job',
        details: {
          message: 'This job was created before detailed history tracking was implemented'
        }
      });
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