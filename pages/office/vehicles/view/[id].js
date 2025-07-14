import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import OfficeLayout from '../../../../components/OfficeLayout';
import { Card } from '../../../../components/Card';
import { fetchDocuments } from '../../../../lib/documents';

export default function VehicleViewPage() {
  const router = useRouter();
  const { id } = router.query;
  const [vehicle, setVehicle] = useState(null);
  const [client, setClient] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [fleet, setFleet] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [mileage, setMileage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const vRes = await fetch(`/api/vehicles/${id}`);
        if (!vRes.ok) throw new Error();
        const v = await vRes.json();
        setVehicle(v);
        if (v.customer_id) {
          const cRes = await fetch(`/api/clients/${v.customer_id}`);
          if (!cRes.ok) throw new Error();
          setClient(await cRes.json());
        }
        if (v.fleet_id) {
          const fRes = await fetch(`/api/fleets/${v.fleet_id}`);
          if (!fRes.ok) throw new Error();
          setFleet(await fRes.json());
        }
        const docs = await fetchDocuments('vehicle', id);
        setDocuments(docs);
        const qs = await fetch(`/api/quotes?vehicle_id=${id}`).then(r => r.json());
        setQuotes(qs);
        const ms = await fetch(`/api/vehicle-mileage?vehicle_id=${id}`).then(r => r.json());
        setMileage(ms);
      } catch (err) {
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const deleteVehicle = async () => {
    if (!confirm('Delete this vehicle?')) return;
    await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
    router.push('/office/vehicles');
  };

  if (loading) return <OfficeLayout><p>Loading…</p></OfficeLayout>;
  if (error) return <OfficeLayout><p className="text-red-500">{error}</p></OfficeLayout>;

  return (
    <OfficeLayout>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Link href={`/office/vehicles/${id}`} className="button">Edit Vehicle</Link>
        {client && (
          <Link href={`/office/clients/${client.id}`} className="button">Edit Client</Link>
        )}
        <Link href={`/office/quotations/new?vehicle_id=${id}`} className="button">New Quote</Link>
        <Link href={`/office/jobs/new?vehicle_id=${id}`} className="button">New Job</Link>
        <button onClick={deleteVehicle} className="button bg-red-600 hover:bg-red-700">Delete</button>
        <Link href="/office/vehicles" className="button">Back to Vehicles</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Client Info</h2>
          {client ? (
            <>
              <p><strong>Name:</strong> {client.first_name} {client.last_name}</p>
              <p><strong>Email:</strong> {client.email}</p>
              <p><strong>Mobile:</strong> {client.mobile}</p>
              <p><strong>Landline:</strong> {client.landline}</p>
              <p><strong>NIE Number:</strong> {client.nie_number}</p>
              <p><strong>Address:</strong> {client.street_address}, {client.town}, {client.province} {client.post_code}</p>
            </>
          ) : (
            <p>No client assigned</p>
          )}
        </Card>
        <Card>
          <h2 className="text-xl font-semibold mb-4">Vehicle Info</h2>
          <p><strong>Plate:</strong> {vehicle.licence_plate}</p>
          <p><strong>Make:</strong> {vehicle.make}</p>
          <p><strong>Model:</strong> {vehicle.model}</p>
          <p><strong>Color:</strong> {vehicle.color}</p>
          <p><strong>VIN:</strong> {vehicle.vin_number}</p>
          <p><strong>Service Date:</strong> {vehicle.service_date || 'N/A'}</p>
          <p><strong>ITV Date:</strong> {vehicle.itv_date || 'N/A'}</p>
          <p><strong>Fleet:</strong> {fleet ? fleet.company_name : (vehicle.fleet_id || 'N/A')}</p>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold mb-4">Mileage History</h2>
          {mileage.length === 0 ? (
            <p>No entries</p>
          ) : (
            <table className="min-w-full bg-white border text-black">
              <thead>
                <tr>
                  <th className="px-2 py-1 border">Date</th>
                  <th className="px-2 py-1 border">Mileage</th>
                </tr>
              </thead>
              <tbody>
                {mileage.map(m => (
                  <tr key={m.id}>
                    <td className="px-2 py-1 border">{new Date(m.recorded_at).toLocaleDateString()}</td>
                    <td className="px-2 py-1 border">{m.mileage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
