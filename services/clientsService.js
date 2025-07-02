import pool from '../lib/db.js';
import { hashPassword } from '../lib/auth.js';
import { randomBytes } from 'crypto';

export async function getAllClients() {
  const [rows] = await pool.query(
    `SELECT id, first_name, last_name, email, mobile, landline, nie_number,
            street_address, town, province, post_code,
            garage_name, vehicle_reg
       FROM clients ORDER BY id`
  );
  return rows;
}

export async function getClientById(id) {
  const [[row]] = await pool.query(
    `SELECT id, first_name, last_name, email, mobile, landline, nie_number,
            street_address, town, province, post_code,
            garage_name, vehicle_reg
       FROM clients WHERE id=?`,
    [id]
  );
  return row || null;
}

export async function createClient({
  first_name,
  last_name,
  email,
  garage_name,
  vehicle_reg,
  mobile,
  landline,
  nie_number,
  street_address,
  town,
  province,
  post_code,
  password,
}) {
  if (!password) {
    password = randomBytes(12).toString('base64url');
  }
  const password_hash = await hashPassword(password);
  const [{ insertId }] = await pool.query(
    `INSERT INTO clients
      (first_name, last_name, email, mobile, landline, nie_number,
       street_address, town, province, post_code,
       garage_name, vehicle_reg, password_hash)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      first_name,
      last_name,
      email,
      mobile,
      landline,
      nie_number,
      street_address,
      town,
      province,
      post_code,
      garage_name,
      vehicle_reg,
      password_hash,
    ]
  );
  return {
    id: insertId,
    first_name,
    last_name,
    email,
    garage_name,
    vehicle_reg,
    mobile,
    landline,
    nie_number,
    street_address,
    town,
    province,
    post_code,
    password,
  };
}

export async function updateClient(
  id,
  {
    first_name,
    last_name,
    email,
    garage_name,
    vehicle_reg,
    mobile,
    landline,
    nie_number,
    street_address,
    town,
    province,
    post_code,
  }
) {
  const password_hash = await hashPassword(first_name);
  await pool.query(
    `UPDATE clients SET
       first_name=?,
       last_name=?,
       email=?,
       garage_name=?,
       vehicle_reg=?,
       mobile=?,
       landline=?,
       nie_number=?,
       street_address=?,
       town=?,
       province=?,
       post_code=?,
       password_hash=?
     WHERE id=?`,
    [
      first_name,
      last_name,
      email,
      garage_name,
      vehicle_reg,
      mobile,
      landline,
      nie_number,
      street_address,
      town,
      province,
      post_code,
      password_hash,
      id,
    ]
  );
  return { ok: true };
}

export async function deleteClient(id) {
  await pool.query('DELETE FROM clients WHERE id=?', [id]);
  return { ok: true };
}
