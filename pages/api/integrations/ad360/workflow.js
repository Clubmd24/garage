import pool from '../../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { tenantId, supplierId, action, vehicleId, vin, reg } = req.body;

    // Validate required fields
    if (!tenantId || !supplierId || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get session from supplier_accounts
    const [sessionRows] = await pool.query(
      'SELECT encrypted_session FROM supplier_accounts WHERE tenant_id = ? AND supplier_id = ?',
      [tenantId, supplierId]
    );

    if (!sessionRows.length) {
      return res.status(409).json({ 
        error: 'NEEDS_RELINK',
        message: 'AD360 account not linked. Please link your account first.'
      });
    }

    // Decrypt session
    const { decryptJSON } = await import('../../../../lib/cryptoVault.js');
    const session = decryptJSON(sessionRows[0].encrypted_session);

    if (!session || session.status !== 'active') {
      return res.status(409).json({ 
        error: 'NEEDS_RELINK',
        message: 'AD360 session expired. Please re-link your account.'
      });
    }

    // Handle different workflow actions
    switch (action) {
      case 'select_distributor':
        return await handleDistributorSelection(res, session, tenantId, supplierId);
      
      case 'navigate_tab':
        return await handleTabNavigation(res, session, tenantId, supplierId);
      
      case 'search_vehicle':
        if (!vin && !reg) {
          return res.status(400).json({ error: 'Vehicle VIN or registration required' });
        }
        return await handleVehicleSearch(res, session, tenantId, supplierId, vin, reg);
      
      case 'get_parts_departments':
        const { variantId } = req.body;
        return await handlePartsDepartments(res, session, tenantId, supplierId, variantId);
      
      case 'get_department_parts':
        const { department } = req.body;
        if (!department) {
          return res.status(400).json({ error: 'Department name required' });
        }
        return await handleDepartmentParts(res, session, tenantId, supplierId, department);
      
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('AD360 workflow error:', error);
    
    if (error.message === 'NEEDS_RELINK') {
      return res.status(409).json({ 
        error: 'NEEDS_RELINK',
        message: 'AD360 session expired. Please re-link your account in Suppliers.'
      });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleDistributorSelection(res, session, tenantId, supplierId) {
  try {
    // In production, this would use Playwright to navigate and select distributor
    // For now, return success with workflow step info
    
    // Write audit event
    await pool.query(
      'INSERT INTO audit_events (tenant_id, event_type, event_payload) VALUES (?, ?, ?)',
      [tenantId, 'ad360.workflow', JSON.stringify({ 
        action: 'select_distributor',
        supplierId,
        success: true,
        distributor: 'AD Vicente'
      })]
    );

    return res.status(200).json({
      status: 'success',
      action: 'select_distributor',
      distributor: 'AD Vicente',
      message: 'Distributor selected successfully'
    });
  } catch (error) {
    throw error;
  }
}

async function handleTabNavigation(res, session, tenantId, supplierId) {
  try {
    // In production, this would use Playwright to navigate to REPLACEMENT tab
    // For now, return success with workflow step info
    
    // Write audit event
    await pool.query(
      'INSERT INTO audit_events (tenant_id, event_type, event_payload) VALUES (?, ?, ?)',
      [tenantId, 'ad360.workflow', JSON.stringify({ 
        action: 'navigate_tab',
        supplierId,
        success: true,
        tab: 'REPLACEMENT'
      })]
    );

    return res.status(200).json({
      status: 'success',
      action: 'navigate_tab',
      tab: 'REPLACEMENT',
      message: 'Navigated to REPLACEMENT tab successfully'
    });
  } catch (error) {
    throw error;
  }
}

async function handleVehicleSearch(res, session, tenantId, supplierId, vin, reg) {
  try {
    // In production, this would use Playwright to search for vehicle
    // For now, return mock vehicle variants based on the AD360 screenshot
    
    // Mock vehicle variants based on the BMW 1 series example from AD360
    const variants = [
      {
        id: 'bmw-1-f20-116d-1',
        make: 'BMW',
        model: '1 (F20)',
        version: '116 d',
        power: '116cv',
        displacement: '85kw',
        engine: '1995cc N47 D20 C',
        years: '07/2011 a 02/2015',
        description: 'First generation BMW 1 Series (F20) with 116d diesel engine'
      },
      {
        id: 'bmw-1-f21-116d-2',
        make: 'BMW',
        model: '1 (F21)',
        version: '116 d',
        power: '116cv',
        displacement: '85kw',
        engine: '1995cc N47 D20 C',
        years: '07/2012 a 02/2015',
        description: 'First generation BMW 1 Series (F21) with 116d diesel engine'
      }
    ];
    
    // Write audit event
    await pool.query(
      'INSERT INTO audit_events (tenant_id, event_type, event_payload) VALUES (?, ?, ?)',
      [tenantId, 'ad360.workflow', JSON.stringify({ 
        action: 'search_vehicle',
        supplierId,
        success: true,
        vin,
        reg,
        variantCount: variants.length
      })]
    );

    return res.status(200).json({
      status: 'success',
      action: 'search_vehicle',
      vin,
      reg,
      variants,
      message: `Found ${variants.length} vehicle variant(s)`
    });
  } catch (error) {
    throw error;
  }
}

async function handlePartsDepartments(res, session, tenantId, supplierId, variantId) {
  try {
    // In production, this would use Playwright to get parts departments
    // For now, return mock departments based on the screenshot
    
    const departments = [
      { id: 'bodywork', name: 'Bodywork', icon: 'car-outline' },
      { id: 'motor', name: 'Motor', icon: 'engine' },
      { id: 'exhaust', name: 'Exhaust system', icon: 'exhaust-pipe' },
      { id: 'filters', name: 'Filters', icon: 'filter' },
      { id: 'brakes', name: 'Brakes', icon: 'brake-disc', highlighted: true },
      { id: 'refrigeration', name: 'Refrigeration', icon: 'wavy-lines' },
      { id: 'ignition', name: 'Ignition/Glow System', icon: 'spark-plug' },
      { id: 'electrical', name: 'Electrical system', icon: 'battery' },
      { id: 'suspension', name: 'Suspension/Damping', icon: 'shock-absorber' },
      { id: 'steering', name: 'Address', icon: 'steering-wheel' },
      { id: 'axle', name: 'Axle suspension/wheel guidance', icon: 'axle' },
      { id: 'drive', name: 'Wheel drive', icon: 'differential' },
      { id: 'belt', name: 'Belt transmission', icon: 'belt-pulley' },
      { id: 'glass', name: 'Glass cleaning', icon: 'windshield-wipers' },
      { id: 'clutch', name: 'Clutch / additional parts', icon: 'clutch-plate' },
      { id: 'fuel', name: 'Fuel supply', icon: 'fuel-pump' },
      { id: 'transmission', name: 'Transmission', icon: 'gearbox' },
      { id: 'heating', name: 'Heating / ventilation', icon: 'fan-blades' }
    ];
    
    // Write audit event
    await pool.query(
      'INSERT INTO audit_events (tenant_id, event_type, event_payload) VALUES (?, ?, ?)',
      [tenantId, 'ad360.workflow', JSON.stringify({ 
        action: 'get_parts_departments',
        supplierId,
        variantId,
        success: true,
        departmentCount: departments.length
      })]
    );

    return res.status(200).json({
      status: 'success',
      action: 'get_parts_departments',
      variantId,
      departments,
      message: 'Parts departments retrieved successfully'
    });
  } catch (error) {
    throw error;
  }
}

async function handleDepartmentParts(res, session, tenantId, supplierId, department) {
  try {
    // In production, this would use Playwright to get parts from specific department
    // For now, return mock parts based on department with multiple manufacturers
    
    const mockParts = {
      motor: [
        // NGK Parts
        { partNumber: 'SP-001', description: 'Spark Plugs Set', brand: 'NGK', price: 24.99, stock: 'In Stock' },
        { partNumber: 'SP-002', description: 'Spark Plug Cable Set', brand: 'NGK', price: 18.50, stock: 'In Stock' },
        { partNumber: 'SP-003', description: 'Ignition Coil', brand: 'NGK', price: 32.75, stock: '2-3 Days' },
        
        // Bosch Parts
        { partNumber: 'BOS-001', description: 'Fuel Injector', brand: 'BOSCH', price: 89.99, stock: 'In Stock' },
        { partNumber: 'BOS-002', description: 'Mass Air Flow Sensor', brand: 'BOSCH', price: 156.25, stock: 'In Stock' },
        { partNumber: 'BOS-003', description: 'Oxygen Sensor', brand: 'BOSCH', price: 67.80, stock: '1-2 Days' },
        { partNumber: 'BOS-004', description: 'Engine Control Unit', brand: 'BOSCH', price: 299.99, stock: '3-5 Days' },
        
        // Gates Parts
        { partNumber: 'TB-001', description: 'Timing Belt Kit', brand: 'Gates', price: 67.99, stock: '1-2 Days' },
        { partNumber: 'TB-002', description: 'Serpentine Belt', brand: 'Gates', price: 23.45, stock: 'In Stock' },
        { partNumber: 'TB-003', description: 'Tensioner Assembly', brand: 'Gates', price: 45.60, stock: 'In Stock' },
        
        // Hella Parts
        { partNumber: '6NU 014 864-681', description: 'Válvula EGR', brand: 'HELLA', price: 78.90, stock: 'In Stock' },
        { partNumber: '6PT 009 109-341', description: 'Sensor, temperatura del aire de admisión', brand: 'HELLA', price: 45.20, stock: 'In Stock' },
        { partNumber: '6PT 009 109-342', description: 'Sensor, temperatura del refrigerante', brand: 'HELLA', price: 38.75, stock: 'In Stock' },
        { partNumber: '6PT 009 109-343', description: 'Sensor, posición arbol de levas', brand: 'HELLA', price: 52.30, stock: 'In Stock' },
        { partNumber: '6PT 009 109-344', description: 'Generador de impulsos, cigüeñal', brand: 'HELLA', price: 67.45, stock: 'In Stock' },
        
        // Blue Print Parts
        { partNumber: 'BP-001', description: 'Camshaft Position Sensor', brand: 'BLUE PRINT', price: 41.99, stock: 'In Stock' },
        { partNumber: 'BP-002', description: 'Crankshaft Position Sensor', brand: 'BLUE PRINT', price: 39.50, stock: '2-3 Days' },
        { partNumber: 'BP-003', description: 'Throttle Position Sensor', brand: 'BLUE PRINT', price: 28.75, stock: 'In Stock' },
        
        // Febi Bilstein Parts
        { partNumber: 'FB-001', description: 'Engine Mount', brand: 'FEBI BILSTEIN', price: 89.99, stock: 'In Stock' },
        { partNumber: 'FB-002', description: 'Transmission Mount', brand: 'FEBI BILSTEIN', price: 67.50, stock: '1-2 Days' },
        { partNumber: 'FB-003', description: 'Stabilizer Bar Link', brand: 'FEBI BILSTEIN', price: 23.80, stock: 'In Stock' },
        
        // Castrol Parts
        { partNumber: 'CAST-001', description: 'Engine Oil 5W-30', brand: 'Castrol', price: 34.99, stock: 'In Stock' },
        { partNumber: 'CAST-002', description: 'Engine Oil 10W-40', brand: 'Castrol', price: 29.99, stock: 'In Stock' },
        { partNumber: 'CAST-003', description: 'Oil Filter', brand: 'Castrol', price: 12.50, stock: 'In Stock' },
        
        // Delphi Parts
        { partNumber: 'DEL-001', description: 'Fuel Pump', brand: 'DELPHI', price: 189.99, stock: '3-5 Days' },
        { partNumber: 'DEL-002', description: 'Fuel Filter', brand: 'DELPHI', price: 18.75, stock: 'In Stock' },
        { partNumber: 'DEL-003', description: 'Fuel Pressure Regulator', brand: 'DELPHI', price: 45.60, stock: '1-2 Days' },
        
        // AJUSA Parts
        { partNumber: 'AJU-001', description: 'Cylinder Head Gasket', brand: 'AJUSA', price: 156.99, stock: '2-3 Days' },
        { partNumber: 'AJU-002', description: 'Valve Cover Gasket', brand: 'AJUSA', price: 23.45, stock: 'In Stock' },
        { partNumber: 'AJU-003', description: 'Intake Manifold Gasket', brand: 'AJUSA', price: 34.80, stock: 'In Stock' },
        
        // FAE Parts
        { partNumber: 'FAE-001', description: 'Clutch Kit', brand: 'FAE', price: 234.99, stock: '3-5 Days' },
        { partNumber: 'FAE-002', description: 'Clutch Cable', brand: 'FAE', price: 28.50, stock: 'In Stock' },
        { partNumber: 'FAE-003', description: 'Clutch Master Cylinder', brand: 'FAE', price: 67.25, stock: '1-2 Days' }
      ],
      
      brakes: [
        { partNumber: 'BRK-001', description: 'Front Brake Pads', brand: 'BOSCH', price: 45.99, stock: 'In Stock' },
        { partNumber: 'BRK-002', description: 'Rear Brake Pads', brand: 'BOSCH', price: 38.50, stock: 'In Stock' },
        { partNumber: 'BRK-003', description: 'Brake Disc Front', brand: 'BOSCH', price: 67.80, stock: 'In Stock' },
        { partNumber: 'BRK-004', description: 'Brake Disc Rear', brand: 'BOSCH', price: 54.20, stock: 'In Stock' },
        { partNumber: 'BRK-005', description: 'Brake Caliper', brand: 'FEBI BILSTEIN', price: 89.99, stock: '2-3 Days' },
        { partNumber: 'BRK-006', description: 'Brake Hose', brand: 'FEBI BILSTEIN', price: 23.45, stock: 'In Stock' },
        { partNumber: 'BRK-007', description: 'Brake Fluid DOT4', brand: 'Castrol', price: 8.99, stock: 'In Stock' },
        { partNumber: 'BRK-008', description: 'Handbrake Cable', brand: 'AJUSA', price: 34.50, stock: 'In Stock' }
      ],
      
      filters: [
        { partNumber: 'FIL-001', description: 'Air Filter', brand: 'BOSCH', price: 15.99, stock: 'In Stock' },
        { partNumber: 'FIL-002', description: 'Oil Filter', brand: 'BOSCH', price: 12.50, stock: 'In Stock' },
        { partNumber: 'FIL-003', description: 'Fuel Filter', brand: 'BOSCH', price: 18.75, stock: 'In Stock' },
        { partNumber: 'FIL-004', description: 'Cabin Air Filter', brand: 'BOSCH', price: 22.99, stock: 'In Stock' },
        { partNumber: 'FIL-005', description: 'Air Filter', brand: 'MANN', price: 19.99, stock: 'In Stock' },
        { partNumber: 'FIL-006', description: 'Oil Filter', brand: 'MANN', price: 14.50, stock: 'In Stock' }
      ]
    };
    
    const parts = mockParts[department.toLowerCase()] || [];
    
    // Write audit event
    await pool.query(
      'INSERT INTO audit_events (tenant_id, event_type, event_payload) VALUES (?, ?, ?)',
      [tenantId, 'ad360.workflow', JSON.stringify({ 
        action: 'get_department_parts',
        supplierId,
        department,
        success: true,
        partCount: parts.length,
        manufacturers: [...new Set(parts.map(p => p.brand))]
      })]
    );

    return res.status(200).json({
      status: 'success',
      action: 'get_department_parts',
      department,
      parts,
      partCount: parts.length,
      manufacturers: [...new Set(parts.map(p => p.brand))],
      message: `${parts.length} parts from ${department} department retrieved successfully`
    });
  } catch (error) {
    throw error;
  }
} 