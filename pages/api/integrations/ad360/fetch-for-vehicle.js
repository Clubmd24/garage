import pool from '../../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { tenantId, supplierId, vehicleId } = req.body;

    // Validate required fields
    if (!tenantId || !supplierId || !vehicleId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Resolve VIN/REG from vehicleId
    const [vehicleRows] = await pool.query(
      'SELECT vin_number, licence_plate FROM vehicles WHERE id = ?',
      [vehicleId]
    );

    if (!vehicleRows.length) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const vehicle = vehicleRows[0];
    const vin = vehicle.vin_number;
    const reg = vehicle.licence_plate;

    if (!vin && !reg) {
      return res.status(400).json({ error: 'Vehicle must have either VIN or license plate' });
    }

    // Create vehicle key for caching
    const vehicleKey = `VIN:${vin || ''}|REG:${reg || ''}`;

    // Check cache (60 minute TTL)
    const cacheTTL = 60 * 60; // 60 minutes in seconds
    const [cacheRows] = await pool.query(
      'SELECT payload, fetched_at FROM ad360_cache WHERE tenant_id = ? AND supplier_id = ? AND vehicle_key = ? AND fetched_at > DATE_SUB(NOW(), INTERVAL ? SECOND)',
      [tenantId, supplierId, vehicleKey, cacheTTL]
    );

    if (cacheRows.length > 0) {
      const cached = cacheRows[0];
      return res.status(200).json({
        vehicleKey,
        items: JSON.parse(cached.payload),
        fetchedAt: cached.fetched_at,
        ttlSeconds: cacheTTL,
        cached: true
      });
    }

    // Fetch from AD360 using the updated worker with complete workflow
    try {
      // Import the updated worker
      const { fetchPartsForVehicle } = await import('../../../../scrapers/ad360/worker.js');
      
      // Fetch parts using the complete AD360 workflow
      const items = await fetchPartsForVehicle(tenantId, supplierId, vin, reg);
      
      // Cache the results
      await pool.query(
        `INSERT INTO ad360_cache (tenant_id, supplier_id, vehicle_key, payload, fetched_at)
         VALUES (?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE payload = VALUES(payload), fetched_at = NOW()`,
        [tenantId, supplierId, vehicleKey, JSON.stringify(items)]
      );

      // Write audit event
      await pool.query(
        'INSERT INTO audit_events (tenant_id, event_type, event_payload) VALUES (?, ?, ?)',
        [tenantId, 'ad360.fetch', JSON.stringify({ 
          supplierId, 
          vehicleId, 
          vehicleKey, 
          itemCount: items.length,
          success: true,
          mode: 'live',
          workflow: 'complete' // Indicates we used the full workflow
        })]
      );

      return res.status(200).json({
        vehicleKey,
        items: items,
        fetchedAt: new Date().toISOString(),
        ttlSeconds: cacheTTL,
        cached: false,
        mode: 'live',
        workflow: 'complete'
      });

    } catch (error) {
      // Write audit event for error
      await pool.query(
        'INSERT INTO audit_events (tenant_id, event_type, event_payload) VALUES (?, ?, ?)',
        [tenantId, 'ad360.fetch', JSON.stringify({ 
          supplierId, 
          vehicleId, 
          vehicleKey,
          error: error.message,
          success: false,
          workflow: 'complete'
        })]
      );

      // If it's a session expiry error, return specific status
      if (error.message === 'NEEDS_RELINK') {
        return res.status(409).json({ 
          error: 'NEEDS_RELINK',
          message: 'AD360 session expired. Please re-link your account in Suppliers.'
        });
      }

      throw error;
    }

  } catch (error) {
    console.error('AD360 fetch error:', error);
    
    if (error.message === 'NEEDS_RELINK') {
      return res.status(409).json({ 
        error: 'NEEDS_RELINK',
        message: 'AD360 session expired. Please re-link your account in Suppliers.'
      });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
} 