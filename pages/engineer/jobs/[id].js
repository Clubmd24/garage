import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '../../../components/Layout';
import { Card } from '../../../components/Card';

const S3_BASE_URL = `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com`;

export default function EngineerJobPage() {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [status, setStatus] = useState('');
  const [mileage, setMileage] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const [sRes, jRes] = await Promise.all([
          fetch('/api/job-statuses'),
          fetch(`/api/jobs/${id}`)
        ]);
        if (!sRes.ok || !jRes.ok) throw new Error('Failed to load');
        const sData = await sRes.json();
        const jData = await jRes.json();
        setStatuses(Array.isArray(sData) ? sData : []);
        setJob(jData);
        setStatus(jData.status || '');
        setNotes(jData.notes || '');
      } catch (err) {
        setMessage(err.message);
      }
    }
    load();
  }, [id]);

  async function submitMileage(e) {
    e.preventDefault();
    if (!job?.vehicle_id || !mileage) return;
    await fetch('/api/vehicle-mileage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicle_id: job.vehicle_id, mileage: Number(mileage) })
    });
    setMileage('');
    setMessage('Mileage updated');
  }

  async function updateStatus(e) {
    e.preventDefault();
    await fetch(`/api/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setMessage('Status updated');
  }

  async function saveNotes(e) {
    e.preventDefault();
    await fetch(`/api/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes })
    });
    setMessage('Notes saved');
  }

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const r = await fetch('/api/chat/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType: file.type, file_name: file.name })
    });
    if (!r.ok) return;
    const { url, key } = await r.json();
    await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
    await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity_type: 'job', entity_id: id, filename: file.name, url: `${S3_BASE_URL}/${key}` })
    });
    e.target.value = '';
    setMessage('Photo uploaded');
  }

  if (!job) return <Layout><p>Loading…</p></Layout>;

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">Job #{job.id}</h1>
      {message && <p className="mb-4 text-green-500">{message}</p>}
      <Card className="mb-6 space-y-2">
        {job.vehicle && (
          <>
            <p><strong>Plate:</strong> {job.vehicle.licence_plate}</p>
            <p><strong>Make:</strong> {job.vehicle.make}</p>
            <p><strong>Model:</strong> {job.vehicle.model}</p>
            <p><strong>VIN:</strong> {job.vehicle.vin_number}</p>
          </>
        )}
        <p><strong>Defect:</strong> {job.quote?.defect_description || 'N/A'}</p>
      </Card>

      {job.quote?.items?.length ? (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Quote Items</h2>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Part #</th>
                <th className="text-left">Description</th>
                <th className="text-center">Qty</th>
              </tr>
            </thead>
            <tbody>
              {job.quote.items.map(it => (
                <tr key={it.id}>
                  <td>{it.partNumber || '—'}</td>
                  <td>{it.description || it.part_name || '—'}</td>
                  <td className="text-center">{it.qty || it.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : null}

      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Update Mileage</h2>
        <form onSubmit={submitMileage} className="space-x-2">
          <input type="number" value={mileage} onChange={e => setMileage(e.target.value)} className="input w-32" />
          <button type="submit" className="button">Save</button>
        </form>
      </Card>

      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Job Status</h2>
        <form onSubmit={updateStatus} className="space-x-2">
          <select value={status} onChange={e => setStatus(e.target.value)} className="input">
            <option value="">Select…</option>
            {statuses.map(s => (
              <option key={s.id || s.slug || s.name} value={s.name || s.slug}>{s.name}</option>
            ))}
          </select>
          <button type="submit" className="button">Update</button>
        </form>
      </Card>

      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Engineer Notes</h2>
        <form onSubmit={saveNotes} className="space-y-2">
          <textarea className="input w-full h-24" value={notes} onChange={e => setNotes(e.target.value)} />
          <button type="submit" className="button">Save Notes</button>
        </form>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-2">Upload Photo</h2>
        <input type="file" onChange={handleUpload} />
      </Card>
      <p className="mt-6"><Link href="/engineer">&larr; Back</Link></p>
    </Layout>
  );
}
