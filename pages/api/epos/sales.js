import apiHandler from '../../../lib/apiHandler.js';
import { recordSale } from '../../../services/posSalesService.js';
import { addSaleItem } from '../../../services/posSaleItemsService.js';

async function handler(req, res) {
  if (req.method === 'POST') {
    const { session_id, customer_id, vehicle_id, payment_type, total_amount, items } = req.body;
    const sale = await recordSale({ session_id, customer_id, vehicle_id, payment_type, total_amount });
    if (items && Array.isArray(items)) {
      for (const it of items) {
        await addSaleItem({ sale_id: sale.id, part_id: it.part_id, qty: it.qty, unit_price: it.unit_price });
      }
    }
    return res.status(201).json(sale);
  }
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
