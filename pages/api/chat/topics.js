import pool from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const [rows] = await pool.query(
      "SELECT id, name FROM chat_rooms ORDER BY name"
    );
    return res.status(200).json(rows);
  }

  if (req.method === "POST") {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });
    const [result] = await pool.query(
      "INSERT INTO chat_rooms (name) VALUES (?)",
      [name]
    );
    return res.status(201).json({ id: result.insertId });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end();
}
