import { createPurchaseOrder } from '../../../services/purchaseOrdersService.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
    if (req.method === 'POST') {
      const { order, items } = req.body || {};
      const po = await createPurchaseOrder({ ...order, items });
      return res.status(201).json(po);
    }
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default apiHandler(handler);
