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
    if (req.method === 'GET') {
      // Get assignment history for this job
      const [assignments] = await pool.query(
        `SELECT 
           ja.id,
           ja.job_id,
           ja.user_id,
           ja.assigned_at,
           u.username
         FROM job_assignments ja
         JOIN users u ON ja.user_id = u.id
         WHERE ja.job_id = ?
         ORDER BY ja.assigned_at DESC`,
        [id]
      );
      
      return res.status(200).json(assignments);
    }
    
    if (req.method === 'DELETE') {
      const { assignment_id } = req.body;
      if (!assignment_id) {
        return res.status(400).json({ error: 'assignment_id required' });
      }
      
      // Delete specific assignment
      await pool.query('DELETE FROM job_assignments WHERE id = ? AND job_id = ?', [assignment_id, id]);
      
      return res.status(200).json({ message: 'Assignment deleted' });
    }
    
    res.setHeader('Allow', ['GET', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default apiHandler(handler); 