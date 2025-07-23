import pool from '../lib/db.js';
import { jobStatusExists } from './jobStatusesService.js';
import { createInvoice } from './invoicesService.js';
import { getVehicleById } from './vehiclesService.js';
import { getQuoteItems } from './quoteItemsService.js';

export async function getAllJobs(status) {
  const base =
    'SELECT id, customer_id, vehicle_id, scheduled_start, scheduled_end, status, bay, created_at FROM jobs';
  const [rows] = status
    ? await pool.query(`${base} WHERE status=? ORDER BY id`, [status])
    : await pool.query(`${base} ORDER BY id`);
  return rows;
}

export async function getJobsByFleet(fleet_id, status) {
  const base =
    `SELECT j.id, j.customer_id, j.vehicle_id, j.scheduled_start, j.scheduled_end, j.status, j.bay, j.created_at
       FROM jobs j
       JOIN vehicles v ON j.vehicle_id = v.id
      WHERE v.fleet_id=?`;
  const [rows] = status
    ? await pool.query(`${base} AND j.status=? ORDER BY j.id`, [fleet_id, status])
    : await pool.query(`${base} ORDER BY j.id`, [fleet_id]);
  return rows;
}

export async function getJobsByCustomer(customer_id, status) {
  const base =
    `SELECT id, customer_id, vehicle_id, scheduled_start, scheduled_end, status, bay, created_at FROM jobs WHERE customer_id=?`;
  const [rows] = status
    ? await pool.query(`${base} AND status=? ORDER BY id`, [customer_id, status])
    : await pool.query(`${base} ORDER BY id`, [customer_id]);
  return rows;
}

export async function getJobById(id) {
  const [[row]] = await pool.query(
    `SELECT id, customer_id, vehicle_id, scheduled_start, scheduled_end, status, bay, created_at
       FROM jobs WHERE id=?`,
    [id]
  );
  return row || null;
}

export async function createJob({ id, customer_id, vehicle_id, scheduled_start, scheduled_end, status, bay }) {
  const finalStatus = status || 'unassigned';
  const startDate = scheduled_start ? new Date(scheduled_start) : null;
  const endDate = scheduled_end ? new Date(scheduled_end) : null;
  const parsedVehicleId =
    vehicle_id !== undefined && vehicle_id !== null && !Number.isNaN(Number(vehicle_id))
      ? Number(vehicle_id)
      : null;
  if (!(await jobStatusExists(finalStatus))) {
    throw new Error('Invalid job status');
  }
  if (id !== undefined) {
    const [[exists]] = await pool.query('SELECT 1 FROM jobs WHERE id=?', [id]);
    if (exists) {
      throw new Error('Job ID already exists');
    }
    await pool.query(
      `INSERT INTO jobs (id, customer_id, vehicle_id, scheduled_start, scheduled_end, status, bay)
       VALUES (?,?,?,?,?,?,?)`,
      [
        id,
        customer_id || null,
        parsedVehicleId,
        startDate || null,
        endDate || null,
        finalStatus,
        bay || null,
      ]
    );
    return { id, customer_id, vehicle_id: parsedVehicleId, scheduled_start, scheduled_end, status: finalStatus, bay };
  }
  const [{ insertId }] = await pool.query(
    `INSERT INTO jobs (customer_id, vehicle_id, scheduled_start, scheduled_end, status, bay)
     VALUES (?,?,?,?,?,?)`,
    [
      customer_id || null,
      parsedVehicleId,
      startDate || null,
      endDate || null,
      finalStatus,
      bay || null,
    ]
  );
  return { id: insertId, customer_id, vehicle_id: parsedVehicleId, scheduled_start, scheduled_end, status: finalStatus, bay };
}

export async function updateJob(id, data = {}) {
  const { status } = data;
  if (status && !(await jobStatusExists(status))) {
    throw new Error('Invalid job status');
  }

  const fields = [];
  const params = [];
  const allowed = [
    'customer_id',
    'vehicle_id',
    'scheduled_start',
    'scheduled_end',
    'status',
    'bay',
    'notes',
  ];

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      let value = data[key];
      if (key === 'scheduled_start' || key === 'scheduled_end') {
        if (value === '' || value === undefined) {
          value = null;
        } else {
          const d = new Date(value);
          value = Number.isNaN(d.getTime()) ? null : d;
        }
      }
      fields.push(`${key}=?`);
      params.push(value ?? null);
    }
  }

  if (fields.length) {
    const sql = `UPDATE jobs SET ${fields.join(', ')} WHERE id=?`;
    params.push(id);
    await pool.query(sql, params);
  }

  if (status === 'notified client for collection') {
    await createInvoice({ job_id: id, customer_id: data.customer_id ?? null, status: 'awaiting collection' });
  }
  return { ok: true };
}

