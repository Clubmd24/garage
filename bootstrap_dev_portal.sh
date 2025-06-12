#!/usr/bin/env bash
set -e

echo "🛠  Bootstrapping Dev Portal..."

# 1) Migrations
mkdir -p migrations
cat > migrations/20250521_schema.sql <<'EOF'
-- Dev Portal schema

CREATE TABLE IF NOT EXISTS dev_projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS dev_tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dev_project_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo',
  created_by INT NOT NULL,
  assigned_to INT,
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dev_project_id) REFERENCES dev_projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  room_id BIGINT DEFAULT 1,
  user VARCHAR(80),
  body TEXT,
  s3_key VARCHAR(256),
  content_type VARCHAR(80),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS embeddings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  doc_title VARCHAR(200),
  chunk_no INT,
  txt TEXT,
  vec VECTOR(1536) NOT NULL,
  INDEX vss_idx (vec) USING VSS
);
EOF

# 2) Library
mkdir -p lib
cat > lib/db.js <<'EOF'
import mysql from 'mysql2/promise';
const pool = mysql.createPool(process.env.DATABASE_URL + '?multipleStatements=true');
export default pool;
EOF

cat > lib/auth.js <<'EOF'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const SECRET = process.env.JWT_SECRET;

export async function hashPassword(p) {
  return bcrypt.hash(p, 10);
}
export async function verifyPassword(p, h) {
  return bcrypt.compare(p, h);
}
export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '8h' });
}
export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
export function getTokenFromReq(req) {
  const cookies = parse(req.headers.cookie || '');
  if (!cookies.auth_token) return null;
  try {
    return verifyToken(cookies.auth_token);
  } catch {
    return null;
  }
}
EOF

# 3) Components
mkdir -p components
cat > components/Sidebar.js <<'EOF'
export function Sidebar() {
  return (
    <nav className="w-64 bg-[var(--color-surface)] h-screen p-4 space-y-2">
      <a href="/" className="block font-bold mb-4">Garage Vision</a>
      <a href="/dev/projects" className="block hover:underline">Dev → Projects</a>
      <a href="/chat" className="block hover:underline">Dev → Chat</a>
    </nav>
  );
}
EOF

cat > components/Header.js <<'EOF'
import { useEffect, useState } from 'react';
export function Header() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch('/api/auth/me', { credentials:'include' })
      .then(r=>r.json()).then(setUser).catch(()=>null);
  }, []);
  return (
    <header className="bg-[var(--color-primary)] text-white p-4 flex justify-between">
      <div>Dev Portal</div>
      {user && <div>{user.username}</div>}
    </header>
  );
}
EOF

