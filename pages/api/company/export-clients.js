import { getClientsWithVehicles } from '../../../services/clientsService.js';
import { utils, write } from '../../../lib/simpleXlsx.js';
import apiHandler from '../../../lib/apiHandler.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const data = await getClientsWithVehicles();
  const wb = utils.book_new();
  const ws = utils.json_to_sheet(data);
  utils.book_append_sheet(wb, ws);
  const buffer = write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', 'attachment; filename=clients.xlsx');
  res.send(buffer);
}

export default apiHandler(handler);
