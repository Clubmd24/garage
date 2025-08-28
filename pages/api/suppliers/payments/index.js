import * as service from '../../../../services/supplierCreditService.js';

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        if (req.query.supplier_id) {
          // Get payment history for specific supplier
          const payments = await service.getSupplierPaymentHistory(
            req.query.supplier_id,
            parseInt(req.query.limit) || 50
          );
          return res.status(200).json(payments);
        } else {
          return res.status(400).json({ error: 'supplier_id is required' });
        }
        
      case 'POST':
        // Create new supplier payment
        const paymentResult = await service.recordSupplierPayment(
          req.body.supplier_id,
          req.body,
          req.body.created_by
        );
        return res.status(201).json(paymentResult);
        
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Supplier payments API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}
