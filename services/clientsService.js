import pool from '../lib/db.js';
import { hashPassword } from '../lib/auth.js';
import { randomBytes } from 'crypto';

export async function searchClients(query) {
  const q = `%${query}%`;
  const [rows] = query
    ? await pool.query(
        `SELECT id, first_name, last_name, email, mobile, landline, nie_number,
                street_address, town, province, post_code,
                garage_name, vehicle_reg, pin
           FROM clients
          WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?
          ORDER BY first_name, last_name
          LIMIT 20`,
        [q, q, q]
      )
    : await pool.query(
        `SELECT id, first_name, last_name, email, mobile, landline, nie_number,
                street_address, town, province, post_code,
                garage_name, vehicle_reg, pin
           FROM clients
          ORDER BY first_name, last_name
          LIMIT 20`
      );
  return rows;
}

export async function getAllClients() {
  const [rows] = await pool.query(
    `SELECT id, first_name, last_name, email, mobile, landline, nie_number,
            street_address, town, province, post_code,
            garage_name, vehicle_reg, pin
       FROM clients ORDER BY id`
  );
  return rows;
}

export async function getClientById(id) {
  const [[row]] = await pool.query(
    `SELECT id, first_name, last_name, email, mobile, landline, nie_number,
            street_address, town, province, post_code,
            garage_name, vehicle_reg, pin
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
  const pin = String(Math.floor(100000 + Math.random() * 900000));
  const pin_hash = await hashPassword(pin);
  const [{ insertId }] = await pool.query(
    `INSERT INTO clients
      (first_name, last_name, email, mobile, landline, nie_number,
       street_address, town, province, post_code,
       garage_name, vehicle_reg, password_hash, pin_hash, pin)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
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
      pin_hash,
      pin,
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
    pin,
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
    password,
  }
) {
  let sql = `UPDATE clients SET
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
       post_code=?`;
  const params = [
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
  ];
  if (password) {
    const password_hash = await hashPassword(password);
    sql += ', password_hash=?';
    params.push(password_hash);
  }
  sql += ' WHERE id=?';
  params.push(id);
  await pool.query(sql, params);
  return { ok: true };
}

export async function deleteClient(id) {
  await pool.query('DELETE FROM clients WHERE id=?', [id]);
  return { ok: true };
}

export async function getClientsWithVehicles() {
  const [rows] = await pool.query(
    `SELECT c.id AS client_id, c.first_name, c.last_name, c.email, c.mobile,
            c.landline, c.nie_number, c.street_address, c.town,
            c.province, c.post_code, c.garage_name, c.vehicle_reg, c.pin,
            v.licence_plate, v.make, v.model, v.color, v.company_vehicle_id
       FROM clients c
  LEFT JOIN vehicles v ON v.customer_id = c.id
   ORDER BY c.id, v.id`
  );
  return rows;
}
