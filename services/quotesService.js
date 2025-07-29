import pool from "../lib/db.js";
import { getSettings } from "./companySettingsService.js";

export async function getAllQuotes() {
  const [rows] = await pool.query(
    `SELECT 
       q.id, 
       q.customer_id, 
       q.fleet_id, 
       q.job_id, 
       q.revision, 
       q.vehicle_id, 
       q.fleet_vehicle_id, 
       q.customer_reference, 
       q.po_number, 
       q.defect_description, 
       q.total_amount, 
       q.status, 
       q.terms, 
       q.created_ts,
       c.first_name,
       c.last_name,
       v.licence_plate,
       v.make,
       v.model,
       v.color
     FROM quotes q
     LEFT JOIN clients c ON q.customer_id = c.id
     LEFT JOIN vehicles v ON q.vehicle_id = v.id
     ORDER BY q.id`,
  );
  return rows;
}

export async function getQuotesByFleet(fleet_id) {
  const [rows] = await pool.query(
    `SELECT 
       q.id, 
       q.customer_id, 
       q.fleet_id, 
       q.job_id, 
       q.revision, 
       q.vehicle_id, 
       q.fleet_vehicle_id, 
       q.customer_reference, 
       q.po_number, 
       q.defect_description, 
       q.total_amount, 
       q.status, 
       q.terms, 
       q.created_ts,
       c.first_name,
       c.last_name,
       v.licence_plate,
       v.make,
       v.model,
       v.color
     FROM quotes q
     LEFT JOIN clients c ON q.customer_id = c.id
     LEFT JOIN vehicles v ON q.vehicle_id = v.id
     WHERE q.fleet_id=? 
     ORDER BY q.id`,
    [fleet_id],
  );
  return rows;
}

export async function getQuotesByCustomer(customer_id) {
  const [rows] = await pool.query(
    `SELECT 
       q.id, 
       q.customer_id, 
       q.fleet_id, 
       q.job_id, 
       q.revision, 
       q.vehicle_id, 
       q.fleet_vehicle_id, 
       q.customer_reference, 
       q.po_number, 
       q.defect_description, 
       q.total_amount, 
       q.status, 
       q.terms, 
       q.created_ts,
       c.first_name,
       c.last_name,
       v.licence_plate,
       v.make,
       v.model,
       v.color
     FROM quotes q
     LEFT JOIN clients c ON q.customer_id = c.id
     LEFT JOIN vehicles v ON q.vehicle_id = v.id
     WHERE q.customer_id=? 
     ORDER BY q.id`,
    [customer_id],
  );
  return rows;
}

export async function getQuotesByVehicle(vehicle_id) {
  const [rows] = await pool.query(
    `SELECT 
       q.id, 
       q.customer_id, 
       q.fleet_id, 
       q.job_id, 
       q.revision, 
       q.vehicle_id, 
       q.fleet_vehicle_id, 
       q.customer_reference, 
       q.po_number, 
       q.defect_description, 
       q.total_amount, 
       q.status, 
       q.terms, 
       q.created_ts,
       c.first_name,
       c.last_name,
       v.licence_plate,
       v.make,
       v.model,
       v.color
     FROM quotes q
     LEFT JOIN clients c ON q.customer_id = c.id
     LEFT JOIN vehicles v ON q.vehicle_id = v.id
     WHERE q.vehicle_id=? 
     ORDER BY q.id`,
    [vehicle_id],
  );
  return rows;
}

export async function getQuotesByJob(job_id) {
  const [rows] = await pool.query(
    `SELECT 
       q.id, 
       q.customer_id, 
       q.fleet_id, 
       q.job_id, 
       q.revision, 
       q.vehicle_id, 
       q.fleet_vehicle_id, 
       q.customer_reference, 
       q.po_number, 
       q.defect_description, 
       q.total_amount, 
       q.status, 
       q.terms, 
       q.created_ts,
       c.first_name,
       c.last_name,
       v.licence_plate,
       v.make,
       v.model,
       v.color
     FROM quotes q
     LEFT JOIN clients c ON q.customer_id = c.id
     LEFT JOIN vehicles v ON q.vehicle_id = v.id
     WHERE q.job_id=? 
     ORDER BY q.id`,
    [job_id],
  );
  return rows;
}

export async function getQuoteById(id) {
  const [[row]] = await pool.query(
    `SELECT 
       q.id, 
       q.customer_id, 
       q.fleet_id, 
       q.job_id, 
       q.revision, 
       q.vehicle_id, 
       q.fleet_vehicle_id, 
       q.customer_reference, 
       q.po_number, 
       q.defect_description, 
       q.total_amount, 
       q.status, 
       q.terms, 
       q.created_ts,
       c.first_name,
       c.last_name,
       v.licence_plate,
       v.make,
       v.model,
       v.color
     FROM quotes q
     LEFT JOIN clients c ON q.customer_id = c.id
     LEFT JOIN vehicles v ON q.vehicle_id = v.id
     WHERE q.id=?`,
    [id],
  );
  return row || null;
}

