import { Server } from "socket.io";
import pool from "../../lib/db";

const extractMentions = (body) =>
  Array.from(
    new Set((body.match(/@([A-Za-z0-9_]+)/g) || []).map((m) => m.slice(1))),
  );

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, { path: "/api/socket-io" });
    io.on("connection", (socket) => {
      socket.on("chat:send", async (msg) => {
        const [result] = await pool.execute(
          "INSERT INTO messages (user, body, s3_key, content_type) VALUES (?,?,?,?)",
          [msg.user, msg.body, msg.s3_key || null, msg.content_type || null],
        );
        io.emit("chat:recv", {
          ...msg,
          id: result.insertId,
          created_at: new Date().toISOString(),
          mentions: extractMentions(msg.body),
        });
      });

      socket.on("chat:delete", async (id) => {
        await pool.execute("UPDATE messages SET deleted_at=NOW() WHERE id=?", [
          id,
        ]);
        io.emit("chat:delete", id);
      });
    });
    res.socket.server.io = io;
  }
  res.end();
}
