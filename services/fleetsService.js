import pool from '../lib/db.js';
import { getSettings } from './companySettingsService.js';

export async function getAllFleets() {
  const [rows] = await pool.query(
    `SELECT id, company_name, garage_name, account_rep, payment_terms,
            street_address, contact_number_1, contact_number_2,
            email_1, email_2, credit_limit, tax_number,
            contact_name_1, contact_name_2
       FROM fleets ORDER BY id`
  );
  return rows;
}

export async function getFleetById(id) {
  const [[row]] = await pool.query(
    `SELECT id, company_name, garage_name, account_rep, payment_terms,
            street_address, contact_number_1, contact_number_2,
            email_1, email_2, credit_limit, tax_number,
            contact_name_1, contact_name_2, pin
       FROM fleets WHERE id=?`,
    [id]
  );
  return row || null;
}
export async function createFleet({
  company_name,
  garage_name,
  account_rep,
  payment_terms,
  street_address,
  contact_number_1,
  contact_number_2,
  email_1,
  email_2,
  credit_limit,
  tax_number,
  contact_name_1,
  contact_name_2,
}) {
  if (!garage_name) {
    const settings = await getSettings();
    garage_name = settings?.company_name || garage_name;
  }
  const pin = String(Math.floor(1000 + Math.random() * 9000));
  const { hashPassword } = await import('../lib/auth.js');
  const pin_hash = await hashPassword(pin);
  const [{ insertId }] = await pool.query(
    `INSERT INTO fleets (
       company_name, garage_name, account_rep, payment_terms,
       street_address, contact_number_1, contact_number_2,
       email_1, email_2, credit_limit, tax_number,
       contact_name_1, contact_name_2,
       pin_hash, pin
     ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      company_name,
      garage_name || null,
      account_rep || null,
      payment_terms || null,
      street_address || null,
      contact_number_1 || null,
      contact_number_2 || null,
      email_1 || null,
      email_2 || null,
      credit_limit || null,
      tax_number || null,
      contact_name_1 || null,
      contact_name_2 || null,
      pin_hash,
      pin,
    ]
  );
  return {
    id: insertId,
    company_name,
    garage_name,
    account_rep,
    payment_terms,
    street_address,
    contact_number_1,
    contact_number_2,
    email_1,
    email_2,
    credit_limit,
    tax_number,
    contact_name_1,
    contact_name_2,
    pin,
  };
}

export async function updateFleet(
  id,
  {
    company_name,
    garage_name,
    account_rep,
    payment_terms,
    street_address,
    contact_number_1,
    contact_number_2,
    email_1,
    email_2,
    credit_limit,
    tax_number,
    contact_name_1,
    contact_name_2,
  }
) {
  if (!garage_name) {
    const settings = await getSettings();
    garage_name = settings?.company_name || garage_name;
  }
  await pool.query(
    `UPDATE fleets SET
       company_name=?,
       garage_name=?,
       account_rep=?,
       payment_terms=?,
       street_address=?,
       contact_number_1=?,
       contact_number_2=?,
       email_1=?,
       email_2=?,
       credit_limit=?,
       tax_number=?,
       contact_name_1=?,
       contact_name_2=?
     WHERE id=?`,
    [
      company_name,
      garage_name || null,
      account_rep || null,
      payment_terms || null,
      street_address || null,
      contact_number_1 || null,
      contact_number_2 || null,
      email_1 || null,
      email_2 || null,
      credit_limit || null,
      tax_number || null,
      contact_name_1 || null,
      contact_name_2 || null,
      id,
    ]
  );
  return { ok: true };
}

export async function deleteFleet(id) {
  await pool.query('DELETE FROM fleets WHERE id=?', [id]);
  return { ok: true };
}

export async function resetFleetPin(id) {
  const pin = String(Math.floor(1000 + Math.random() * 9000));
  const { hashPassword } = await import('../lib/auth.js');
  const pin_hash = await hashPassword(pin);
  await pool.query(
    'UPDATE fleets SET pin_hash=?, pin=? WHERE id=?',
    [pin_hash, pin, id]
  );
  return pin;
}

