import pool from '../lib/db.js';

export async function getSettings() {
  const [[row]] = await pool.query(
    `SELECT id, logo_url, company_name, address, phone, website, social_links, terms
       FROM company_settings ORDER BY id LIMIT 1`
  );
  return row || null;
}

export async function updateSettings({
  logo_url,
  company_name,
  address,
  phone,
  website,
  social_links,
  terms,
}) {
  const current = await getSettings();
  if (current) {
    await pool.query(
      `UPDATE company_settings SET logo_url=?, company_name=?, address=?, phone=?, website=?, social_links=?, terms=? WHERE id=?`,
      [logo_url || null, company_name || null, address || null, phone || null, website || null, social_links || null, terms || null, current.id]
    );
    return {
      id: current.id,
      logo_url,
      company_name,
      address,
      phone,
      website,
      social_links,
      terms,
    };
  }
  const [{ insertId }] = await pool.query(
    `INSERT INTO company_settings (logo_url, company_name, address, phone, website, social_links, terms)
     VALUES (?,?,?,?,?,?,?)`,
    [logo_url || null, company_name || null, address || null, phone || null, website || null, social_links || null, terms || null]
  );
  return {
    id: insertId,
    logo_url,
    company_name,
    address,
    phone,
    website,
    social_links,
    terms,
  };
}
