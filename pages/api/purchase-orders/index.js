import { createPurchaseOrder, addPurchaseOrderItem } from '../../../services/purchaseOrdersService.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { order, items } = req.body || {};
      const po = await createPurchaseOrder(order);
      if (items && Array.isArray(items)) {
        for (const it of items) {
          await addPurchaseOrderItem({ purchase_order_id: po.id, ...it });
        }
      }
      return res.status(201).json(po);
    }
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
