import apiHandler from '../../../lib/apiHandler.js';
import {
  getClientById,
  createClient,
  updateClient,
  searchClients,
} from '../../../services/clientsService.js';
import {
  getVehicleById,
  createVehicle,
  updateVehicle,
  getAllVehicles,
} from '../../../services/vehiclesService.js';
import {
  getFleetById,
  createFleet,
  updateFleet,
  getAllFleets,
} from '../../../services/fleetsService.js';

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const headers = lines[0]
    .split(',')
    .map(h => h.replace(/^"|"$/g, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const row = [];
    let field = '';
    let inQuotes = false;
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '"') {
        if (inQuotes && line[j + 1] === '"') {
          field += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        row.push(field);
        field = '';
      } else {
        field += c;
      }
    }
    row.push(field);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = row[idx] || '';
    });
    rows.push(obj);
  }
  return rows;
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const text = typeof req.body === 'string' ? req.body : req.body.toString();
  const rows = parseCSV(text);
  const vehicles = await getAllVehicles();
  const fleets = await getAllFleets();
  for (const row of rows) {
    // FLEET
    let fleetId = row.fleet_id ? Number(row.fleet_id) : null;
    let fleet = fleetId ? await getFleetById(fleetId) : null;
    if (!fleet && row.company_name) {
      fleet = fleets.find(f => f.company_name === row.company_name);
      fleetId = fleet?.id || null;
    }
    const fleetData = {
      company_name: row.company_name || undefined,
      garage_name: row.garage_name || undefined,
      account_rep: row.account_rep || undefined,
      payment_terms: row.payment_terms || undefined,
      street_address: row.fleet_street_address || undefined,
      contact_number_1: row.contact_number_1 || undefined,
      contact_number_2: row.contact_number_2 || undefined,
      email_1: row.email_1 || undefined,
      email_2: row.email_2 || undefined,
      credit_limit: row.credit_limit || undefined,
      tax_number: row.tax_number || undefined,
      contact_name_1: row.contact_name_1 || undefined,
      contact_name_2: row.contact_name_2 || undefined,
    };
    if (fleet) {
      await updateFleet(fleet.id, fleetData);
    } else if (row.company_name) {
      const created = await createFleet(fleetData);
      fleetId = created.id;
      fleets.push({ id: fleetId, company_name: row.company_name });
    }

    // CLIENT
    let clientId = row.client_id ? Number(row.client_id) : null;
    let client = clientId ? await getClientById(clientId) : null;
    if (!client && row.email) {
      const results = await searchClients(row.email);
      client = results.find(c => c.email === row.email) || null;
      clientId = client?.id || null;
    }
    const clientData = {
      first_name: row.first_name || undefined,
      last_name: row.last_name || undefined,
      email: row.email || undefined,
      mobile: row.mobile || undefined,
      landline: row.landline || undefined,
      nie_number: row.nie_number || undefined,
      street_address: row.street_address || undefined,
      town: row.town || undefined,
      province: row.province || undefined,
      post_code: row.post_code || undefined,
      garage_name: row.garage_name || undefined,
      vehicle_reg: row.vehicle_reg || undefined,
    };
    if (client) {
      await updateClient(client.id, clientData);
    } else {
      const created = await createClient(clientData);
      clientId = created.id;
    }

    // VEHICLE
    let vehicleId = row.vehicle_id ? Number(row.vehicle_id) : null;
    let vehicle = vehicleId ? await getVehicleById(vehicleId) : null;
    if (!vehicle && row.licence_plate) {
      vehicle = vehicles.find(v => v.licence_plate === row.licence_plate) || null;
      vehicleId = vehicle?.id || null;
    }
    const vehicleData = {
      licence_plate: row.licence_plate || undefined,
      make: row.make || undefined,
      model: row.model || undefined,
      color: row.color || undefined,
      vin_number: row.vin_number || undefined,
      company_vehicle_id: row.company_vehicle_id || undefined,
      customer_id: clientId || undefined,
      fleet_id: fleetId || undefined,
      service_date: row.service_date || undefined,
      itv_date: row.itv_date || undefined,
    };
    if (vehicle) {
      await updateVehicle(vehicle.id, vehicleData);
    } else if (row.licence_plate) {
      const created = await createVehicle(vehicleData);
      vehicles.push({ id: created.id, licence_plate: row.licence_plate });
    }
  }
  res.json({ ok: true });
}

export default apiHandler(handler);