cat > components/Card.js <<'EOF'
export function Card({ children, className = '' }) {
  return (
    <div className={\`p-4 bg-[var(--color-surface)] rounded-2xl shadow \${className}\`}>
      {children}
    </div>
  );
}
EOF

# 4) API Routes
mkdir -p pages/api/auth pages/api/dev/projects pages/api/dev/tasks

cat > pages/api/auth/login.js <<'EOF'
import pool from '../../../lib/db';
import { verifyPassword, signToken } from '../../../lib/auth';

export default async function handler(req, res) {
  const { email, password } = req.body;
  const [rows] = await pool.query(
    'SELECT id, password_hash FROM users WHERE email=?',
    [email]
  );
  if (!rows.length || !(await verifyPassword(password, rows[0].password_hash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = signToken({ sub: rows[0].id });
  res.setHeader(
    'Set-Cookie',
    \`auth_token=\${token}; HttpOnly; Path=/; Max-Age=28800; SameSite=Strict\`
  );
  res.status(200).json({ ok: true });
}
EOF

cat > pages/api/auth/me.js <<'EOF'
import pool from '../../../lib/db';
import { getTokenFromReq } from '../../../lib/auth';

export default async function handler(req, res) {
  const t = getTokenFromReq(req);
  if (!t) return res.status(401).json({ error: 'Unauthorized' });
  const [user] = await pool.query(
    'SELECT id, username, email FROM users WHERE id=?',
    [t.sub]
  );
  res.status(200).json(user[0]);
}
EOF

# Socket API
cat > pages/api/socket-io.js <<'EOF'
import { Server } from 'socket.io';
import pool from '../lib/db';

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, { path: '/api/socket-io' });
    io.on('connection', socket => {
      socket.on('chat:send', async msg => {
        await pool.execute(
          'INSERT INTO messages (user, body, s3_key, content_type) VALUES (?,?,?,?)',
          [msg.user, msg.body, msg.s3_key||null, msg.content_type||null]
        );
        io.emit('chat:recv', { ...msg, created_at: new Date().toISOString() });
      });
    });
    res.socket.server.io = io;
  }
  res.end();
}
EOF

# Dev → projects
cat > pages/api/dev/projects/index.js <<'EOF'
import pool from '../../../../lib/db';
import { getTokenFromReq } from '../../../../lib/auth';

export default async function handler(req, res) {
  const t = getTokenFromReq(req);
  if (!t) return res.status(401).json({ error: 'Unauthorized' });
  const userId = t.sub;

  if (req.method === 'GET') {
    const [projects] = await pool.query(
      \`SELECT p.*, u.username AS creator
         FROM dev_projects p
         JOIN users u ON p.created_by = u.id
       WHERE p.created_by=?
       ORDER BY p.created_at DESC\`,
      [userId]
    );
    return res.json(projects);
  }

  if (req.method === 'POST') {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing name' });
    const [{ insertId }] = await pool.query(
      'INSERT INTO dev_projects (name,description,created_by) VALUES (?,?,?)',
      [name, description||null, userId]
    );
    return res.status(201).json({ id: insertId });
  }

  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end();
}
EOF

cat > pages/api/dev/projects/[id].js <<'EOF'
import pool from '../../../../lib/db';
import { getTokenFromReq } from '../../../../lib/auth';

export default async function handler(req, res) {
  const t = getTokenFromReq(req);
  if (!t) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.query;

  if (req.method === 'GET') {
    const [[project]] = await pool.query(
      \`SELECT p.*, u.username AS creator
         FROM dev_projects p
         JOIN users u ON p.created_by = u.id
       WHERE p.id=?\`,
      [id]
    );
    return project
      ? res.json(project)
      : res.status(404).json({ error: 'Not found' });
  }

  if (req.method === 'PUT') {
    const { name, description, status } = req.body;
    await pool.query(
      'UPDATE dev_projects SET name=?,description=?,status=? WHERE id=?',
      [name, description||null, status||'active', id]
    );
    return res.json({ ok: true });
  }

  if (req.method === 'DELETE') {
    await pool.query('DELETE FROM dev_projects WHERE id=?',[id]);
    return res.json({ ok: true });
  }

  res.setHeader('Allow',['GET','PUT','DELETE']);
  res.status(405).end();
}
EOF

# Dev → tasks
cat > pages/api/dev/tasks/index.js <<'EOF'
import pool from '../../../../lib/db';
import { getTokenFromReq } from '../../../../lib/auth';

export default async function handler(req, res) {
  const t = getTokenFromReq(req);
  if (!t) return res.status(401).json({ error: 'Unauthorized' });
  const userId = t.sub;
  const { project_id } = req.query;

  if (req.method === 'GET') {
    const [tasks] = await pool.query(
      \`SELECT t.*, u.username AS assignee
         FROM dev_tasks t
    LEFT JOIN users u ON t.assigned_to=u.id
        WHERE t.dev_project_id=? AND t.created_by=?
     ORDER BY t.created_at DESC\`,
      [project_id, userId]
    );
    return res.json(tasks);
  }

  if (req.method === 'POST') {
    const { title, description, status, assigned_to, due_date } = req.body;
    const [{ insertId }] = await pool.query(
      \`INSERT INTO dev_tasks
         (dev_project_id,title,description,status,created_by,assigned_to,due_date)
       VALUES (?,?,?,?,?,?,?)\`,
      [project_id, title, description||null, status, userId, assigned_to||null, due_date||null]
    );
    return res.status(201).json({ id: insertId });
  }

  res.setHeader('Allow',['GET','POST']);
  res.status(405).end();
}
EOF

cat > pages/api/dev/tasks/[id].js <<'EOF'
import pool from '../../../../lib/db';
import { getTokenFromReq } from '../../../../lib/auth';

export default async function handler(req, res) {
  const t = getTokenFromReq(req);
  if (!t) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.query;

  if (req.method === 'GET') {
    const [[task]] = await pool.query(
      \`SELECT t.*, u.username AS assignee
         FROM dev_tasks t
    LEFT JOIN users u ON t.assigned_to=u.id
        WHERE t.id=?\`,
      [id]
    );
    return task ? res.json(task) : res.status(404).json({ error: 'Not found' });
  }

  if (req.method === 'PUT') {
    const { title, description, status, assigned_to, due_date } = req.body;
    await pool.query(
      \`UPDATE dev_tasks
         SET title=?,description=?,status=?,assigned_to=?,due_date=?
       WHERE id=?\`,
      [title, description||null, status, assigned_to||null, due_date||null, id]
    );
    return res.json({ ok: true });
  }

  if (req.method === 'DELETE') {
    await pool.query('DELETE FROM dev_tasks WHERE id=?',[id]);
    return res.json({ ok: true });
  }

  res.setHeader('Allow',['GET','PUT','DELETE']);
  res.status(405).end();
}
EOF

# 5) Front-end pages
mkdir -p pages/api/dev/projects pages/dev/projects/[id]/tasks pages/dev/tasks

# Dev.projects UI
cat > pages/dev/projects/index.js <<'EOF'
import Link from 'next/link';
import { useState,useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';

export default function Projects() {
  const [projects,setProjects]=useState([]);
  useEffect(()=>{
    fetch('/api/dev/projects',{credentials:'include'})
      .then(r=>r.json()).then(setProjects);
  },[]);
  return (
    <div className="flex">
      <Sidebar/>
      <div className="flex-1">
        <Header/>
        <main className="p-8">
          <h1 className="text-3xl mb-4">Projects</h1>
          <Link href="/dev/projects/new"><a className="button">+ New Project</a></Link>
          <div className="mt-4 space-y-4">
            {projects.map(p=>(
              <Card key={p.id}>
                <Link href={`/dev/projects/${p.id}`}><a>
                  <h2 className="font-semibold">{p.name}</h2>
                  <p className="text-sm">{p.description}</p>
                </a></Link>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
EOF

# New Project
cat > pages/dev/projects/new.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { Card } fro
