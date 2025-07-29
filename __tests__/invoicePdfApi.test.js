import { jest } from '@jest/globals';

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('invoice pdf endpoint returns PDF', async () => {
  const invoice = { id: 1, customer_id: 2, job_id: 3, amount: 10 };
  const job = { vehicle_id: 'V1', quote: { defect_description: 'd' } };
  const vehicle = { id: 'V1' };
  const buildMock = jest.fn().mockResolvedValue(Buffer.from('PDF'));
  jest.unstable_mockModule('../services/invoicesService.js', () => ({
    getInvoiceById: jest.fn().mockResolvedValue(invoice),
  }));
  jest.unstable_mockModule('../services/companySettingsService.js', () => ({
    getSettings: jest.fn().mockResolvedValue({})
  }));
  jest.unstable_mockModule('../services/clientsService.js', () => ({
    getClientById: jest.fn().mockResolvedValue({})
  }));
  jest.unstable_mockModule('../services/invoiceItemsService.js', () => ({
    getInvoiceItems: jest.fn().mockResolvedValue([])
  }));
  jest.unstable_mockModule('../services/jobsService.js', () => ({
    getJobById: jest.fn().mockResolvedValue(job),
  }));
  jest.unstable_mockModule('../services/vehiclesService.js', () => ({
    getVehicleById: jest.fn().mockResolvedValue(vehicle),
  }));
  jest.unstable_mockModule('../lib/pdf/buildInvoicePdf.js', () => ({
    buildInvoicePdf: buildMock
  }));
  const { default: handler } = await import('../pages/api/invoices/[id]/pdf.js');
  const req = { method: 'GET', query: { id: '1' }, headers: {} };
  const res = { setHeader: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn(), end: jest.fn() };
  await handler(req, res);
  expect(buildMock).toHaveBeenCalledWith(
    expect.objectContaining({
      vehicle,
      defect_description: 'd'
    })
  );
  expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
  expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=invoice-1.pdf');
  expect(res.send).toHaveBeenCalledWith(Buffer.from('PDF'));
});
