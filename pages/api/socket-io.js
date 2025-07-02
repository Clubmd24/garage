import { Server } from "socket.io";
import pool from "../../lib/db";
import apiHandler from '../../lib/apiHandler.js';

const extractMentions = (body) =>
  Array.from(
    new Set((body.match(/@([\w.-]+)/g) || []).map((m) => m.slice(1))),
  );

function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, { path: "/api/socket-io" });
    io.on("connection", (socket) => {
      socket.on("chat:join", (room) => {
        if (socket.currentRoom) socket.leave(String(socket.currentRoom));
        socket.join(String(room));
        socket.currentRoom = room;
      });

      socket.on("chat:send", async (msg) => {
        const roomId = msg.room_id || 1;
        const isImportant = msg.body && msg.body.includes("@dashboard");
        const [result] = await pool.execute(
          "INSERT INTO messages (room_id, user, body, s3_key, file_name, content_type, is_important) VALUES (?,?,?,?,?,?,?)",
          [roomId, msg.user, msg.body, msg.s3_key || null, msg.file_name || null, msg.content_type || null, isImportant],
        );
        const full = {
          ...msg,
          room_id: roomId,
          id: result.insertId,
          created_at: new Date().toISOString(),
          mentions: extractMentions(msg.body),
          is_important: isImportant,
        };
        io.to(String(roomId)).emit("chat:recv", full);
      });

      socket.on("chat:delete", async (id) => {
        await pool.execute("UPDATE messages SET deleted_at=NOW() WHERE id=?", [id]);
        const [[row]] = await pool.query("SELECT room_id FROM messages WHERE id=?", [id]);
        const roomId = row ? row.room_id : 1;
        io.to(String(roomId)).emit("chat:delete", id);
      });
    });
    res.socket.server.io = io;
  }
  res.end();
}

export default apiHandler(handler);
