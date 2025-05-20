// File: pages/api/dev/projects/index.js
import pool from '../../../../lib/db';
import { getUserFromReq } from '../../../../lib/auth';  // or however you read the JWT

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [projects] = await pool.query(
        `SELECT
           p.id,
           p.name,
           p.description,
           p.status,
           p.created_at,
           p.created_by,
           u.username AS creator
         FROM dev_projects p
         JOIN users u ON p.created_by = u.id
         ORDER BY p.created_at DESC`
      );
      return res.status(200).json(projects);
    } catch (err) {
      console.error('GET PROJECTS ERROR:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Missing project name' });
    }

    let user;
    try {
      user = await getUserFromReq(req);    // validate JWT, throw if not logged in
    } catch {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const [{ insertId }] = await pool.query(
        `INSERT INTO dev_projects
           (name, description, status, created_by)
         VALUES (?, ?, 'active', ?)`,
        [ name, description || null, user.id ]
      );
      return res.status(201).json({ 
        id: insertId,
        name,
        description: description || null,
        status: 'active',
        created_by: user.id
      });
    } catch (err) {
      console.error('CREATE PROJECT ERROR:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
