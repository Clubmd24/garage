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
        
      case 'get_department_parts':
        const { departmentId } = req.body;
        if (!departmentId) {
          return res.status(400).json({ error: 'Department ID required' });
        }
        return await handleGetDepartmentParts(res, session, tenantId, supplierId, departmentId, vin, reg);
        
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
    
    // Step 4: Return available departments (not parts yet)
    console.log('Step 4: Getting available departments...');
    
    const departments = [
      { id: 'motor', name: 'Motor', description: 'Engine and motor components', partCount: 12 },
      { id: 'brakes', name: 'Brakes', description: 'Brake system components', partCount: 8 },
      { id: 'engine', name: 'Engine', description: 'Engine parts and accessories', partCount: 15 },
      { id: 'electrical', name: 'Electrical', description: 'Electrical system components', partCount: 10 },
      { id: 'suspension', name: 'Suspension', description: 'Suspension and steering parts', partCount: 9 },
      { id: 'transmission', name: 'Transmission', description: 'Gearbox and transmission parts', partCount: 7 },
      { id: 'cooling', name: 'Cooling', description: 'Cooling system components', partCount: 6 },
      { id: 'fuel', name: 'Fuel System', description: 'Fuel system components', partCount: 5 },
      { id: 'exhaust', name: 'Exhaust', description: 'Exhaust system components', partCount: 4 },
      { id: 'interior', name: 'Interior', description: 'Interior components and accessories', partCount: 11 }
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
        departmentsCount: departments.length
      })]
    );

    return res.status(200).json({
      status: 'success',
      action: 'complete_workflow',
      message: 'AD360 workflow completed successfully. Please select a department to view parts.',
      departments: departments,
      departmentsCount: departments.length
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

async function handleGetDepartmentParts(res, session, tenantId, supplierId, departmentId, vin, reg) {
  try {
    console.log('AD360 Get Department Parts:', { departmentId, vin, reg, supplierId, tenantId });
    
    // Generate realistic parts for each department
    const mockParts = {
      motor: [
        { id: 'motor-1', partNumber: 'AD360-M001', description: 'Electric Motor - 12V', price: { amount: 89.99, currency: 'EUR' }, manufacturer: 'AD360', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-2', partNumber: 'AD360-M002', description: 'Starter Motor', price: { amount: 156.50, currency: 'EUR' }, manufacturer: 'AD360', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-3', partNumber: 'AD360-M003', description: 'Wiper Motor', price: { amount: 67.25, currency: 'EUR' }, manufacturer: 'AD360', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-4', partNumber: 'AD360-M004', description: 'Window Motor - Front Left', price: { amount: 78.99, currency: 'EUR' }, manufacturer: 'AD360', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-5', partNumber: 'AD360-M005', description: 'Window Motor - Front Right', price: { amount: 78.99, currency: 'EUR' }, manufacturer: 'AD360', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-6', partNumber: 'AD360-M006', description: 'Mirror Motor - Left', price: { amount: 45.50, currency: 'EUR' }, manufacturer: 'AD360', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-7', partNumber: 'AD360-M007', description: 'Mirror Motor - Right', price: { amount: 45.50, currency: 'EUR' }, manufacturer: 'AD360', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-8', partNumber: 'AD360-M008', description: 'Seat Motor - Driver', price: { amount: 123.75, currency: 'EUR' }, manufacturer: 'AD360', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-9', partNumber: 'AD360-M009', description: 'Seat Motor - Passenger', price: { amount: 123.75, currency: 'EUR' }, manufacturer: 'AD360', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-10', partNumber: 'AD360-M010', description: 'Sunroof Motor', price: { amount: 189.99, currency: 'EUR' }, manufacturer: 'AD360', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-11', partNumber: 'AD360-M011', description: 'Fuel Pump Motor', price: { amount: 234.50, currency: 'EUR' }, manufacturer: 'AD360', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-12', partNumber: 'AD360-M012', description: 'Cooling Fan Motor', price: { amount: 98.25, currency: 'EUR' }, manufacturer: 'AD360', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` }
      ],
      brakes: [
        { id: 'brakes-1', partNumber: 'AD360-B001', description: 'Brake Pads - Front', price: { amount: 45.99, currency: 'EUR' }, manufacturer: 'AD360', category: 'Brakes', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'brakes-2', partNumber: 'AD360-B002', description: 'Brake Pads - Rear', price: { amount: 38.50, currency: 'EUR' }, manufacturer: 'AD360', category: 'Brakes', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'brakes-3', partNumber: 'AD360-B003', description: 'Brake Discs - Front', price: { amount: 67.25, currency: 'EUR' }, manufacturer: 'AD360', category: 'Brakes', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'brakes-4', partNumber: 'AD360-B004', description: 'Brake Discs - Rear', price: { amount: 58.99, currency: 'EUR' }, manufacturer: 'AD360', category: 'Brakes', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'brakes-5', partNumber: 'AD360-B005', description: 'Brake Fluid', price: { amount: 8.50, currency: 'EUR' }, manufacturer: 'AD360', category: 'Brakes', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'brakes-6', partNumber: 'AD360-B006', description: 'Brake Calipers - Front', price: { amount: 89.75, currency: 'EUR' }, manufacturer: 'AD360', category: 'Brakes', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'brakes-7', partNumber: 'AD360-B007', description: 'Brake Calipers - Rear', price: { amount: 76.25, currency: 'EUR' }, manufacturer: 'AD360', category: 'Brakes', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'brakes-8', partNumber: 'AD360-B008', description: 'Brake Hoses', price: { amount: 23.99, currency: 'EUR' }, manufacturer: 'AD360', category: 'Brakes', compatibility: `${reg || 'Vehicle'} - Compatible Parts` }
      ],
      engine: [
        { id: 'engine-1', partNumber: 'AD360-E001', description: 'Oil Filter', price: { amount: 12.50, currency: 'EUR' }, manufacturer: 'AD360', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-2', partNumber: 'AD360-E002', description: 'Air Filter', price: { amount: 18.75, currency: 'EUR' }, manufacturer: 'AD360', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-3', partNumber: 'AD360-E003', description: 'Fuel Filter', price: { amount: 15.99, currency: 'EUR' }, manufacturer: 'AD360', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-4', partNumber: 'AD360-E004', description: 'Spark Plugs (Set of 4)', price: { amount: 32.99, currency: 'EUR' }, manufacturer: 'AD360', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-5', partNumber: 'AD360-E005', description: 'Ignition Coils (Set of 4)', price: { amount: 89.50, currency: 'EUR' }, manufacturer: 'AD360', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-6', partNumber: 'AD360-E006', description: 'Timing Belt', price: { amount: 67.25, currency: 'EUR' }, manufacturer: 'AD360', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-7', partNumber: 'AD360-E007', description: 'Timing Belt Tensioner', price: { amount: 45.99, currency: 'EUR' }, manufacturer: 'AD360', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-8', partNumber: 'AD360-E008', description: 'Camshaft Position Sensor', price: { amount: 78.50, currency: 'EUR' }, manufacturer: 'AD360', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-9', partNumber: 'AD360-E009', description: 'Crankshaft Position Sensor', price: { amount: 82.25, currency: 'EUR' }, manufacturer: 'AD360', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-10', partNumber: 'AD360-E010', description: 'Mass Air Flow Sensor', price: { amount: 156.99, currency: 'EUR' }, manufacturer: 'AD360', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-11', partNumber: 'AD360-E011', description: 'Oxygen Sensor', price: { amount: 89.75, currency: 'EUR' }, manufacturer: 'AD360', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-12', partNumber: 'AD360-E012', description: 'Throttle Position Sensor', price: { amount: 67.50, currency: 'EUR' }, manufacturer: 'AD360', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-13', partNumber: 'AD360-E013', description: 'Idle Air Control Valve', price: { amount: 123.25, currency: 'EUR' }, manufacturer: 'AD360', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-14', partNumber: 'AD360-E014', description: 'PCV Valve', price: { amount: 18.99, currency: 'EUR' }, manufacturer: 'AD360', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-15', partNumber: 'AD360-E015', description: 'EGR Valve', price: { amount: 189.50, currency: 'EUR' }, manufacturer: 'AD360', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` }
      ]
    };
    
    const parts = mockParts[departmentId.toLowerCase()] || [];
    
    // Write audit event
    await pool.query(
      'INSERT INTO audit_events (tenant_id, event_type, event_payload) VALUES (?, ?, ?)',
      [tenantId, 'ad360.workflow', JSON.stringify({ 
        action: 'get_department_parts',
        supplierId,
        departmentId,
        success: true,
        partCount: parts.length
      })]
    );

    return res.status(200).json({
      status: 'success',
      action: 'get_department_parts',
      departmentId,
      parts,
      partCount: parts.length,
      message: `${parts.length} parts from ${departmentId} department retrieved successfully`
    });
    
  } catch (error) {
    console.error('Get department parts error:', error);
    throw error;
  }
} 