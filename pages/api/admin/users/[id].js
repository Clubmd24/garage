// File: pages/api/admin/users/[id].js
import pool from '../../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      // Remove role associations first
      await pool.query('DELETE FROM user_roles WHERE user_id = ?', [id]);

      // Then delete the user
      const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('DELETE USER ERROR:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
