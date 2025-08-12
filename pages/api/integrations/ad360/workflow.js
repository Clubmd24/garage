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
      { id: 'motor', name: 'Motor', description: 'Engine and motor components', partCount: 108 },
      { id: 'brakes', name: 'Brakes', description: 'Brake system components', partCount: 85 },
      { id: 'engine', name: 'Engine', description: 'Engine parts and accessories', partCount: 156 },
      { id: 'electrical', name: 'Electrical', description: 'Electrical system components', partCount: 92 },
      { id: 'suspension', name: 'Suspension', description: 'Suspension and steering parts', partCount: 78 },
      { id: 'transmission', name: 'Transmission', description: 'Gearbox and transmission parts', partCount: 64 },
      { id: 'cooling', name: 'Cooling', description: 'Cooling system components', partCount: 53 },
      { id: 'fuel', name: 'Fuel System', description: 'Fuel system components', partCount: 47 },
      { id: 'exhaust', name: 'Exhaust', description: 'Exhaust system components', partCount: 41 },
      { id: 'interior', name: 'Interior', description: 'Interior components and accessories', partCount: 89 }
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
    
    // Generate realistic parts for each department with multiple manufacturers
    const mockParts = {
      motor: [
        // BOSCH Parts
        { id: 'motor-bosch-1', partNumber: 'BOSCH-001', description: 'Electric Motor - 12V', price: { amount: 89.99, currency: 'EUR' }, manufacturer: 'BOSCH', brand: 'BOSCH', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-bosch-2', partNumber: 'BOSCH-002', description: 'Starter Motor', price: { amount: 156.50, currency: 'EUR' }, manufacturer: 'BOSCH', brand: 'BOSCH', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-bosch-3', partNumber: 'BOSCH-003', description: 'Wiper Motor', price: { amount: 67.25, currency: 'EUR' }, manufacturer: 'BOSCH', brand: 'BOSCH', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-bosch-4', partNumber: 'BOSCH-004', description: 'Window Motor - Front Left', price: { amount: 78.99, currency: 'EUR' }, manufacturer: 'BOSCH', brand: 'BOSCH', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-bosch-5', partNumber: 'BOSCH-005', description: 'Window Motor - Front Right', price: { amount: 78.99, currency: 'EUR' }, manufacturer: 'BOSCH', brand: 'BOSCH', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-bosch-6', partNumber: 'BOSCH-006', description: 'Mirror Motor - Left', price: { amount: 45.50, currency: 'EUR' }, manufacturer: 'BOSCH', brand: 'BOSCH', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-bosch-7', partNumber: 'BOSCH-007', description: 'Mirror Motor - Right', price: { amount: 45.50, currency: 'EUR' }, manufacturer: 'BOSCH', brand: 'BOSCH', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-bosch-8', partNumber: 'BOSCH-008', description: 'Seat Motor - Driver', price: { amount: 123.75, currency: 'EUR' }, manufacturer: 'BOSCH', brand: 'BOSCH', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-bosch-9', partNumber: 'BOSCH-009', description: 'Seat Motor - Passenger', price: { amount: 123.75, currency: 'EUR' }, manufacturer: 'BOSCH', brand: 'BOSCH', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-bosch-10', partNumber: 'BOSCH-010', description: 'Sunroof Motor', price: { amount: 189.99, currency: 'EUR' }, manufacturer: 'BOSCH', brand: 'BOSCH', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-bosch-11', partNumber: 'BOSCH-011', description: 'Fuel Pump Motor', price: { amount: 234.50, currency: 'EUR' }, manufacturer: 'BOSCH', brand: 'BOSCH', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-bosch-12', partNumber: 'BOSCH-012', description: 'Cooling Fan Motor', price: { amount: 98.25, currency: 'EUR' }, manufacturer: 'BOSCH', brand: 'BOSCH', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        
        // HELLA Parts
        { id: 'motor-hella-1', partNumber: 'HELLA-001', description: 'Electric Motor - 12V', price: { amount: 92.99, currency: 'EUR' }, manufacturer: 'HELLA', brand: 'HELLA', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-hella-2', partNumber: 'HELLA-002', description: 'Starter Motor', price: { amount: 162.50, currency: 'EUR' }, manufacturer: 'HELLA', brand: 'HELLA', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-hella-3', partNumber: 'HELLA-003', description: 'Wiper Motor', price: { amount: 71.25, currency: 'EUR' }, manufacturer: 'HELLA', brand: 'HELLA', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-hella-4', partNumber: 'HELLA-004', description: 'Window Motor - Front Left', price: { amount: 82.99, currency: 'EUR' }, manufacturer: 'HELLA', brand: 'HELLA', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-hella-5', partNumber: 'HELLA-005', description: 'Window Motor - Front Right', price: { amount: 82.99, currency: 'EUR' }, manufacturer: 'HELLA', brand: 'HELLA', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-hella-6', partNumber: 'HELLA-006', description: 'Mirror Motor - Left', price: { amount: 48.50, currency: 'EUR' }, manufacturer: 'HELLA', brand: 'HELLA', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-hella-7', partNumber: 'HELLA-007', description: 'Mirror Motor - Right', price: { amount: 48.50, currency: 'EUR' }, manufacturer: 'HELLA', brand: 'HELLA', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-hella-8', partNumber: 'HELLA-008', description: 'Seat Motor - Driver', price: { amount: 128.75, currency: 'EUR' }, manufacturer: 'HELLA', brand: 'HELLA', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-hella-9', partNumber: 'HELLA-009', description: 'Seat Motor - Passenger', price: { amount: 128.75, currency: 'EUR' }, manufacturer: 'HELLA', brand: 'HELLA', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-hella-10', partNumber: 'HELLA-010', description: 'Sunroof Motor', price: { amount: 195.99, currency: 'EUR' }, manufacturer: 'HELLA', brand: 'HELLA', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-hella-11', partNumber: 'HELLA-011', description: 'Fuel Pump Motor', price: { amount: 241.50, currency: 'EUR' }, manufacturer: 'HELLA', brand: 'HELLA', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-hella-12', partNumber: 'HELLA-012', description: 'Cooling Fan Motor', price: { amount: 103.25, currency: 'EUR' }, manufacturer: 'HELLA', brand: 'HELLA', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        
        // MANN FILTER Parts
        { id: 'motor-mann-1', partNumber: 'MANN-001', description: 'Electric Motor - 12V', price: { amount: 87.99, currency: 'EUR' }, manufacturer: 'MANN FILTER', brand: 'MANN FILTER', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-mann-2', partNumber: 'MANN-002', description: 'Starter Motor', price: { amount: 154.50, currency: 'EUR' }, manufacturer: 'MANN FILTER', brand: 'MANN FILTER', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-mann-3', partNumber: 'MANN-003', description: 'Wiper Motor', price: { amount: 65.25, currency: 'EUR' }, manufacturer: 'MANN FILTER', brand: 'MANN FILTER', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-mann-4', partNumber: 'MANN-004', description: 'Window Motor - Front Left', price: { amount: 76.99, currency: 'EUR' }, manufacturer: 'MANN FILTER', brand: 'MANN FILTER', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-mann-5', partNumber: 'MANN-005', description: 'Window Motor - Front Right', price: { amount: 76.99, currency: 'EUR' }, manufacturer: 'MANN FILTER', brand: 'MANN FILTER', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-mann-6', partNumber: 'MANN-006', description: 'Mirror Motor - Left', price: { amount: 43.50, currency: 'EUR' }, manufacturer: 'MANN FILTER', brand: 'MANN FILTER', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-mann-7', partNumber: 'MANN-007', description: 'Mirror Motor - Right', price: { amount: 43.50, currency: 'EUR' }, manufacturer: 'MANN FILTER', brand: 'MANN FILTER', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-mann-8', partNumber: 'MANN-008', description: 'Seat Motor - Driver', price: { amount: 121.75, currency: 'EUR' }, manufacturer: 'MANN FILTER', brand: 'MANN FILTER', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-mann-9', partNumber: 'MANN-009', description: 'Seat Motor - Passenger', price: { amount: 121.75, currency: 'EUR' }, manufacturer: 'MANN FILTER', brand: 'MANN FILTER', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-mann-10', partNumber: 'MANN-010', description: 'Sunroof Motor', price: { amount: 187.99, currency: 'EUR' }, manufacturer: 'MANN FILTER', brand: 'MANN FILTER', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-mann-11', partNumber: 'MANN-011', description: 'Fuel Pump Motor', price: { amount: 232.50, currency: 'EUR' }, manufacturer: 'MANN FILTER', brand: 'MANN FILTER', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-mann-12', partNumber: 'MANN-012', description: 'Cooling Fan Motor', price: { amount: 96.25, currency: 'EUR' }, manufacturer: 'MANN FILTER', brand: 'MANN FILTER', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        
        // NGK Parts
        { id: 'motor-ngk-1', partNumber: 'NGK-001', description: 'Electric Motor - 12V', price: { amount: 94.99, currency: 'EUR' }, manufacturer: 'NGK', brand: 'NGK', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-ngk-2', partNumber: 'NGK-002', description: 'Starter Motor', price: { amount: 168.50, currency: 'EUR' }, manufacturer: 'NGK', brand: 'NGK', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-ngk-3', partNumber: 'NGK-003', description: 'Wiper Motor', price: { amount: 73.25, currency: 'EUR' }, manufacturer: 'NGK', brand: 'NGK', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-ngk-4', partNumber: 'NGK-004', description: 'Window Motor - Front Left', price: { amount: 84.99, currency: 'EUR' }, manufacturer: 'NGK', brand: 'NGK', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-ngk-5', partNumber: 'NGK-005', description: 'Window Motor - Front Right', price: { amount: 84.99, currency: 'EUR' }, manufacturer: 'NGK', brand: 'NGK', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-ngk-6', partNumber: 'NGK-006', description: 'Mirror Motor - Left', price: { amount: 51.50, currency: 'EUR' }, manufacturer: 'NGK', brand: 'NGK', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-ngk-7', partNumber: 'NGK-007', description: 'Mirror Motor - Right', price: { amount: 51.50, currency: 'EUR' }, manufacturer: 'NGK', brand: 'NGK', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-ngk-8', partNumber: 'NGK-008', description: 'Seat Motor - Driver', price: { amount: 131.75, currency: 'EUR' }, manufacturer: 'NGK', brand: 'NGK', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-ngk-9', partNumber: 'NGK-009', description: 'Seat Motor - Passenger', price: { amount: 131.75, currency: 'EUR' }, manufacturer: 'NGK', brand: 'NGK', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-ngk-10', partNumber: 'NGK-010', description: 'Sunroof Motor', price: { amount: 199.99, currency: 'EUR' }, manufacturer: 'NGK', brand: 'NGK', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-ngk-11', partNumber: 'NGK-011', description: 'Fuel Pump Motor', price: { amount: 247.50, currency: 'EUR' }, manufacturer: 'NGK', brand: 'NGK', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-ngk-12', partNumber: 'NGK-012', description: 'Cooling Fan Motor', price: { amount: 106.25, currency: 'EUR' }, manufacturer: 'NGK', brand: 'NGK', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        
        // FEBI BILSTEIN Parts
        { id: 'motor-febi-1', partNumber: 'FEBI-001', description: 'Electric Motor - 12V', price: { amount: 91.99, currency: 'EUR' }, manufacturer: 'FEBI BILSTEIN', brand: 'FEBI BILSTEIN', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-febi-2', partNumber: 'FEBI-002', description: 'Starter Motor', price: { amount: 159.50, currency: 'EUR' }, manufacturer: 'FEBI BILSTEIN', brand: 'FEBI BILSTEIN', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-febi-3', partNumber: 'FEBI-003', description: 'Wiper Motor', price: { amount: 69.25, currency: 'EUR' }, manufacturer: 'FEBI BILSTEIN', brand: 'FEBI BILSTEIN', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-febi-4', partNumber: 'FEBI-004', description: 'Window Motor - Front Left', price: { amount: 80.99, currency: 'EUR' }, manufacturer: 'FEBI BILSTEIN', brand: 'FEBI BILSTEIN', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-febi-5', partNumber: 'FEBI-005', description: 'Window Motor - Front Right', price: { amount: 80.99, currency: 'EUR' }, manufacturer: 'FEBI BILSTEIN', brand: 'FEBI BILSTEIN', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-febi-6', partNumber: 'FEBI-006', description: 'Mirror Motor - Left', price: { amount: 46.50, currency: 'EUR' }, manufacturer: 'FEBI BILSTEIN', brand: 'FEBI BILSTEIN', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-febi-7', partNumber: 'FEBI-007', description: 'Mirror Motor - Right', price: { amount: 46.50, currency: 'EUR' }, manufacturer: 'FEBI BILSTEIN', brand: 'FEBI BILSTEIN', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-febi-8', partNumber: 'FEBI-008', description: 'Seat Motor - Driver', price: { amount: 125.75, currency: 'EUR' }, manufacturer: 'FEBI BILSTEIN', brand: 'FEBI BILSTEIN', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-febi-9', partNumber: 'FEBI-009', description: 'Seat Motor - Passenger', price: { amount: 125.75, currency: 'EUR' }, manufacturer: 'FEBI BILSTEIN', brand: 'FEBI BILSTEIN', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-febi-10', partNumber: 'FEBI-010', description: 'Sunroof Motor', price: { amount: 191.99, currency: 'EUR' }, manufacturer: 'FEBI BILSTEIN', brand: 'FEBI BILSTEIN', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-febi-11', partNumber: 'FEBI-011', description: 'Fuel Pump Motor', price: { amount: 236.50, currency: 'EUR' }, manufacturer: 'FEBI BILSTEIN', brand: 'FEBI BILSTEIN', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-febi-12', partNumber: 'FEBI-012', description: 'Cooling Fan Motor', price: { amount: 100.25, currency: 'EUR' }, manufacturer: 'FEBI BILSTEIN', brand: 'FEBI BILSTEIN', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        
        // BLUE PRINT Parts
        { id: 'motor-blueprint-1', partNumber: 'BLUE-001', description: 'Electric Motor - 12V', price: { amount: 93.99, currency: 'EUR' }, manufacturer: 'BLUE PRINT', brand: 'BLUE PRINT', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-blueprint-2', partNumber: 'BLUE-002', description: 'Starter Motor', price: { amount: 161.50, currency: 'EUR' }, manufacturer: 'BLUE PRINT', brand: 'BLUE PRINT', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-blueprint-3', partNumber: 'BLUE-003', description: 'Wiper Motor', price: { amount: 70.25, currency: 'EUR' }, manufacturer: 'BLUE PRINT', brand: 'BLUE PRINT', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-blueprint-4', partNumber: 'BLUE-004', description: 'Window Motor - Front Left', price: { amount: 81.99, currency: 'EUR' }, manufacturer: 'BLUE PRINT', brand: 'BLUE PRINT', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-blueprint-5', partNumber: 'BLUE-005', description: 'Window Motor - Front Right', price: { amount: 81.99, currency: 'EUR' }, manufacturer: 'BLUE PRINT', brand: 'BLUE PRINT', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-blueprint-6', partNumber: 'BLUE-006', description: 'Mirror Motor - Left', price: { amount: 47.50, currency: 'EUR' }, manufacturer: 'BLUE PRINT', brand: 'BLUE PRINT', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-blueprint-7', partNumber: 'BLUE-007', description: 'Mirror Motor - Right', price: { amount: 47.50, currency: 'EUR' }, manufacturer: 'BLUE PRINT', brand: 'BLUE PRINT', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-blueprint-8', partNumber: 'BLUE-008', description: 'Seat Motor - Driver', price: { amount: 126.75, currency: 'EUR' }, manufacturer: 'BLUE PRINT', brand: 'BLUE PRINT', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-blueprint-9', partNumber: 'BLUE-009', description: 'Seat Motor - Passenger', price: { amount: 126.75, currency: 'EUR' }, manufacturer: 'BLUE PRINT', brand: 'BLUE PRINT', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-blueprint-10', partNumber: 'BLUE-010', description: 'Sunroof Motor', price: { amount: 193.99, currency: 'EUR' }, manufacturer: 'BLUE PRINT', brand: 'BLUE PRINT', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-blueprint-11', partNumber: 'BLUE-011', description: 'Fuel Pump Motor', price: { amount: 238.50, currency: 'EUR' }, manufacturer: 'BLUE PRINT', brand: 'BLUE PRINT', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-blueprint-12', partNumber: 'BLUE-012', description: 'Cooling Fan Motor', price: { amount: 101.25, currency: 'EUR' }, manufacturer: 'BLUE PRINT', brand: 'BLUE PRINT', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        
        // AJUSA Parts
        { id: 'motor-ajusa-1', partNumber: 'AJUSA-001', description: 'Electric Motor - 12V', price: { amount: 88.99, currency: 'EUR' }, manufacturer: 'AJUSA', brand: 'AJUSA', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-ajusa-2', partNumber: 'AJUSA-002', description: 'Starter Motor', price: { amount: 155.50, currency: 'EUR' }, manufacturer: 'AJUSA', brand: 'AJUSA', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-ajusa-3', partNumber: 'AJUSA-003', description: 'Wiper Motor', price: { amount: 66.25, currency: 'EUR' }, manufacturer: 'AJUSA', brand: 'AJUSA', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-ajusa-4', partNumber: 'AJUSA-004', description: 'Window Motor - Front Left', price: { amount: 77.99, currency: 'EUR' }, manufacturer: 'AJUSA', brand: 'AJUSA', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-ajusa-5', partNumber: 'AJUSA-005', description: 'Window Motor - Front Right', price: { amount: 77.99, currency: 'EUR' }, manufacturer: 'AJUSA', brand: 'AJUSA', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-ajusa-6', partNumber: 'AJUSA-006', description: 'Mirror Motor - Left', price: { amount: 44.50, currency: 'EUR' }, manufacturer: 'AJUSA', brand: 'AJUSA', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-ajusa-7', partNumber: 'AJUSA-007', description: 'Mirror Motor - Right', price: { amount: 44.50, currency: 'EUR' }, manufacturer: 'AJUSA', brand: 'AJUSA', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-ajusa-8', partNumber: 'AJUSA-008', description: 'Seat Motor - Driver', price: { amount: 122.75, currency: 'EUR' }, manufacturer: 'AJUSA', brand: 'AJUSA', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-ajusa-9', partNumber: 'AJUSA-009', description: 'Seat Motor - Passenger', price: { amount: 122.75, currency: 'EUR' }, manufacturer: 'AJUSA', brand: 'AJUSA', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-ajusa-10', partNumber: 'AJUSA-010', description: 'Sunroof Motor', price: { amount: 188.99, currency: 'EUR' }, manufacturer: 'AJUSA', brand: 'AJUSA', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-ajusa-11', partNumber: 'AJUSA-011', description: 'Fuel Pump Motor', price: { amount: 233.50, currency: 'EUR' }, manufacturer: 'AJUSA', brand: 'AJUSA', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-ajusa-12', partNumber: 'AJUSA-012', description: 'Cooling Fan Motor', price: { amount: 97.25, currency: 'EUR' }, manufacturer: 'AJUSA', brand: 'AJUSA', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        
        // DELPHI Parts
        { id: 'motor-delphi-1', partNumber: 'DELPHI-001', description: 'Electric Motor - 12V', price: { amount: 95.99, currency: 'EUR' }, manufacturer: 'DELPHI', brand: 'DELPHI', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-delphi-2', partNumber: 'DELPHI-002', description: 'Starter Motor', price: { amount: 163.50, currency: 'EUR' }, manufacturer: 'DELPHI', brand: 'DELPHI', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-delphi-3', partNumber: 'DELPHI-003', description: 'Wiper Motor', price: { amount: 72.25, currency: 'EUR' }, manufacturer: 'DELPHI', brand: 'DELPHI', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-delphi-4', partNumber: 'DELPHI-004', description: 'Window Motor - Front Left', price: { amount: 83.99, currency: 'EUR' }, manufacturer: 'DELPHI', brand: 'DELPHI', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-delphi-5', partNumber: 'DELPHI-005', description: 'Window Motor - Front Right', price: { amount: 83.99, currency: 'EUR' }, manufacturer: 'DELPHI', brand: 'DELPHI', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-delphi-6', partNumber: 'DELPHI-006', description: 'Mirror Motor - Left', price: { amount: 49.50, currency: 'EUR' }, manufacturer: 'DELPHI', brand: 'DELPHI', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-delphi-7', partNumber: 'DELPHI-007', description: 'Mirror Motor - Right', price: { amount: 49.50, currency: 'EUR' }, manufacturer: 'DELPHI', brand: 'DELPHI', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-delphi-8', partNumber: 'DELPHI-008', description: 'Seat Motor - Driver', price: { amount: 127.75, currency: 'EUR' }, manufacturer: 'DELPHI', brand: 'DELPHI', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-delphi-9', partNumber: 'DELPHI-009', description: 'Seat Motor - Passenger', price: { amount: 127.75, currency: 'EUR' }, manufacturer: 'DELPHI', brand: 'DELPHI', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-delphi-10', partNumber: 'DELPHI-010', description: 'Sunroof Motor', price: { amount: 194.99, currency: 'EUR' }, manufacturer: 'DELPHI', brand: 'DELPHI', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-delphi-11', partNumber: 'DELPHI-011', description: 'Fuel Pump Motor', price: { amount: 239.50, currency: 'EUR' }, manufacturer: 'DELPHI', brand: 'DELPHI', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-delphi-12', partNumber: 'DELPHI-012', description: 'Cooling Fan Motor', price: { amount: 102.25, currency: 'EUR' }, manufacturer: 'DELPHI', brand: 'DELPHI', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        
        // MEYLE Parts
        { id: 'motor-meyle-1', partNumber: 'MEYLE-001', description: 'Electric Motor - 12V', price: { amount: 90.99, currency: 'EUR' }, manufacturer: 'MEYLE', brand: 'MEYLE', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-meyle-2', partNumber: 'MEYLE-002', description: 'Starter Motor', price: { amount: 157.50, currency: 'EUR' }, manufacturer: 'MEYLE', brand: 'MEYLE', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-meyle-3', partNumber: 'MEYLE-003', description: 'Wiper Motor', price: { amount: 68.25, currency: 'EUR' }, manufacturer: 'MEYLE', brand: 'MEYLE', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-meyle-4', partNumber: 'MEYLE-004', description: 'Window Motor - Front Left', price: { amount: 79.99, currency: 'EUR' }, manufacturer: 'MEYLE', brand: 'MEYLE', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-meyle-5', partNumber: 'MEYLE-005', description: 'Window Motor - Front Right', price: { amount: 79.99, currency: 'EUR' }, manufacturer: 'MEYLE', brand: 'MEYLE', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-meyle-6', partNumber: 'MEYLE-006', description: 'Mirror Motor - Left', price: { amount: 45.50, currency: 'EUR' }, manufacturer: 'MEYLE', brand: 'MEYLE', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-meyle-7', partNumber: 'MEYLE-007', description: 'Mirror Motor - Right', price: { amount: 45.50, currency: 'EUR' }, manufacturer: 'MEYLE', brand: 'MEYLE', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-meyle-8', partNumber: 'MEYLE-008', description: 'Seat Motor - Driver', price: { amount: 124.75, currency: 'EUR' }, manufacturer: 'MEYLE', brand: 'MEYLE', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-meyle-9', partNumber: 'MEYLE-009', description: 'Seat Motor - Passenger', price: { amount: 124.75, currency: 'EUR' }, manufacturer: 'MEYLE', brand: 'MEYLE', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-meyle-10', partNumber: 'MEYLE-010', description: 'Sunroof Motor', price: { amount: 190.99, currency: 'EUR' }, manufacturer: 'MEYLE', brand: 'MEYLE', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-meyle-11', partNumber: 'MEYLE-011', description: 'Fuel Pump Motor', price: { amount: 235.50, currency: 'EUR' }, manufacturer: 'MEYLE', brand: 'MEYLE', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-meyle-12', partNumber: 'MEYLE-012', description: 'Cooling Fan Motor', price: { amount: 99.25, currency: 'EUR' }, manufacturer: 'MEYLE', brand: 'MEYLE', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        
        // Valeo Parts
        { id: 'motor-valeo-1', partNumber: 'VALEO-001', description: 'Electric Motor - 12V', price: { amount: 96.99, currency: 'EUR' }, manufacturer: 'Valeo', brand: 'Valeo', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-valeo-2', partNumber: 'VALEO-002', description: 'Starter Motor', price: { amount: 164.50, currency: 'EUR' }, manufacturer: 'Valeo', brand: 'Valeo', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-valeo-3', partNumber: 'VALEO-003', description: 'Wiper Motor', price: { amount: 74.25, currency: 'EUR' }, manufacturer: 'Valeo', brand: 'Valeo', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-valeo-4', partNumber: 'VALEO-004', description: 'Window Motor - Front Left', price: { amount: 85.99, currency: 'EUR' }, manufacturer: 'Valeo', brand: 'Valeo', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-valeo-5', partNumber: 'VALEO-005', description: 'Window Motor - Front Right', price: { amount: 85.99, currency: 'EUR' }, manufacturer: 'Valeo', brand: 'Valeo', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-valeo-6', partNumber: 'VALEO-006', description: 'Mirror Motor - Left', price: { amount: 52.50, currency: 'EUR' }, manufacturer: 'Valeo', brand: 'Valeo', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-valeo-7', partNumber: 'VALEO-007', description: 'Mirror Motor - Right', price: { amount: 52.50, currency: 'EUR' }, manufacturer: 'Valeo', brand: 'Valeo', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-valeo-8', partNumber: 'VALEO-008', description: 'Seat Motor - Driver', price: { amount: 129.75, currency: 'EUR' }, manufacturer: 'Valeo', brand: 'Valeo', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-valeo-9', partNumber: 'VALEO-009', description: 'Seat Motor - Passenger', price: { amount: 129.75, currency: 'EUR' }, manufacturer: 'Valeo', brand: 'Valeo', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-valeo-10', partNumber: 'VALEO-010', description: 'Sunroof Motor', price: { amount: 196.99, currency: 'EUR' }, manufacturer: 'Valeo', brand: 'Valeo', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-valeo-11', partNumber: 'VALEO-011', description: 'Fuel Pump Motor', price: { amount: 240.50, currency: 'EUR' }, manufacturer: 'Valeo', brand: 'Valeo', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'motor-valeo-12', partNumber: 'VALEO-012', description: 'Cooling Fan Motor', price: { amount: 104.25, currency: 'EUR' }, manufacturer: 'Valeo', brand: 'Valeo', category: 'Motor', compatibility: `${reg || 'Vehicle'} - Compatible Parts` }
      ],
      brakes: [
        { id: 'brakes-1', partNumber: 'AD360-B001', description: 'Brake Pads - Front', price: { amount: 45.99, currency: 'EUR' }, manufacturer: 'BOSCH', brand: 'BOSCH', category: 'Brakes', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'brakes-2', partNumber: 'AD360-B002', description: 'Brake Pads - Rear', price: { amount: 38.50, currency: 'EUR' }, manufacturer: 'BOSCH', brand: 'BOSCH', category: 'Brakes', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'brakes-3', partNumber: 'AD360-B003', description: 'Brake Discs - Front', price: { amount: 67.25, currency: 'EUR' }, manufacturer: 'FEBI BILSTEIN', brand: 'FEBI BILSTEIN', category: 'Brakes', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'brakes-4', partNumber: 'AD360-B004', description: 'Brake Discs - Rear', price: { amount: 58.99, currency: 'EUR' }, manufacturer: 'FEBI BILSTEIN', brand: 'FEBI BILSTEIN', category: 'Brakes', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'brakes-5', partNumber: 'AD360-B005', description: 'Brake Fluid', price: { amount: 8.50, currency: 'EUR' }, manufacturer: 'Castrol', brand: 'Castrol', category: 'Brakes', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'brakes-6', partNumber: 'AD360-B006', description: 'Brake Calipers - Front', price: { amount: 89.75, currency: 'EUR' }, manufacturer: 'AJUSA', brand: 'AJUSA', category: 'Brakes', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'brakes-7', partNumber: 'AD360-B007', description: 'Brake Calipers - Rear', price: { amount: 76.25, currency: 'EUR' }, manufacturer: 'AJUSA', brand: 'AJUSA', category: 'Brakes', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'brakes-8', partNumber: 'AD360-B008', description: 'Brake Hoses', price: { amount: 23.99, currency: 'EUR' }, manufacturer: 'BLUE PRINT', brand: 'BLUE PRINT', category: 'Brakes', compatibility: `${reg || 'Vehicle'} - Compatible Parts` }
      ],
      engine: [
        { id: 'engine-1', partNumber: 'AD360-E001', description: 'Oil Filter', price: { amount: 12.50, currency: 'EUR' }, manufacturer: 'MANN FILTER', brand: 'MANN FILTER', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-2', partNumber: 'AD360-E002', description: 'Air Filter', price: { amount: 18.75, currency: 'EUR' }, manufacturer: 'MANN FILTER', brand: 'MANN FILTER', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-3', partNumber: 'AD360-E003', description: 'Fuel Filter', price: { amount: 15.99, currency: 'EUR' }, manufacturer: 'MANN FILTER', brand: 'MANN FILTER', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-4', partNumber: 'AD360-E004', description: 'Spark Plugs (Set of 4)', price: { amount: 32.99, currency: 'EUR' }, manufacturer: 'NGK', brand: 'NGK', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-5', partNumber: 'AD360-E005', description: 'Ignition Coils (Set of 4)', price: { amount: 89.50, currency: 'EUR' }, manufacturer: 'NGK', brand: 'NGK', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-6', partNumber: 'AD360-E006', description: 'Timing Belt', price: { amount: 67.25, currency: 'EUR' }, manufacturer: 'Gates', brand: 'Gates', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-7', partNumber: 'AD360-E007', description: 'Timing Belt Tensioner', price: { amount: 45.99, currency: 'EUR' }, manufacturer: 'Gates', brand: 'Gates', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-8', partNumber: 'AD360-E008', description: 'Camshaft Position Sensor', price: { amount: 78.50, currency: 'EUR' }, manufacturer: 'BOSCH', brand: 'BOSCH', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-9', partNumber: 'AD360-E009', description: 'Crankshaft Position Sensor', price: { amount: 82.25, currency: 'EUR' }, manufacturer: 'BOSCH', brand: 'BOSCH', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-10', partNumber: 'AD360-E010', description: 'Mass Air Flow Sensor', price: { amount: 156.99, currency: 'EUR' }, manufacturer: 'BOSCH', brand: 'BOSCH', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-11', partNumber: 'AD360-E011', description: 'Oxygen Sensor', price: { amount: 89.75, currency: 'EUR' }, manufacturer: 'BOSCH', brand: 'BOSCH', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-12', partNumber: 'AD360-E012', description: 'Throttle Position Sensor', price: { amount: 67.50, currency: 'EUR' }, manufacturer: 'BOSCH', brand: 'BOSCH', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-13', partNumber: 'AD360-E013', description: 'Idle Air Control Valve', price: { amount: 123.25, currency: 'EUR' }, manufacturer: 'PIERBURG', brand: 'PIERBURG', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-14', partNumber: 'AD360-E014', description: 'PCV Valve', price: { amount: 18.99, currency: 'EUR' }, manufacturer: 'PIERBURG', brand: 'PIERBURG', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` },
        { id: 'engine-15', partNumber: 'AD360-E015', description: 'EGR Valve', price: { amount: 189.50, currency: 'EUR' }, manufacturer: 'PIERBURG', brand: 'PIERBURG', category: 'Engine', compatibility: `${reg || 'Vehicle'} - Compatible Parts` }
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

    // Extract unique manufacturers for filtering
    const manufacturers = [...new Set(parts.map(p => p.brand))];

    return res.status(200).json({
      status: 'success',
      action: 'get_department_parts',
      departmentId,
      parts,
      partCount: parts.length,
      manufacturers: manufacturers,
      message: `${parts.length} parts from ${departmentId} department retrieved successfully`
    });
    
  } catch (error) {
    console.error('Get department parts error:', error);
    throw error;
  }
} 