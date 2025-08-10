import pool from '../../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { tenantId, supplierId, vehicleId, q } = req.query;

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

    // Create vehicle key for cache lookup
    const vehicleKey = `VIN:${vin || ''}|REG:${reg || ''}`;

    // Get cached data for this vehicle
    const [cacheRows] = await pool.query(
      'SELECT payload, fetched_at FROM ad360_cache WHERE tenant_id = ? AND supplier_id = ? AND vehicle_key = ?',
      [tenantId, supplierId, vehicleKey]
    );

    if (!cacheRows.length) {
      return res.status(404).json({ error: 'No cached data found for this vehicle' });
    }

    const cached = cacheRows[0];
    const items = JSON.parse(cached.payload);

    // Filter items by search query if provided
    let filteredItems = items;
    if (q && q.trim()) {
      const searchTerm = q.toLowerCase().trim();
      filteredItems = items.filter(item => 
        (item.partNumber && item.partNumber.toLowerCase().includes(searchTerm)) ||
        (item.brand && item.brand.toLowerCase().includes(searchTerm)) ||
        (item.description && item.description.toLowerCase().includes(searchTerm))
      );
    }

    // Limit results to 50 items
    filteredItems = filteredItems.slice(0, 50);

    return res.status(200).json({
      vehicleKey,
      items: filteredItems,
      totalItems: items.length,
      filteredItems: filteredItems.length,
      fetchedAt: cached.fetched_at,
      searchQuery: q || null
    });

  } catch (error) {
    console.error('AD360 search error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 