export async function deleteJob(id) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [tables] = await conn.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE COLUMN_NAME='job_id' AND TABLE_SCHEMA=DATABASE() AND TABLE_NAME <> 'jobs'`
    );
    for (const { TABLE_NAME } of tables) {
      await conn.query(`DELETE FROM \`${TABLE_NAME}\` WHERE job_id=?`, [id]);
    }
    await conn.query('DELETE FROM jobs WHERE id=?', [id]);
    await conn.commit();
    return { ok: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function getAssignments(job_id) {
  const [rows] = await pool.query(
    `SELECT id, job_id, user_id, assigned_at FROM job_assignments WHERE job_id=? ORDER BY id`,
    [job_id]
  );
  return rows;
}

export async function assignUser(job_id, user_id) {
  await pool.query('DELETE FROM job_assignments WHERE job_id=?', [job_id]);
  const [{ insertId }] = await pool.query(
    'INSERT INTO job_assignments (job_id, user_id) VALUES (?, ?)',
    [job_id, user_id]
  );
  return { id: insertId, job_id, user_id };
}

export async function removeAssignment(id) {
  await pool.query('DELETE FROM job_assignments WHERE id=?', [id]);
  return { ok: true };
}

export async function listActiveJobsForEngineer(user_id, status) {
  const params = [user_id];
  let where = 'ja.user_id=?';
  if (status) {
    where += ' AND j.status=?';
    params.push(status);
  }
  const [rows] = await pool.query(
    `SELECT j.id, j.customer_id, j.vehicle_id, j.scheduled_start, j.scheduled_end,
            j.status, j.bay, j.created_at
       FROM jobs j
       JOIN job_assignments ja ON j.id = ja.job_id
      WHERE ${where}
      ORDER BY j.id`,
    params
  );
  return rows;
}

export async function getJobsForDate(date) {
  const [rows] = await pool.query(
    `SELECT j.id, v.licence_plate, v.make, v.model,
            GROUP_CONCAT(u.username ORDER BY u.username SEPARATOR ', ') AS engineers,
            j.status, j.scheduled_start, j.scheduled_end,
            q.defect_description
       FROM jobs j
       JOIN vehicles v ON j.vehicle_id = v.id
  LEFT JOIN job_assignments ja ON j.id = ja.job_id
  LEFT JOIN users u ON ja.user_id = u.id
  LEFT JOIN (
        SELECT q1.job_id, q1.defect_description
          FROM quotes q1
          JOIN (
            SELECT job_id, MAX(revision) AS rev FROM quotes GROUP BY job_id
          ) q2 ON q1.job_id = q2.job_id AND q1.revision = q2.rev
  ) q ON q.job_id = j.id
      WHERE DATE(j.scheduled_start)=?
   GROUP BY j.id
   ORDER BY j.id`,
    [date]
  );
  return rows;
}

export async function getJobsInRange(start, end, engineer_id, status) {
  const params = [];
  let join = 'LEFT JOIN job_assignments ja ON j.id=ja.job_id';
  if (engineer_id) {
    join = 'JOIN job_assignments ja ON j.id=ja.job_id AND ja.user_id=?';
    params.push(engineer_id);
  }
  params.push(start, end);
  let where =
    '(j.scheduled_start>=? AND j.scheduled_end<=?) OR j.scheduled_start IS NULL OR j.scheduled_end IS NULL';
  if (status) {
    where += ' AND j.status=?';
    params.push(status);
  }
  const [rows] = await pool.query(
    `SELECT j.id, j.customer_id, j.vehicle_id, v.licence_plate,
            j.scheduled_start, j.scheduled_end,
            j.status, j.bay,
            GROUP_CONCAT(ja.user_id) AS engineer_ids
       FROM jobs j
  LEFT JOIN vehicles v ON j.vehicle_id = v.id
       ${join}
      WHERE ${where}
   GROUP BY j.id
   ORDER BY j.scheduled_start`,
    params
  );
  return rows.map(r => ({
    id: r.id,
    customer_id: r.customer_id,
    vehicle_id: r.vehicle_id,
    licence_plate: r.licence_plate,
    scheduled_start: r.scheduled_start,
    scheduled_end: r.scheduled_end,
    status: r.status,
    bay: r.bay,
    assignments: r.engineer_ids
      ? r.engineer_ids.split(',').map(id => ({ user_id: Number(id) }))
      : [],
  }));
}

export async function getJobDetails(id) {
  const job = await getJobById(id);
  if (!job) return null;
  const [assignments] = await pool.query(
    `SELECT ja.id, ja.user_id, u.username, ja.assigned_at
       FROM job_assignments ja
  LEFT JOIN users u ON ja.user_id = u.id
      WHERE ja.job_id=?
      ORDER BY ja.id`,
    [id]
  );
  job.assignments = assignments;
  return job;
}

export async function getJobFull(id) {
  const job = await getJobDetails(id);
  if (!job) return null;
  if (job.vehicle_id) {
    job.vehicle = await getVehicleById(job.vehicle_id);
  }
  const [[quoteRow]] = await pool.query(
    `SELECT id, defect_description, revision FROM quotes WHERE job_id=? ORDER BY revision DESC LIMIT 1`,
    [id]
  );
  if (quoteRow) {
    const items = await getQuoteItems(quoteRow.id);
    job.quote = { ...quoteRow, items };
  }
  return job;
}
