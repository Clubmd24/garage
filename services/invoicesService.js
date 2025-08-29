import pool from '../lib/db.js';
import { invoiceStatusExists } from './invoiceStatusesService.js';
export async function getAllInvoices() {
  const [rows] = await pool.query(
    `SELECT i.id, i.job_id, i.client_id, i.total_amount, i.due_date, i.status, i.terms, i.created_at,
            c.first_name, c.last_name, c.mobile,
            v.licence_plate, v.make, v.model, v.color
       FROM invoices i
       LEFT JOIN clients c ON i.client_id = c.id
       LEFT JOIN vehicles v ON i.vehicle_id = v.id
       LEFT JOIN jobs j ON i.job_id = j.id
       ORDER BY i.id`
  );
  return rows;
}

export async function getInvoicesByCustomer(client_id, status) {
  const base = `SELECT i.id, i.job_id, i.client_id, i.total_amount, i.due_date, i.status, i.terms, i.created_at,
                       c.first_name, c.last_name, c.mobile,
                       v.licence_plate, v.make, v.model, v.color
                FROM invoices i
                LEFT JOIN clients c ON i.client_id = c.id
                LEFT JOIN vehicles v ON i.job_id = v.id
                LEFT JOIN jobs j ON i.job_id = j.id AND j.vehicle_id = v.id
                WHERE i.client_id=?`;
  const [rows] = status
    ? await pool.query(`${base} AND i.status=? ORDER BY i.id`, [client_id, status])
    : await pool.query(`${base} ORDER BY i.id`, [client_id]);
  return rows;
}

export async function getInvoicesByFleet(fleet_id, status) {
  const base = `SELECT i.id, i.job_id, i.client_id, i.total_amount, i.due_date, i.status, i.terms, i.created_at
       FROM invoices i
       JOIN jobs j ON i.job_id=j.id
       JOIN vehicles v ON j.vehicle_id=v.id
      WHERE v.fleet_id=?`;
  const [rows] = status
    ? await pool.query(`${base} AND i.status=? ORDER BY i.id`, [fleet_id, status])
    : await pool.query(`${base} ORDER BY i.id`, [fleet_id]);
  return rows;
}

export async function getInvoiceById(id) {
  const [[invoice]] = await pool.query(
    `SELECT i.id, i.job_id, i.client_id, i.total_amount, i.due_date, i.status, i.terms, i.created_at
       FROM invoices i WHERE i.id=?`,
    [id]
  );
  
  if (!invoice) return null;

  // Get client details
  let client = null;
  if (invoice.client_id) {
    const [[clientData]] = await pool.query(
      `SELECT id, first_name, last_name, email, mobile, landline, 
              street_address, town, province, post_code
       FROM clients WHERE id = ?`,
      [invoice.client_id]
    );
    client = clientData;
  }

  // Get vehicle details
  let vehicle = null;
  if (invoice.job_id) {
    const [[vehicleData]] = await pool.query(
      `SELECT v.id, v.licence_plate, v.make, v.model, v.color
       FROM vehicles v
       JOIN jobs j ON v.id = j.vehicle_id
       WHERE j.id = ?`,
      [invoice.job_id]
    );
    vehicle = vehicleData;
  }

  // Get invoice items
  const [items] = await pool.query(
    `SELECT id, description, qty, unit_price, (qty * unit_price) as line_total
     FROM invoice_items 
     WHERE invoice_id = ?
     ORDER BY id`,
    [id]
  );

  // Get defect description from associated quote
  let defect_description = null;
  if (invoice.job_id) {
    const [[quoteData]] = await pool.query(
      `SELECT defect_description 
       FROM quotes 
       WHERE job_id = ? 
       ORDER BY revision DESC 
       LIMIT 1`,
      [invoice.job_id]
    );
    defect_description = quoteData?.defect_description;
  }

  return {
    ...invoice,
    client,
    vehicle,
    items,
    defect_description
  };
}

export async function createInvoice({ id, job_id, client_id, amount, due_date, status, terms }) {
  if (status && !(await invoiceStatusExists(status))) {
    throw new Error('Invalid invoice status');
  }
  if (terms === undefined) {
    const settings = await getSettings();
    terms = settings?.invoice_terms ?? null;
  }
  if (id !== undefined) {
    const [[exists]] = await pool.query('SELECT 1 FROM invoices WHERE id=?', [id]);
    if (exists) {
      throw new Error('Invoice ID already exists');
    }
    await pool.query(
      `INSERT INTO invoices
        (id, job_id, client_id, amount, due_date, status, terms)
       VALUES (?,?,?,?,?,?,?)`,
      [id, job_id || null, client_id || null, amount || null, due_date || null, status || null, terms || null]
    );
    return { id, job_id, client_id, amount, due_date, status, terms };
  }
  const [{ insertId }] = await pool.query(
    `INSERT INTO invoices
      (job_id, client_id, amount, due_date, status, terms)
     VALUES (?,?,?,?,?,?)`,
    [job_id || null, client_id || null, amount || null, due_date || null, status || null, terms || null]
  );
  return { id: insertId, job_id, client_id, amount, due_date, status, terms };
}

export async function createInvoiceFromQuote(quoteId, { amount, due_date, status, terms }) {
  // Get quote data
  const [[quote]] = await pool.query(
    `SELECT * FROM quotes WHERE id = ?`,
    [quoteId]
  );
  
  if (!quote) {
    throw new Error('Quote not found');
  }

  // Create invoice with the same ID as the quote for pipeline numbering
  const invoice = await createInvoice({
    id: quoteId, // Use quote ID as invoice ID
    job_id: quote.job_id,
    client_id: quote.client_id,
    amount: amount || quote.total_amount,
    due_date,
    status: status || 'issued',
    terms: terms || quote.terms,
  });

  // Copy quote items to invoice items
  const quoteItems = await getQuoteItems(quoteId);
  
  console.log(`Creating invoice ${invoice.id} from quote ${quoteId} with ${quoteItems.length} items`);
  
  for (const item of quoteItems) {
    // Ensure we have valid data for each field with proper fallbacks
    const description = item.description || item.partNumber || 'Service Item';
    const qty = item.qty || 1;
    const unitPrice = item.unit_price || item.unit_cost || 0;
    
    console.log(`Processing item: description="${description}", qty=${qty}, unitPrice=${unitPrice}`);
    
    await pool.query(
      `INSERT INTO invoice_items 
        (invoice_id, description, qty, unit_price)
       VALUES (?, ?, ?, ?)`,
      [
        invoice.id,
        description,
        qty,
        unitPrice,
      ]
    );
  }
  
  console.log(`Successfully created invoice ${invoice.id} with ${quoteItems.length} items`);

  return invoice;
}

export async function updateInvoice(
  id,
  { job_id, client_id, amount, due_date, status, terms }
) {
  if (status && !(await invoiceStatusExists(status))) {
    throw new Error('Invalid invoice status');
  }
  await pool.query(
    `UPDATE invoices SET
       job_id=?,
       client_id=?,
       amount=?,
       due_date=?,
       status=?,
       terms=?
     WHERE id=?`,
    [job_id || null, client_id || null, amount || null, due_date || null, status || null, terms || null, id]
  );
  return { ok: true };
}

export async function deleteInvoice(id) {
  await pool.query('DELETE FROM invoices WHERE id=?', [id]);
  return { ok: true };
}
