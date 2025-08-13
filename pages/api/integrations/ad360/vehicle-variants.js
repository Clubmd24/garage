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

    // Create vehicle key for caching variants
    const vehicleKey = `VARIANTS:VIN:${vin || ''}|REG:${reg || ''}`;

    // Check cache (30 minute TTL for variants)
    const cacheTTL = 30 * 60; // 30 minutes in seconds
    
    // TEMPORARILY DISABLE CACHE TO FORCE FRESH DATA
    // TODO: Re-enable cache after confirming new data works
    console.log('🔄 TEMPORARILY DISABLED CACHE - forcing fresh AD360 API call');
    
    // Clear any existing cache for this vehicle to force fresh data
    await pool.query(
      'DELETE FROM ad360_cache WHERE tenant_id = ? AND supplier_id = ? AND vehicle_key = ?',
      [tenantId, supplierId, vehicleKey]
    );
    
    console.log('🗑️ Cleared cached data for vehicle:', vehicleKey);

    // Fetch vehicle variants from AD360
    try {
      // Import the worker function
      const { fetchVehicleVariants } = await import('../../../../scrapers/ad360/worker.js');
      
      // Fetch variants using the license plate
      const variants = await fetchVehicleVariants(tenantId, supplierId, vin, reg);
      
      // Cache the results
      await pool.query(
        `INSERT INTO ad360_cache (tenant_id, supplier_id, vehicle_key, payload, fetched_at)
         VALUES (?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE payload = VALUES(payload), fetched_at = NOW()`,
        [tenantId, supplierId, vehicleKey, JSON.stringify(variants)]
      );

      // Write audit event
      await pool.query(
        'INSERT INTO audit_events (tenant_id, event_type, event_payload) VALUES (?, ?, ?)',
        [tenantId, 'ad360.variants', JSON.stringify({ 
          supplierId, 
          vehicleId, 
          vehicleKey, 
          variantCount: variants.length,
          success: true,
          mode: 'live'
        })]
      );

      return res.status(200).json({
        vehicleKey,
        variants: variants,
        fetchedAt: new Date().toISOString(),
        ttlSeconds: cacheTTL,
        cached: false,
        mode: 'live'
      });

    } catch (error) {
      // Write audit event for error
      await pool.query(
        'INSERT INTO audit_events (tenant_id, event_type, event_payload) VALUES (?, ?, ?)',
        [tenantId, 'ad360.variants', JSON.stringify({ 
          supplierId, 
          vehicleId, 
          vehicleKey, 
          error: error.message,
          success: false,
          mode: 'live'
        })]
      );

      if (error.message === 'NEEDS_RELINK') {
        return res.status(409).json({ error: 'NEEDS_RELINK', message: 'AD360 account needs to be relinked' });
      }

      throw error;
    }

  } catch (error) {
    console.error('Vehicle variants error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Failed to fetch vehicle variants',
      details: error.message 
    });
  }
}
