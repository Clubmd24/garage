import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import OfficeLayout from '../../../../components/OfficeLayout';
import { Card } from '../../../../components/Card';
import { fetchVehicles } from '../../../../lib/vehicles';
import { fetchDocuments } from '../../../../lib/documents';

export default function ClientViewPage() {
  const router = useRouter();
  const { id } = router.query;
  const [client, setClient] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const res = await fetch(`/api/clients/${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setClient(data);
        const vs = await fetchVehicles(id);
        setVehicles(vs);
        const docs = await fetchDocuments('client', id);
        setDocuments(docs);
        const qs = await fetch(`/api/quotes?customer_id=${id}`).then(r => r.json());
        setQuotes(qs);
      } catch (err) {
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const deleteClient = async () => {
    if (!confirm('Delete this client?')) return;
    await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    router.push('/office/clients');
  };

  const deleteVehicle = async (vid) => {
    if (!confirm('Delete this vehicle?')) return;
    await fetch(`/api/vehicles/${vid}`, { method: 'DELETE' });
    const vs = await fetchVehicles(id);
    setVehicles(vs);
  };

  if (loading) return <OfficeLayout><p>Loading…</p></OfficeLayout>;
  if (error) return <OfficeLayout><p className="text-red-500">{error}</p></OfficeLayout>;

  return (
    <OfficeLayout>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Link href={`/office/clients/${id}`}><a className="button">Edit Client</a></Link>
        <button onClick={deleteClient} className="button bg-red-600 hover:bg-red-700">Delete Client</button>
        <Link href="/office/clients"><a className="button">Back to Clients</a></Link>
      </div>
      {client.pin && (
        <p className="mb-4 font-semibold">PIN: {client.pin}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Client Info</h2>
          <p><strong>Name:</strong> {client.first_name} {client.last_name}</p>
          <p><strong>Email:</strong> {client.email}</p>
          <p><strong>Mobile:</strong> {client.mobile}</p>
          <p><strong>Landline:</strong> {client.landline}</p>
          <p><strong>NIE Number:</strong> {client.nie_number}</p>
          {client.pin && (
            <p><strong>PIN:</strong> {client.pin}</p>
          )}
          <p><strong>Address:</strong> {client.street_address}, {client.town}, {client.province} {client.post_code}</p>
        </Card>
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Vehicles</h2>
            <Link href={`/office/vehicles/new?customer_id=${id}`}><a className="underline">Add Vehicle</a></Link>
          </div>
          {vehicles.length === 0 ? (
            <p>No vehicles</p>
          ) : (
            <div className="space-y-4">
              {vehicles.map(v => (
                <div key={v.id} className="p-4 bg-[var(--color-bg)] rounded-xl shadow flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{v.licence_plate}</p>
                    <p className="text-sm">{v.make} {v.model}</p>
                    <p className="text-sm">{v.color}</p>
                  </div>
                  <div className="space-x-2">
                    <Link href={`/office/vehicles/${v.id}`}> <a className="underline text-sm">Edit</a> </Link>
                    <button onClick={() => deleteVehicle(v.id)} className="underline text-red-600 text-sm">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <h2 className="text-xl font-semibold mb-4">Documents</h2>
          {documents.length === 0 ? (
            <p>No documents</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {documents.map(doc => (
                <li key={doc.id}>
                  <a href={doc.url} className="underline text-blue-600" download>
                    {doc.filename}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="text-xl font-semibold mb-4">Quotes</h2>
          {quotes.length === 0 ? (
            <p>No quotes</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {quotes.map(q => (
                <li key={q.id}>
                  <Link href={`/office/quotations/${q.id}/edit`}>
                    <a className="underline">Quote #{q.id} - {q.status}</a>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </OfficeLayout>
  );
}
