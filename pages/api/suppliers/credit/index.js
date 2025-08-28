import * as service from '../../../../services/supplierCreditService.js';

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        if (req.query.supplier_id) {
          // Get credit balance for specific supplier
          const balance = await service.getSupplierCreditBalance(req.query.supplier_id);
          return res.status(200).json(balance);
        } else if (req.query.summary) {
          // Get credit summary for dashboard
          const summary = await service.getCreditSummary();
          return res.status(200).json(summary);
        } else {
          // Get all suppliers with credit info
          const suppliers = await service.getAllSuppliersWithCredit();
          return res.status(200).json(suppliers);
        }
        
      case 'POST':
        if (req.query.action === 'payment') {
          // Record supplier payment
          const paymentResult = await service.recordSupplierPayment(
            req.body.supplier_id,
            req.body.payment_data,
            req.body.created_by
          );
          return res.status(201).json(paymentResult);
        } else if (req.query.action === 'calculate_existing') {
          // Calculate existing credit usage from historical data
          const result = await service.calculateExistingCreditUsage();
          return res.status(200).json(result);
        } else {
          // Record credit usage
          const result = await service.recordCreditUsage(
            req.body.supplier_id,
            req.body.amount,
            req.body.reference_type,
            req.body.reference_id,
            req.body.description,
            req.body.created_by
          );
          return res.status(201).json(result);
        }
        
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Supplier credit API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}
