import { getDocuments, createDocument } from '../../../services/documentsService.js';

export default async function handler(req, res) {
  const entity_type = req.query.entity_type || req.body.entity_type;
  const entity_id = req.query.entity_id || req.body.entity_id;

  if (req.method === 'GET') {
    if (!entity_type || !entity_id) {
      return res.status(400).json({ error: 'entity_type and entity_id required' });
    }
    try {
      const docs = await getDocuments(entity_type, entity_id);
      return res.status(200).json(docs);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  if (req.method === 'POST') {
    const { filename, url } = req.body || {};
    if (!entity_type || !entity_id || !filename || !url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
      const doc = await createDocument({ entity_type, entity_id, filename, url });
      return res.status(201).json(doc);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
