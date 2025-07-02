import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import apiHandler from '../../../lib/apiHandler.js';

const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  const bucket = process.env.S3_BUCKET;
  if (!bucket) return res.status(500).json({ error: 'S3_BUCKET not set' });

  const { contentType, file_name } = req.body || {};
  const key = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;

  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType || 'application/octet-stream',
    });
    const url = await getSignedUrl(client, command, { expiresIn: 60 });
    res.status(200).json({ url, key, file_name });
  } catch (err) {
    console.error('UPLOAD_URL_ERROR:', err);
    res.status(500).json({ error: 'Failed to generate URL' });
  }
}

export default apiHandler(handler);
