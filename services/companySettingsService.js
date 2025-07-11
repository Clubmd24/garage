import pool from '../lib/db.js';

export async function getSettings() {
  const [[row]] = await pool.query(
    `SELECT id, logo_url, company_name, address, phone, website, social_links,
            bank_details, invoice_terms, quote_terms, terms
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
  bank_details,
  invoice_terms,
  quote_terms,
  terms,
}) {
  const current = await getSettings();
  if (current) {
    await pool.query(
      `UPDATE company_settings SET logo_url=?, company_name=?, address=?, phone=?, website=?, social_links=?, bank_details=?, invoice_terms=?, quote_terms=?, terms=? WHERE id=?`,
      [
        logo_url || null,
        company_name || null,
        address || null,
        phone || null,
        website || null,
        social_links || null,
        bank_details || null,
        invoice_terms || null,
        quote_terms || null,
        terms || null,
        current.id,
      ]
    );
    return {
      id: current.id,
      logo_url,
      company_name,
      address,
      phone,
      website,
      social_links,
      bank_details,
      invoice_terms,
      quote_terms,
      terms,
    };
  }
  const [{ insertId }] = await pool.query(
    `INSERT INTO company_settings (logo_url, company_name, address, phone, website, social_links, bank_details, invoice_terms, quote_terms, terms)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      logo_url || null,
      company_name || null,
      address || null,
      phone || null,
      website || null,
      social_links || null,
      bank_details || null,
      invoice_terms || null,
      quote_terms || null,
      terms || null,
    ]
  );
  return {
    id: insertId,
    logo_url,
    company_name,
    address,
    phone,
    website,
    social_links,
    bank_details,
    invoice_terms,
    quote_terms,
    terms,
  };
}
