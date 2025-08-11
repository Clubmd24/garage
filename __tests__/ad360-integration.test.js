import { jest, describe, it, beforeEach, expect } from '@jest/globals';
import { createMocks } from 'node-mocks-http';

// Mock the database pool
jest.unstable_mockModule('../lib/db.js', () => ({
  default: {
    query: jest.fn()
  }
}));

// Mock the crypto vault
jest.unstable_mockModule('../lib/cryptoVault.js', () => ({
  encryptJSON: jest.fn((data) => `encrypted_${JSON.stringify(data)}`),
  decryptJSON: jest.fn((data) => JSON.parse(data.replace('encrypted_', '')))
}));

// Mock the worker
jest.unstable_mockModule('../scrapers/ad360/worker.js', () => ({
  fetchPartsForVehicle: jest.fn()
}));

describe('AD360 Integration Tests', () => {
  let mockPool;
  let handler, linkHandler, fetchHandler;

  beforeEach(async () => {
    // Import the mocked modules
    const dbModule = await import('../lib/db.js');
    mockPool = dbModule.default;
    mockPool.query.mockClear();

    // Import the handlers
    handler = (await import('../pages/api/integrations/ad360/workflow.js')).default;
    linkHandler = (await import('../pages/api/integrations/ad360/link.js')).default;
    fetchHandler = (await import('../pages/api/integrations/ad360/fetch-for-vehicle.js')).default;
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('AD360 Link API', () => {
    it('should successfully link AD360 account', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          tenantId: 1,
          supplierId: 7,
          username: 'testuser',
          password: 'testpass',
          consent: true
        }
      });

      mockPool.query.mockResolvedValueOnce([[]]); // No existing account
      mockPool.query.mockResolvedValueOnce([{ insertId: 1 }]); // Insert account
      mockPool.query.mockResolvedValueOnce([{ insertId: 1 }]); // Audit event

      await linkHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.status).toBe('linked');
      expect(data.workflow).toBeDefined();
      expect(data.workflow.distributor).toBe('AD Vicente');
      expect(data.workflow.defaultTab).toBe('REPLACEMENT');
    });

    it('should reject without consent', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          tenantId: 1,
          supplierId: 7,
          username: 'testuser',
          password: 'testpass',
          consent: false
        }
      });

      await linkHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain('consent');
    });
  });

  describe('AD360 Workflow API', () => {
    beforeEach(() => {
      // Mock existing session
      mockPool.query.mockResolvedValueOnce([{
        encrypted_session: 'encrypted_{"username":"testuser","status":"active"}'
      }]);
    });

    it('should handle distributor selection', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          tenantId: 1,
          supplierId: 7,
          action: 'select_distributor'
        }
      });

      mockPool.query.mockResolvedValueOnce([{ insertId: 1 }]); // Audit event

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.action).toBe('select_distributor');
      expect(data.distributor).toBe('AD Vicente');
    });

    it('should handle tab navigation', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          tenantId: 1,
          supplierId: 7,
          action: 'navigate_tab'
        }
      });

      mockPool.query.mockResolvedValueOnce([{ insertId: 1 }]); // Audit event

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.action).toBe('navigate_tab');
      expect(data.tab).toBe('REPLACEMENT');
    });

    it('should handle vehicle search', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          tenantId: 1,
          supplierId: 7,
          action: 'search_vehicle',
          vin: 'WVWZZZ1KZAW123456',
          reg: 'ABC123'
        }
      });

      mockPool.query.mockResolvedValueOnce([{ insertId: 1 }]); // Audit event

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.action).toBe('search_vehicle');
      expect(data.vin).toBe('WVWZZZ1KZAW123456');
      expect(data.reg).toBe('ABC123');
    });

    it('should return parts departments', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          tenantId: 1,
          supplierId: 7,
          action: 'get_parts_departments'
        }
      });

      mockPool.query.mockResolvedValueOnce([{ insertId: 1 }]); // Audit event

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.action).toBe('get_parts_departments');
      expect(data.departments).toBeDefined();
      expect(data.departments.length).toBeGreaterThan(0);
      
      // Check for specific departments from screenshot
      const brakeDept = data.departments.find(d => d.name === 'Brakes');
      expect(brakeDept).toBeDefined();
      expect(brakeDept.highlighted).toBe(true);
    });

    it('should return department parts', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          tenantId: 1,
          supplierId: 7,
          action: 'get_department_parts',
          department: 'Brakes'
        }
      });

      mockPool.query.mockResolvedValueOnce([{ insertId: 1 }]); // Audit event

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.action).toBe('get_department_parts');
      expect(data.department).toBe('Brakes');
      expect(data.parts).toBeDefined();
      expect(data.parts.length).toBeGreaterThan(0);
      
      // Check for brake parts
      const brakePads = data.parts.find(p => p.description.includes('Brake Pads'));
      expect(brakePads).toBeDefined();
      expect(brakePads.brand).toBe('Brembo');
    });

    it('should reject invalid actions', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          tenantId: 1,
          supplierId: 7,
          action: 'invalid_action'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain('Invalid action');
    });

    it('should require vehicle info for search', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          tenantId: 1,
          supplierId: 7,
          action: 'search_vehicle'
          // Missing vin and reg
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain('Vehicle VIN or registration required');
    });

    it('should require department for parts', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          tenantId: 1,
          supplierId: 7,
          action: 'get_department_parts'
          // Missing department
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain('Department name required');
    });
  });

  describe('AD360 Fetch API', () => {
    beforeEach(() => {
      // Mock vehicle data
      mockPool.query.mockResolvedValueOnce([{
        vin_number: 'WVWZZZ1KZAW123456',
        licence_plate: 'ABC123'
      }]);
      
      // Mock no cached data
      mockPool.query.mockResolvedValueOnce([]);
    });

    it('should fetch parts using complete workflow', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          tenantId: 1,
          supplierId: 7,
          vehicleId: 123
        }
      });

      // Mock successful parts fetch
      const mockParts = [
        { partNumber: 'BP-001', description: 'Front Brake Pads', brand: 'Brembo', price: 45.99 }
      ];

      const workerModule = await import('../scrapers/ad360/worker.js');
      workerModule.fetchPartsForVehicle.mockResolvedValue(mockParts);

      mockPool.query.mockResolvedValueOnce([{ insertId: 1 }]); // Cache insert
      mockPool.query.mockResolvedValueOnce([{ insertId: 1 }]); // Audit event

      await fetchHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.items).toEqual(mockParts);
      expect(data.mode).toBe('live');
      expect(data.workflow).toBe('complete');
    });

    it('should handle session expiry', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          tenantId: 1,
          supplierId: 7,
          vehicleId: 123
        }
      });

      const workerModule = await import('../scrapers/ad360/worker.js');
      workerModule.fetchPartsForVehicle.mockRejectedValue(new Error('NEEDS_RELINK'));

      mockPool.query.mockResolvedValueOnce([{ insertId: 1 }]); // Audit event

      await fetchHandler(req, res);

      expect(res._getStatusCode()).toBe(409);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('NEEDS_RELINK');
      expect(data.message).toContain('session expired');
    });
  });

  describe('Workflow Integration', () => {
    it('should follow complete AD360 workflow', async () => {
      // Test the complete workflow sequence
      const workflowSteps = [
        'select_distributor',
        'navigate_tab', 
        'search_vehicle',
        'get_parts_departments',
        'get_department_parts'
      ];

      for (const step of workflowSteps) {
        const { req, res } = createMocks({
          method: 'POST',
          body: {
            tenantId: 1,
            supplierId: 7,
            action: step,
            ...(step === 'search_vehicle' && { vin: 'TEST123', reg: 'ABC123' }),
            ...(step === 'get_department_parts' && { department: 'Brakes' })
          }
        });

        // Mock session for each step
        mockPool.query.mockResolvedValueOnce([{
          encrypted_session: 'encrypted_{"username":"testuser","status":"active"}'
        }]);
        
        // Mock audit event
        mockPool.query.mockResolvedValueOnce([{ insertId: 1 }]);

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());
        expect(data.status).toBe('success');
        expect(data.action).toBe(step);
      }
    });
  });
}); 