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
      case 'complete_workflow':
        return await handleCompleteWorkflow(res, session, tenantId, supplierId, vehicleId, vin, reg);
        
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

async function handleCompleteWorkflow(res, session, tenantId, supplierId, vehicleId, vin, reg) {
  try {
    console.log('AD360 Complete Workflow:', { vehicleId, vin, reg, supplierId, tenantId });
    
    // Simulate the complete AD360 workflow
    // In production, this would use Playwright to navigate through all steps
    
    // Step 1: Select distributor
    console.log('Step 1: Selecting distributor AD Vicente...');
    
    // Step 2: Navigate to REPLACEMENT tab
    console.log('Step 2: Navigating to REPLACEMENT tab...');
    
    // Step 3: Search for vehicle
    console.log('Step 3: Searching for vehicle...');
    
    // Step 4: Get parts departments
    console.log('Step 4: Getting parts departments...');
    
    // Step 5: Return mock parts data
    const mockParts = [
      {
        id: 'ad360-part-1',
        partNumber: 'AD360-001',
        description: 'Brake Pads - Front',
        price: { amount: 45.99, currency: 'EUR' },
        manufacturer: 'AD360',
        category: 'Brakes',
        compatibility: `${reg || 'Vehicle'} - Compatible Parts`
      },
      {
        id: 'ad360-part-2',
        partNumber: 'AD360-002', 
        description: 'Oil Filter',
        price: { amount: 12.50, currency: 'EUR' },
        manufacturer: 'AD360',
        category: 'Engine',
        compatibility: `${reg || 'Vehicle'} - Compatible Parts`
      },
      {
        id: 'ad360-part-3',
        partNumber: 'AD360-003',
        description: 'Air Filter',
        price: { amount: 18.75, currency: 'EUR' },
        manufacturer: 'AD360',
        category: 'Engine',
        compatibility: `${reg || 'Vehicle'} - Compatible Parts`
      },
      {
        id: 'ad360-part-4',
        partNumber: 'AD360-004',
        description: 'Spark Plugs (Set of 4)',
        price: { amount: 32.99, currency: 'EUR' },
        manufacturer: 'AD360',
        category: 'Engine',
        compatibility: `${reg || 'Vehicle'} - Compatible Parts`
      },
      {
        id: 'ad360-part-5',
        partNumber: 'AD360-005',
        description: 'Brake Fluid',
        price: { amount: 8.50, currency: 'EUR' },
        manufacturer: 'AD360',
        category: 'Brakes',
        compatibility: `${reg || 'Vehicle'} - Compatible Parts`
      }
    ];
    
    // Write audit event
    await pool.query(
      'INSERT INTO audit_events (tenant_id, event_type, event_payload) VALUES (?, ?, ?)',
      [tenantId, 'ad360.workflow', JSON.stringify({ 
        action: 'complete_workflow',
        supplierId,
        vehicleId,
        vin,
        reg,
        success: true,
        partsCount: mockParts.length
      })]
    );

    return res.status(200).json({
      status: 'success',
      action: 'complete_workflow',
      message: 'AD360 workflow completed successfully',
      parts: mockParts,
      partsCount: mockParts.length
    });
    
  } catch (error) {
    console.error('Complete workflow error:', error);
    throw error;
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
    // For now, return mock vehicle variants based on the actual vehicle data
    
    console.log('AD360 Vehicle Search:', { vin, reg, supplierId, tenantId });
    
    // Generate vehicle variants based on the actual vehicle data
    // This simulates what AD360 would return for the specific vehicle
    let variants = [];
    
    if (reg) {
      // Extract make and model from license plate or use the registration
      const regUpper = reg.toUpperCase();
      
      // Generate variants based on the vehicle registration
      // In a real implementation, this would come from AD360's database
      variants = [
        {
          id: `${regUpper.toLowerCase().replace(/[^a-z0-9]/g, '')}-variant-1`,
          make: 'Vehicle', // This would be the actual make from AD360
          model: regUpper, // Use registration as model identifier
          version: 'Standard',
          power: 'Unknown',
          displacement: 'Unknown',
          engine: 'Unknown',
          years: 'Current',
          description: `Vehicle variant for ${regUpper}`,
          registration: regUpper,
          vin: vin || 'Unknown'
        }
      ];
      
      // If we have a VIN, add more specific variant
      if (vin) {
        variants.push({
          id: `${regUpper.toLowerCase().replace(/[^a-z0-9]/g, '')}-variant-2`,
          make: 'Vehicle',
          model: `${regUpper} (VIN: ${vin.substring(0, 8)}...)`,
          version: 'VIN Specific',
          power: 'Unknown',
          displacement: 'Unknown',
          engine: 'Unknown',
          years: 'Current',
          description: `VIN-specific variant for ${regUpper}`,
          registration: regUpper,
          vin: vin
        });
      }
    } else if (vin) {
      // Fallback to VIN-only search
      variants = [
        {
          id: `vin-${vin.substring(0, 8).toLowerCase()}-variant-1`,
          make: 'Vehicle',
          model: `VIN: ${vin.substring(0, 8)}...`,
          version: 'VIN Based',
          power: 'Unknown',
          displacement: 'Unknown',
          engine: 'Unknown',
          years: 'Current',
          description: `VIN-based variant for ${vin.substring(0, 8)}...`,
          registration: 'Unknown',
          vin: vin
        }
      ];
    } else {
      // No vehicle data provided
      throw new Error('No vehicle registration or VIN provided');
    }
    
    // Write audit event
    await pool.query(
      'INSERT INTO audit_events (tenant_id, event_type, event_payload) VALUES (?, ?, ?)',
      [tenantId, 'ad360.workflow', JSON.stringify({ 
        action: 'search_vehicle',
        supplierId,
        success: true,
        vin,
        reg,
        variantCount: variants.length,
        variants: variants
      })]
    );

    return res.status(200).json({
      status: 'success',
      action: 'search_vehicle',
      vin,
      reg,
      variants,
      message: `Found ${variants.length} vehicle variant(s) for ${reg || vin}`
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
        { partNumber: 'BOS-005', description: 'Crankshaft Position Sensor', brand: 'BOSCH', price: 45.60, stock: 'In Stock' },
        { partNumber: 'BOS-006', description: 'Camshaft Position Sensor', brand: 'BOSCH', price: 52.30, stock: 'In Stock' },
        
        // Gates Parts
        { partNumber: 'TB-001', description: 'Timing Belt Kit', brand: 'Gates', price: 67.99, stock: '1-2 Days' },
        { partNumber: 'TB-002', description: 'Serpentine Belt', brand: 'Gates', price: 23.45, stock: 'In Stock' },
        { partNumber: 'TB-003', description: 'Tensioner Assembly', brand: 'Gates', price: 45.60, stock: 'In Stock' },
        { partNumber: 'TB-004', description: 'Water Pump', brand: 'Gates', price: 78.90, stock: '2-3 Days' },
        
        // Hella Parts
        { partNumber: '6NU 014 864-681', description: 'Válvula EGR', brand: 'HELLA', price: 78.90, stock: 'In Stock' },
        { partNumber: '6PT 009 109-341', description: 'Sensor, temperatura del aire de admisión', brand: 'HELLA', price: 45.20, stock: 'In Stock' },
        { partNumber: '6PT 009 109-342', description: 'Sensor, temperatura del refrigerante', brand: 'HELLA', price: 38.75, stock: 'In Stock' },
        { partNumber: '6PT 009 109-343', description: 'Sensor, posición arbol de levas', brand: 'HELLA', price: 52.30, stock: 'In Stock' },
        { partNumber: '6PT 009 109-344', description: 'Generador de impulsos, cigüeñal', brand: 'HELLA', price: 67.45, stock: 'In Stock' },
        { partNumber: '6PV 010 946-231', description: 'Sensor, posición pedal', brand: 'HELLA', price: 34.80, stock: 'In Stock' },
        
        // Blue Print Parts
        { partNumber: 'BP-001', description: 'Camshaft Position Sensor', brand: 'BLUE PRINT', price: 41.99, stock: 'In Stock' },
        { partNumber: 'BP-002', description: 'Crankshaft Position Sensor', brand: 'BLUE PRINT', price: 39.50, stock: '2-3 Days' },
        { partNumber: 'BP-003', description: 'Throttle Position Sensor', brand: 'BLUE PRINT', price: 28.75, stock: 'In Stock' },
        { partNumber: 'BP-004', description: 'Engine Mount', brand: 'BLUE PRINT', price: 67.80, stock: 'In Stock' },
        
        // Febi Bilstein Parts
        { partNumber: 'FB-001', description: 'Engine Mount', brand: 'FEBI BILSTEIN', price: 89.99, stock: 'In Stock' },
        { partNumber: 'FB-002', description: 'Transmission Mount', brand: 'FEBI BILSTEIN', price: 67.50, stock: '1-2 Days' },
        { partNumber: 'FB-003', description: 'Stabilizer Bar Link', brand: 'FEBI BILSTEIN', price: 23.80, stock: 'In Stock' },
        { partNumber: 'FB-004', description: 'Control Arm Bushings', brand: 'FEBI BILSTEIN', price: 34.90, stock: 'In Stock' },
        
        // Castrol Parts
        { partNumber: 'CAST-001', description: 'Engine Oil 5W-30', brand: 'Castrol', price: 34.99, stock: 'In Stock' },
        { partNumber: 'CAST-002', description: 'Engine Oil 10W-40', brand: 'Castrol', price: 29.99, stock: 'In Stock' },
        { partNumber: 'CAST-003', description: 'Oil Filter', brand: 'Castrol', price: 12.50, stock: 'In Stock' },
        { partNumber: 'CAST-004', description: 'Engine Oil 0W-20', brand: 'Castrol', price: 39.99, stock: '2-3 Days' },
        
        // Delphi Parts
        { partNumber: 'DEL-001', description: 'Fuel Pump', brand: 'DELPHI', price: 189.99, stock: '3-5 Days' },
        { partNumber: 'DEL-002', description: 'Fuel Filter', brand: 'DELPHI', price: 18.75, stock: 'In Stock' },
        { partNumber: 'DEL-003', description: 'Fuel Pressure Regulator', brand: 'DELPHI', price: 45.60, stock: '1-2 Days' },
        { partNumber: 'DEL-004', description: 'Fuel Injector', brand: 'DELPHI', price: 156.80, stock: '2-3 Days' },
        
        // AJUSA Parts
        { partNumber: 'AJU-001', description: 'Cylinder Head Gasket', brand: 'AJUSA', price: 156.99, stock: '2-3 Days' },
        { partNumber: 'AJU-002', description: 'Valve Cover Gasket', brand: 'AJUSA', price: 23.45, stock: 'In Stock' },
        { partNumber: 'AJU-003', description: 'Intake Manifold Gasket', brand: 'AJUSA', price: 34.80, stock: 'In Stock' },
        { partNumber: 'AJU-004', description: 'Exhaust Manifold Gasket', brand: 'AJUSA', price: 28.90, stock: 'In Stock' },
        
        // FAE Parts
        { partNumber: 'FAE-001', description: 'Clutch Kit', brand: 'FAE', price: 234.99, stock: '3-5 Days' },
        { partNumber: 'FAE-002', description: 'Clutch Cable', brand: 'FAE', price: 28.50, stock: 'In Stock' },
        { partNumber: 'FAE-003', description: 'Clutch Master Cylinder', brand: 'FAE', price: 67.25, stock: '1-2 Days' },
        { partNumber: 'FAE-004', description: 'Clutch Slave Cylinder', brand: 'FAE', price: 45.80, stock: 'In Stock' },
        
        // MANN FILTER Parts
        { partNumber: 'C 24 024', description: 'Filtro de aire', brand: 'MANN FILTER', price: 19.99, stock: 'In Stock' },
        { partNumber: 'HU 6004 x', description: 'Filtro de aceite', brand: 'MANN FILTER', price: 14.50, stock: 'In Stock' },
        { partNumber: 'WK 42/2', description: 'Filtro de combustible', brand: 'MANN FILTER', price: 22.80, stock: 'In Stock' },
        { partNumber: 'C 25 011', description: 'Filtro de habitáculo', brand: 'MANN FILTER', price: 18.90, stock: 'In Stock' },
        
        // PIERBURG Parts
        { partNumber: '7.02318.01.0', description: 'Válvula EGR, control de gases de escape', brand: 'PIERBURG', price: 89.99, stock: '2-3 Days' },
        { partNumber: '7.02318.02.0', description: 'Válvula EGR, motor eléctrico', brand: 'PIERBURG', price: 156.80, stock: 'In Stock' },
        { partNumber: '7.02318.03.0', description: 'Sensor de presión EGR', brand: 'PIERBURG', price: 67.45, stock: 'In Stock' },
        
        // LUK Parts
        { partNumber: '411 0199 10', description: 'Juego tornillos, volante', brand: 'LUK', price: 34.90, stock: 'In Stock' },
        { partNumber: '411 0199 11', description: 'Kit embrague, completo', brand: 'LUK', price: 189.99, stock: '2-3 Days' },
        { partNumber: '411 0199 12', description: 'Volante motor, bimasa', brand: 'LUK', price: 299.99, stock: '3-5 Days' },
        
        // Valeo Parts
        { partNumber: 'VALE-001', description: 'Alternador', brand: 'Valeo', price: 234.99, stock: '2-3 Days' },
        { partNumber: 'VALE-002', description: 'Motor de arranque', brand: 'Valeo', price: 189.80, stock: 'In Stock' },
        { partNumber: 'VALE-003', description: 'Compresor A/C', brand: 'Valeo', price: 456.99, stock: '3-5 Days' },
        
        // SKF Parts
        { partNumber: 'SKF-001', description: 'Rodamiento cigüeñal', brand: 'SKF', price: 89.99, stock: 'In Stock' },
        { partNumber: 'SKF-002', description: 'Rodamiento árbol de levas', brand: 'SKF', price: 67.50, stock: '2-3 Days' },
        { partNumber: 'SKF-003', description: 'Retén aceite', brand: 'SKF', price: 12.80, stock: 'In Stock' },
        
        // SNR Parts
        { partNumber: 'SNR-001', description: 'Rodamiento transmisión', brand: 'SNR', price: 78.90, stock: 'In Stock' },
        { partNumber: 'SNR-002', description: 'Retén transmisión', brand: 'SNR', price: 15.60, stock: 'In Stock' },
        
        // MEYLE Parts
        { partNumber: 'MEYLE-001', description: 'Bujía de precalentamiento', brand: 'MEYLE', price: 23.45, stock: 'In Stock' },
        { partNumber: 'MEYLE-002', description: 'Sensor de temperatura', brand: 'MEYLE', price: 34.80, stock: 'In Stock' },
        
        // Metalcaucho Parts
        { partNumber: 'METAL-001', description: 'Junta de escape', brand: 'Metalcaucho', price: 28.90, stock: 'In Stock' },
        { partNumber: 'METAL-002', description: 'Junta de admisión', brand: 'Metalcaucho', price: 32.50, stock: 'In Stock' },
        
        // PURFLUX Parts
        { partNumber: 'PURF-001', description: 'Filtro de aceite', brand: 'PURFLUX', price: 16.80, stock: 'In Stock' },
        { partNumber: 'PURF-002', description: 'Filtro de aire', brand: 'PURFLUX', price: 21.90, stock: 'In Stock' },
        
        // TRICLO Parts
        { partNumber: 'TRIC-001', description: 'Juego de juntas', brand: 'TRICLO', price: 45.60, stock: 'In Stock' },
        { partNumber: 'TRIC-002', description: 'Juntas de culata', brand: 'TRICLO', price: 67.80, stock: '2-3 Days' },
        
        // LIZARTE Parts
        { partNumber: 'LIZA-001', description: 'Juntas de motor', brand: 'LIZARTE', price: 38.90, stock: 'In Stock' },
        { partNumber: 'LIZA-002', description: 'Juntas de escape', brand: 'LIZARTE', price: 29.80, stock: 'In Stock' },
        
        // MEAT & DORIA Parts
        { partNumber: 'MEAT-001', description: 'Soporte motor', brand: 'MEAT & DORIA', price: 56.70, stock: 'In Stock' },
        { partNumber: 'MEAT-002', description: 'Soporte transmisión', brand: 'MEAT & DORIA', price: 48.90, stock: 'In Stock' },
        
        // GLASER Parts
        { partNumber: 'GLAS-001', description: 'Juntas de culata', brand: 'GLASER', price: 42.30, stock: 'In Stock' },
        { partNumber: 'GLAS-002', description: 'Juntas de escape', brand: 'GLASER', price: 31.80, stock: 'In Stock' },
        
        // CAUTEX Parts
        { partNumber: 'CAUT-001', description: 'Juntas de motor', brand: 'CAUTEX', price: 36.90, stock: 'In Stock' },
        { partNumber: 'CAUT-002', description: 'Juntas de culata', brand: 'CAUTEX', price: 44.50, stock: 'In Stock' }
      ],
      
      brakes: [
        { partNumber: 'BRK-001', description: 'Front Brake Pads', brand: 'BOSCH', price: 45.99, stock: 'In Stock' },
        { partNumber: 'BRK-002', description: 'Rear Brake Pads', brand: 'BOSCH', price: 38.50, stock: 'In Stock' },
        { partNumber: 'BRK-003', description: 'Brake Disc Front', brand: 'BOSCH', price: 67.80, stock: 'In Stock' },
        { partNumber: 'BRK-004', description: 'Brake Disc Rear', brand: 'BOSCH', price: 54.20, stock: 'In Stock' },
        { partNumber: 'BRK-005', description: 'Brake Caliper', brand: 'FEBI BILSTEIN', price: 89.99, stock: '2-3 Days' },
        { partNumber: 'BRK-006', description: 'Brake Hose', brand: 'FEBI BILSTEIN', price: 23.45, stock: 'In Stock' },
        { partNumber: 'BRK-007', description: 'Brake Fluid DOT4', brand: 'Castrol', price: 8.99, stock: 'In Stock' },
        { partNumber: 'BRK-008', description: 'Handbrake Cable', brand: 'AJUSA', price: 34.50, stock: 'In Stock' },
        { partNumber: 'BRK-009', description: 'Brake Master Cylinder', brand: 'BOSCH', price: 156.80, stock: '2-3 Days' },
        { partNumber: 'BRK-010', description: 'Brake Booster', brand: 'BOSCH', price: 234.99, stock: '3-5 Days' },
        { partNumber: 'BRK-011', description: 'ABS Sensor', brand: 'BOSCH', price: 67.90, stock: 'In Stock' },
        { partNumber: 'BRK-012', description: 'Brake Light Switch', brand: 'BOSCH', price: 12.80, stock: 'In Stock' },
        { partNumber: 'BRK-013', description: 'Brake Pads', brand: 'FEBI BILSTEIN', price: 42.30, stock: 'In Stock' },
        { partNumber: 'BRK-014', description: 'Brake Discs', brand: 'FEBI BILSTEIN', price: 78.90, stock: 'In Stock' },
        { partNumber: 'BRK-015', description: 'Brake Fluid DOT5.1', brand: 'Castrol', price: 12.99, stock: 'In Stock' },
        { partNumber: 'BRK-016', description: 'Brake Pads', brand: 'AJUSA', price: 38.70, stock: 'In Stock' },
        { partNumber: 'BRK-017', description: 'Brake Discs', brand: 'AJUSA', price: 65.40, stock: 'In Stock' },
        { partNumber: 'BRK-018', description: 'Brake Caliper Rebuild Kit', brand: 'AJUSA', price: 23.80, stock: 'In Stock' },
        { partNumber: 'BRK-019', description: 'Brake Pads', brand: 'BLUE PRINT', price: 45.60, stock: 'In Stock' },
        { partNumber: 'BRK-020', description: 'Brake Discs', brand: 'BLUE PRINT', price: 72.30, stock: 'In Stock' },
        { partNumber: 'BRK-021', description: 'Brake Pads', brand: 'Gates', price: 39.90, stock: 'In Stock' },
        { partNumber: 'BRK-022', description: 'Brake Discs', brand: 'Gates', price: 68.70, stock: 'In Stock' }
      ],
      
      filters: [
        { partNumber: 'FIL-001', description: 'Air Filter', brand: 'BOSCH', price: 15.99, stock: 'In Stock' },
        { partNumber: 'FIL-002', description: 'Oil Filter', brand: 'BOSCH', price: 12.50, stock: 'In Stock' },
        { partNumber: 'FIL-003', description: 'Fuel Filter', brand: 'BOSCH', price: 18.75, stock: 'In Stock' },
        { partNumber: 'FIL-004', description: 'Cabin Air Filter', brand: 'BOSCH', price: 22.99, stock: 'In Stock' },
        { partNumber: 'FIL-005', description: 'Air Filter', brand: 'MANN FILTER', price: 19.99, stock: 'In Stock' },
        { partNumber: 'FIL-006', description: 'Oil Filter', brand: 'MANN FILTER', price: 14.50, stock: 'In Stock' },
        { partNumber: 'FIL-007', description: 'Fuel Filter', brand: 'MANN FILTER', price: 24.80, stock: 'In Stock' },
        { partNumber: 'FIL-008', description: 'Cabin Air Filter', brand: 'MANN FILTER', price: 28.90, stock: 'In Stock' },
        { partNumber: 'FIL-009', description: 'Air Filter', brand: 'PURFLUX', price: 16.80, stock: 'In Stock' },
        { partNumber: 'FIL-010', description: 'Oil Filter', brand: 'PURFLUX', price: 13.20, stock: 'In Stock' },
        { partNumber: 'FIL-011', description: 'Fuel Filter', brand: 'PURFLUX', price: 20.40, stock: 'In Stock' },
        { partNumber: 'FIL-012', description: 'Cabin Air Filter', brand: 'PURFLUX', price: 25.60, stock: 'In Stock' },
        { partNumber: 'FIL-013', description: 'Air Filter', brand: 'FEBI BILSTEIN', price: 18.90, stock: 'In Stock' },
        { partNumber: 'FIL-014', description: 'Oil Filter', brand: 'FEBI BILSTEIN', price: 15.70, stock: 'In Stock' },
        { partNumber: 'FIL-015', description: 'Fuel Filter', brand: 'FEBI BILSTEIN', price: 22.30, stock: 'In Stock' },
        { partNumber: 'FIL-016', description: 'Cabin Air Filter', brand: 'FEBI BILSTEIN', price: 27.80, stock: 'In Stock' },
        { partNumber: 'FIL-017', description: 'Air Filter', brand: 'BLUE PRINT', price: 17.60, stock: 'In Stock' },
        { partNumber: 'FIL-018', description: 'Oil Filter', brand: 'BLUE PRINT', price: 14.80, stock: 'In Stock' },
        { partNumber: 'FIL-019', description: 'Fuel Filter', brand: 'BLUE PRINT', price: 21.90, stock: 'In Stock' },
        { partNumber: 'FIL-020', description: 'Cabin Air Filter', brand: 'BLUE PRINT', price: 26.40, stock: 'In Stock' },
        { partNumber: 'FIL-021', description: 'Air Filter', brand: 'AJUSA', price: 16.50, stock: 'In Stock' },
        { partNumber: 'FIL-022', description: 'Oil Filter', brand: 'AJUSA', price: 13.90, stock: 'In Stock' },
        { partNumber: 'FIL-023', description: 'Fuel Filter', brand: 'AJUSA', price: 19.80, stock: 'In Stock' },
        { partNumber: 'FIL-024', description: 'Cabin Air Filter', brand: 'AJUSA', price: 24.70, stock: 'In Stock' }
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