export async function createQuote({
  customer_id,
  fleet_id,
  job_id,
  vehicle_id,
  fleet_vehicle_id,
  customer_reference,
  po_number,
  defect_description,
  total_amount,
  status,
  terms,
  revision,
}) {
  if (fleet_vehicle_id === undefined) {
    if (vehicle_id) {
      const [[row]] = await pool.query(
        "SELECT company_vehicle_id FROM vehicles WHERE id=?",
        [vehicle_id],
      );
      fleet_vehicle_id = row?.company_vehicle_id ?? null;
    } else {
      fleet_vehicle_id = null;
    }
  }

  if (revision === undefined) {
    if (job_id) {
      const [[r]] = await pool.query(
        "SELECT MAX(revision) AS rev FROM quotes WHERE job_id=?",
        [job_id],
      );
      revision = (r?.rev || 0) + 1;
    } else {
      revision = 1;
    }
  }

  if (terms === undefined) {
    const settings = await getSettings();
    terms = settings?.quote_terms ?? null;
  }

  const [{ insertId }] = await pool.query(
    `INSERT INTO quotes
      (customer_id, fleet_id, job_id, revision, vehicle_id, fleet_vehicle_id, customer_reference, po_number, defect_description, total_amount, status, terms)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      customer_id || null,
      fleet_id || null,
      job_id || null,
      revision,
      vehicle_id || null,
      fleet_vehicle_id || null,
      customer_reference || null,
      po_number || null,
      defect_description || null,
      total_amount || null,
      status || null,
      terms || null,
    ],
  );
  return {
    id: insertId,
    customer_id,
    fleet_id,
    job_id,
    revision,
    vehicle_id,
    fleet_vehicle_id,
    customer_reference,
    po_number,
    defect_description,
    total_amount,
    status,
    terms,
  };
}

export async function updateQuote(
  id,
  {
    customer_id,
    fleet_id,
    job_id,
    vehicle_id,
    fleet_vehicle_id,
    customer_reference,
    po_number,
    defect_description,
    total_amount,
    status,
    terms,
    revision,
  },
) {
  const existing = await getQuoteById(id);
  if (!existing) throw new Error("Quote not found");

  const data = {
    customer_id: customer_id !== undefined ? customer_id : existing.customer_id,
    fleet_id: fleet_id !== undefined ? fleet_id : existing.fleet_id,
    job_id: job_id !== undefined ? job_id : existing.job_id,
    vehicle_id: vehicle_id !== undefined ? vehicle_id : existing.vehicle_id,
    fleet_vehicle_id:
      fleet_vehicle_id !== undefined
        ? fleet_vehicle_id
        : existing.fleet_vehicle_id,
    customer_reference:
      customer_reference !== undefined
        ? customer_reference
        : existing.customer_reference,
    po_number: po_number !== undefined ? po_number : existing.po_number,
    defect_description:
      defect_description !== undefined
        ? defect_description
        : existing.defect_description,
    total_amount:
      total_amount !== undefined ? total_amount : existing.total_amount,
    status: status !== undefined ? status : existing.status,
    terms: terms !== undefined ? terms : existing.terms,
    revision: revision !== undefined ? revision : existing.revision,
  };

  if (data.fleet_vehicle_id === undefined) {
    if (data.vehicle_id) {
      const [[row]] = await pool.query(
        "SELECT company_vehicle_id FROM vehicles WHERE id=?",
        [data.vehicle_id],
      );
      data.fleet_vehicle_id = row?.company_vehicle_id ?? null;
    } else {
      data.fleet_vehicle_id = null;
    }
  }

  await pool.query(
    `UPDATE quotes SET
       customer_id=?,
       fleet_id=?,
       job_id=?,
       revision=?,
       vehicle_id=?,
       fleet_vehicle_id=?,
       customer_reference=?,
       po_number=?,
       defect_description=?,
       total_amount=?,
       status=?,
       terms=?
     WHERE id=?`,
    [
      data.customer_id || null,
      data.fleet_id || null,
      data.job_id || null,
      data.revision,
      data.vehicle_id || null,
      data.fleet_vehicle_id || null,
      data.customer_reference || null,
      data.po_number || null,
      data.defect_description || null,
      data.total_amount || null,
      data.status || null,
      data.terms || null,
      id,
    ],
  );
  return { ok: true };
}

export async function deleteQuote(id) {
  await pool.query("DELETE FROM quotes WHERE id=?", [id]);
  return { ok: true };
}
