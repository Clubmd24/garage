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
