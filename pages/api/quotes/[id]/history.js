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

    // Check if quote exists
    const [[quoteExists]] = await pool.query(
      'SELECT id FROM quotes WHERE id = ?',
      [id]
    );
    
    if (!quoteExists) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    // Get quote history including:
    // 1. Quote creation
    // 2. Quote status changes
    // 3. Quote item changes
    // 4. Job creation (if applicable)
    
    const history = [];

    // 1. Get quote creation info
    const [[quote]] = await pool.query(
      `SELECT q.id, q.created_ts, q.created_by, q.status, q.job_id,
              u.username as created_by_name
       FROM quotes q
       LEFT JOIN users u ON q.created_by = u.id
       WHERE q.id = ?`,
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
          created_date: quote.created_ts,
          status: quote.status
        }
      });

      // 2. Get quote status changes (if any are logged)
      // For now, we'll add a status change entry if the current status is different from 'draft'
      if (quote.status && quote.status !== 'draft') {
        history.push({
          type: 'status_change',
          timestamp: quote.created_ts, // Using creation time as approximation
          description: `Quote status: ${quote.status}`,
          details: {
            old_status: 'draft',
            new_status: quote.status,
            changed_by: quote.created_by_name || 'Unknown'
          }
        });
      }

      // 3. Get quote items info
      const [quoteItems] = await pool.query(
        `SELECT COUNT(*) as item_count, SUM(qi.qty * qi.unit_price) as total_value
         FROM quote_items qi
         WHERE qi.quote_id = ?`,
        [id]
      );

      if (quoteItems[0] && quoteItems[0].item_count > 0) {
        history.push({
          type: 'quote_items_added',
          timestamp: quote.created_ts,
          description: `${quoteItems[0].item_count} items added to quote`,
          details: {
            item_count: quoteItems[0].item_count,
            total_value: quoteItems[0].total_value || 0
          }
        });
      }

      // 4. Check if job was created from this quote
      if (quote.job_id) {
        const [[job]] = await pool.query(
          `SELECT j.id, j.created_ts, j.status
           FROM jobs j
           WHERE j.id = ?`,
          [quote.job_id]
        );
        
        if (job) {
          history.push({
            type: 'job_created',
            timestamp: job.created_ts,
            description: `Job #${job.id} created from quote`,
            details: {
              job_id: job.id,
              job_status: job.status,
              created_date: job.created_ts
            }
          });
        }
      }
    }

    // Sort all history by timestamp (newest first)
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.status(200).json(history);
  } catch (err) {
    console.error('Quote history error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default apiHandler(handler); 