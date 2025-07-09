import { updatePurchaseOrder, getPurchaseOrderById } from '../../../../services/purchaseOrdersService.js';
import { updateJob } from '../../../../services/jobsService.js';
import apiHandler from '../../../../lib/apiHandler.js';

async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'POST') {
      await updatePurchaseOrder(id, { status: 'awaiting supplier quote' });
      if (getPurchaseOrderById && updateJob) {
        const po = await getPurchaseOrderById(id);
        if (po?.job_id) {
          await updateJob(po.job_id, { status: 'awaiting supplier information' });
        }
      }
      return res.status(200).json({ ok: true });
    }
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default apiHandler(handler);
